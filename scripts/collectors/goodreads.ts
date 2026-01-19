/**
 * Goodreads collector with polite fetching and HTML parsing
 * Based on Ajay Misra's implementation: https://github.com/ajaymisraa/personal-website-features/blob/main/cleaned-goodreads.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { RawBook } from './types.js';

/**
 * Polite fetch with exponential backoff and jitter
 * Based on Ajay's implementation
 */
async function politeFetch(
  url: string,
  retries: number = 3
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429 || error.response?.status === 403) {
        // Rate limited - wait with exponential backoff + jitter
        const waitTime = Math.pow(2, i) + Math.random();
        console.log(`Rate limited. Waiting ${waitTime.toFixed(2)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        continue;
      }

      if (i === retries - 1) {
        console.error(`Failed to fetch ${url} after ${retries} retries:`, error.message);
        return null;
      }
      
      const waitTime = Math.pow(2, i) + Math.random();
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
  }
  return null;
}

/**
 * Normalize text for comparison (removes articles, special chars, etc.)
 * Based on Ajay's implementation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '') // Remove leading articles
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Normalize cover URLs (removes size parameters)
 * Based on Ajay's implementation
 */
function normalizeCoverUrl(url: string): string {
  return url.replace(/_S[XY]\d+_/g, '').replace(/\.{2,}/g, '.');
}

/**
 * Format author names from "Last, First" to "First Last"
 * Based on Ajay's implementation
 */
function formatAuthorName(author: string): string {
  if (author.includes(',')) {
    const parts = author.split(',').map(s => s.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
  }
  return author;
}

/**
 * Scrape books from Goodreads HTML
 * Based on Ajay's implementation: https://github.com/ajaymisraa/personal-website-features/blob/main/cleaned-goodreads.ts
 */
function scrapeBooks(html: string, status: 'read' | 'currently-reading'): RawBook[] {
  const $ = cheerio.load(html);
  const books: RawBook[] = [];

  // Try multiple selector patterns (Goodreads HTML structure can vary)
  const selectors = [
    '#booksBody tr', // Standard table format
    'tbody tr', // Alternative table format
    '.bookalike', // Grid format
    '.bookContainer', // Another grid format
  ];

  let foundElements = false;

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      foundElements = true;
      
      // Try multiple ways to extract title
      const title = 
        $(element).find('.field.title .value a').attr('title') ||
        $(element).find('.field.title a').attr('title') ||
        $(element).find('a[href*="/book/show/"]').attr('title') ||
        $(element).find('.bookTitle').text().trim() ||
        $(element).find('a.bookTitle').text().trim() ||
        '';

      // Try multiple ways to extract author
      const author = 
        $(element).find('.field.author .value a').text().trim() ||
        $(element).find('.field.author a').text().trim() ||
        $(element).find('a[href*="/author/show/"]').text().trim() ||
        $(element).find('.authorName').text().trim() ||
        $(element).find('a.authorName').text().trim() ||
        '';

      // Try multiple ways to extract cover
      const cover = 
        $(element).find('.field.cover .value img').attr('src') ||
        $(element).find('.field.cover img').attr('src') ||
        $(element).find('img[src*="goodreads.com"]').attr('src') ||
        $(element).find('.bookCover img').attr('src') ||
        '';

      if (title && author) {
        books.push({
          title: title.trim(),
          author: formatAuthorName(author.trim()),
          coverUrl: cover ? normalizeCoverUrl(cover) : undefined,
          source: 'goodreads',
          status: status,
          tags: [],
        });
      }
    });

    if (books.length > 0) {
      break; // Found books with this selector, no need to try others
    }
  }

  if (!foundElements) {
    console.warn(`   ⚠ No book elements found in Goodreads HTML. The page structure may have changed.`);
  }

  return books;
}

/**
 * Get numeric user ID from username/profile URL
 * Goodreads review/list endpoint requires numeric ID, not username
 */
async function getNumericUserId(usernameOrId: string): Promise<string | null> {
  // If it's already numeric, return as-is
  if (/^\d+$/.test(usernameOrId)) {
    return usernameOrId;
  }

  // Try to fetch the user profile page to get numeric ID
  const profileUrl = `https://www.goodreads.com/user/show/${usernameOrId}`;
  const html = await politeFetch(profileUrl);
  
  if (!html) {
    return null;
  }

  // Extract numeric user ID from the page
  const $ = cheerio.load(html);
  // Look for user ID in various places on the page
  const userIdMatch = html.match(/user_id['"]?\s*:\s*['"]?(\d+)/);
  if (userIdMatch) {
    return userIdMatch[1];
  }

  // Fallback: try to find it in the URL structure
  const urlMatch = html.match(/\/user\/show\/(\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  return null;
}

/**
 * Collect books from Goodreads
 * Based on Ajay's implementation
 */
export async function collectGoodreadsBooks(
  goodreadsUserId?: string
): Promise<RawBook[]> {
  if (!goodreadsUserId) {
    return [];
  }

  // Get numeric user ID if username was provided
  const numericUserId = await getNumericUserId(goodreadsUserId);
  if (!numericUserId) {
    console.warn(`   ⚠ Could not resolve Goodreads user ID for "${goodreadsUserId}". Make sure it's a valid username or numeric ID.`);
    return [];
  }

  const currentlyReadingUrl = `https://www.goodreads.com/review/list/${numericUserId}?shelf=currently-reading`;
  const readUrl = `https://www.goodreads.com/review/list/${numericUserId}?shelf=read`;

  try {
    const [currentlyReadingHtml, readHtml] = await Promise.all([
      politeFetch(currentlyReadingUrl),
      politeFetch(readUrl),
    ]);

    const books: RawBook[] = [];

    // Debug: Check if we got valid HTML
    if (currentlyReadingHtml && currentlyReadingHtml.length > 1000) {
      // Check if page requires login or has different structure
      if (currentlyReadingHtml.includes('Sign in') || currentlyReadingHtml.includes('login')) {
        console.warn(`   ⚠ Goodreads may require authentication. The page shows a sign-in prompt.`);
      } else if (currentlyReadingHtml.includes('No books found') || currentlyReadingHtml.includes('empty')) {
        console.log(`   ℹ Goodreads currently-reading shelf appears to be empty`);
      } else {
        const currentlyReading = scrapeBooks(currentlyReadingHtml, 'currently-reading');
        if (currentlyReading.length > 0) {
          console.log(`   ✓ Goodreads (currently-reading): ${currentlyReading.length} books`);
        }
        books.push(...currentlyReading);
      }
    } else if (currentlyReadingHtml) {
      console.warn(`   ⚠ Got unexpected response from currently-reading shelf (length: ${currentlyReadingHtml.length})`);
    } else {
      console.warn(`   ⚠ Failed to fetch currently-reading shelf`);
    }

    if (readHtml && readHtml.length > 1000) {
      if (readHtml.includes('Sign in') || readHtml.includes('login')) {
        console.warn(`   ⚠ Goodreads may require authentication. The page shows a sign-in prompt.`);
      } else if (readHtml.includes('No books found') || readHtml.includes('empty')) {
        console.log(`   ℹ Goodreads read shelf appears to be empty`);
      } else {
        const read = scrapeBooks(readHtml, 'read');
        if (read.length > 0) {
          console.log(`   ✓ Goodreads (read): ${read.length} books`);
        }
        books.push(...read);
      }
    } else if (readHtml) {
      console.warn(`   ⚠ Got unexpected response from read shelf (length: ${readHtml.length})`);
    } else {
      console.warn(`   ⚠ Failed to fetch read shelf`);
    }

    console.log(`   ✓ Goodreads: ${books.length} total books collected`);
    return books;
  } catch (error: any) {
    console.warn(`   ⚠ Failed to fetch Goodreads data: ${error.message}`);
    return [];
  }
}
