/**
 * Alternative Goodreads collector using RSS feeds
 * Goodreads provides RSS feeds for reading lists that don't require authentication
 * 
 * RSS feed format: https://www.goodreads.com/review/list_rss/{user_id}?shelf={shelf_name}
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { RawBook } from './types.js';

/**
 * Parse RSS feed XML
 */
function parseRSSFeed(xml: string): RawBook[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const books: RawBook[] = [];

  $('item').each((_, element) => {
    const title = $(element).find('title').text().trim();
    const author = $(element).find('author_name').text().trim();
    const bookLink = $(element).find('link').text().trim();
    const description = $(element).find('description').text();
    
    // Extract cover image from description HTML
    const $desc = cheerio.load(description);
    const coverUrl = $desc('img').attr('src') || '';

    // Extract rating from description
    let rating: number | undefined;
    const ratingMatch = description.match(/rating[:\s]+(\d+)/i);
    if (ratingMatch) {
      rating = parseInt(ratingMatch[1], 10);
    }

    // Extract read date from pubDate
    const pubDate = $(element).find('pubDate').text();
    const completedDate = pubDate ? new Date(pubDate) : undefined;

    if (title && author) {
      books.push({
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl || undefined,
        source: 'goodreads',
        status: 'read', // RSS feeds are typically for completed books
        completedDate,
        rating,
        tags: [],
      });
    }
  });

  return books;
}

/**
 * Collect books from Goodreads RSS feed
 * This is an alternative to web scraping that doesn't require authentication
 */
export async function collectGoodreadsRSS(
  goodreadsUserId?: string
): Promise<RawBook[]> {
  if (!goodreadsUserId) {
    return [];
  }

  const rssUrl = `https://www.goodreads.com/review/list_rss/${goodreadsUserId}?shelf=read`;

  try {
    const response = await axios.get(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (response.status === 200 && response.data) {
      const books = parseRSSFeed(response.data);
      console.log(`   ✓ Goodreads RSS: ${books.length} books`);
      return books;
    }

    return [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`   ⚠ Goodreads RSS feed not found. User ${goodreadsUserId} may not have a public RSS feed enabled.`);
    } else {
      console.warn(`   ⚠ Failed to fetch Goodreads RSS: ${error.message}`);
    }
    return [];
  }
}
