/**
 * Goodreads collector using browser automation (Playwright)
 * Handles JavaScript-rendered content and can work with authentication
 * Based on Ajay's implementation approach
 */

import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import type { RawBook } from './types.js';

/**
 * Normalize text for comparison (removes articles, special chars, etc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize cover URLs (removes size parameters)
 */
function normalizeCoverUrl(url: string): string {
  return url.replace(/_S[XY]\d+_/g, '').replace(/\.{2,}/g, '.');
}

/**
 * Format author names from "Last, First" to "First Last"
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
 * Polite wait with jitter (to appear more human)
 */
async function politeWait(page: Page, baseDelay: number = 1000): Promise<void> {
  const jitter = Math.random() * 500;
  await page.waitForTimeout(baseDelay + jitter);
}

/**
 * Scrape books from Goodreads HTML using Cheerio
 */
function scrapeBooksFromHTML(html: string, status: 'read' | 'currently-reading'): RawBook[] {
  const $ = cheerio.load(html);
  const books: RawBook[] = [];

  // Try multiple selector patterns
  const selectors = [
    '#booksBody tr',
    'tbody tr',
    '.bookalike',
    '.bookContainer',
    'tr[itemtype="http://schema.org/Book"]',
  ];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      // Try multiple ways to extract title
      const title = 
        $(element).find('.field.title .value a').attr('title') ||
        $(element).find('.field.title a').attr('title') ||
        $(element).find('a[href*="/book/show/"]').attr('title') ||
        $(element).find('.bookTitle').text().trim() ||
        $(element).find('a.bookTitle').text().trim() ||
        $(element).find('td[class*="title"] a').text().trim() ||
        '';

      // Try multiple ways to extract author
      const author = 
        $(element).find('.field.author .value a').text().trim() ||
        $(element).find('.field.author a').text().trim() ||
        $(element).find('a[href*="/author/show/"]').text().trim() ||
        $(element).find('.authorName').text().trim() ||
        $(element).find('a.authorName').text().trim() ||
        $(element).find('td[class*="author"] a').text().trim() ||
        '';

      // Try multiple ways to extract cover
      const cover = 
        $(element).find('.field.cover .value img').attr('src') ||
        $(element).find('.field.cover img').attr('src') ||
        $(element).find('img[src*="goodreads.com"]').attr('src') ||
        $(element).find('.bookCover img').attr('src') ||
        $(element).find('img[alt*="cover"]').attr('src') ||
        '';

      // Extract rating if available
      let rating: number | undefined;
      const ratingText = $(element).find('.staticStars').attr('title') || 
                        $(element).find('[class*="rating"]').text();
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }

      // Extract date if available
      let completedDate: Date | undefined;
      const dateText = $(element).find('.date_read_value').text() ||
                      $(element).find('td[class*="date"]').text();
      if (dateText) {
        const parsed = new Date(dateText);
        if (!isNaN(parsed.getTime())) {
          completedDate = parsed;
        }
      }

      if (title && author) {
        books.push({
          title: title.trim(),
          author: formatAuthorName(author.trim()),
          coverUrl: cover ? normalizeCoverUrl(cover) : undefined,
          source: 'goodreads',
          status: status,
          completedDate,
          rating,
          tags: [],
        });
      }
    });

    if (books.length > 0) {
      break; // Found books with this selector
    }
  }

  return books;
}

/**
 * Load cookies from file if available
 * Format: JSON array of cookie objects
 */
async function loadCookies(): Promise<any[] | null> {
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const cookiesPath = join(process.cwd(), 'scripts/.goodreads-cookies.json');
    const cookiesData = await readFile(cookiesPath, 'utf-8');
    return JSON.parse(cookiesData);
  } catch {
    return null;
  }
}

/**
 * Collect books from Goodreads using browser automation
 * Based on Ajay's implementation approach
 * 
 * For authenticated access, save your Goodreads cookies to scripts/.goodreads-cookies.json
 * You can export cookies using browser extensions or Playwright's cookie export
 */
export async function collectGoodreadsBooksBrowser(
  goodreadsUserId?: string
): Promise<RawBook[]> {
  if (!goodreadsUserId) {
    console.log('No Goodreads user ID provided, skipping Goodreads collection');
    return [];
  }

  let browser: Browser | null = null;

  try {
    // Launch browser in headless mode
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Try to load saved cookies for authentication
    const savedCookies = await loadCookies();
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    // Add cookies if available
    if (savedCookies && savedCookies.length > 0) {
      await context.addCookies(savedCookies);
      console.log(`   → Using saved cookies for authentication`);
    }

    const page = await context.newPage();

    const books: RawBook[] = [];
    const shelves = [
      { name: 'currently-reading', status: 'currently-reading' as const },
      { name: 'read', status: 'read' as const },
    ];

    for (const shelf of shelves) {
      const url = `https://www.goodreads.com/review/list/${goodreadsUserId}?shelf=${shelf.name}`;
      
      try {
        console.log(`   → Fetching ${shelf.name} shelf...`);
        
        // Navigate with timeout
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Polite wait to appear more human
        await politeWait(page, 1500);

        // Wait for book content to load (if JavaScript-rendered)
        try {
          await page.waitForSelector('#booksBody, tbody tr, .bookalike', { 
            timeout: 5000 
          });
        } catch {
          // Selector not found, but continue anyway
        }

        // Get the rendered HTML
        const html = await page.content();

        // Check if we need to handle pagination
        const hasMorePages = html.includes('next_page') || html.includes('next page');
        
        if (hasMorePages) {
          console.log(`   → Multiple pages detected for ${shelf.name}, fetching first page only`);
        }

        // Scrape books from this page
        const shelfBooks = scrapeBooksFromHTML(html, shelf.status);
        
        if (shelfBooks.length > 0) {
          console.log(`   ✓ Goodreads (${shelf.name}): ${shelfBooks.length} books`);
          books.push(...shelfBooks);
        } else {
          // Check if page requires login
          if (html.includes('Sign in') || html.includes('login') || html.includes('Please sign in')) {
            console.warn(`   ⚠ Goodreads ${shelf.name} shelf requires authentication`);
          } else if (html.includes('No books') || html.includes('empty')) {
            console.log(`   ℹ Goodreads ${shelf.name} shelf appears to be empty`);
          } else {
            console.warn(`   ⚠ No books found in ${shelf.name} shelf HTML (page structure may have changed)`);
          }
        }

        // Polite delay between shelves
        await politeWait(page, 1000);

      } catch (error: any) {
        console.warn(`   ⚠ Error fetching ${shelf.name} shelf: ${error.message}`);
      }
    }

    await browser.close();
    
    console.log(`   ✓ Goodreads (browser): ${books.length} total books collected`);
    return books;

  } catch (error: any) {
    if (browser) {
      await browser.close();
    }
    console.warn(`   ⚠ Browser automation failed: ${error.message}`);
    return [];
  }
}
