/**
 * Google Books API enrichment
 * Fetches additional metadata, ratings, and reviews
 */

import axios from 'axios';
import type { NormalizedBook } from '../collectors/types.js';

interface GoogleBooksItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    language?: string;
  };
}

/**
 * Search Google Books API
 */
async function searchGoogleBooks(
  query: string,
  maxResults: number = 1
): Promise<GoogleBooksItem | null> {
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults,
        fields: 'items(volumeInfo(title,authors,description,imageLinks,industryIdentifiers,publishedDate,pageCount,categories,averageRating,ratingsCount,language))',
      },
      timeout: 5000,
    });

    const items = response.data?.items;
    if (items && items.length > 0) {
      return items[0];
    }
    return null;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.warn(`Google Books API error:`, error.message);
    }
    return null;
  }
}

/**
 * Enrich book with Google Books data
 */
export async function enrichWithGoogleBooks(
  book: NormalizedBook
): Promise<Partial<NormalizedBook>> {
  const enriched: Partial<NormalizedBook> = {};

  // Build search query
  let query = `"${book.title}"`;
  if (book.author) {
    query += ` "${book.author}"`;
  }
  if (book.isbn) {
    query += ` isbn:${book.isbn.replace(/[-\s]/g, '')}`;
  }

  const gbData = await searchGoogleBooks(query);

  if (gbData?.volumeInfo) {
    const info = gbData.volumeInfo;

    // Use better cover if available
    if (info.imageLinks) {
      const coverUrl = info.imageLinks.large || 
                      info.imageLinks.medium || 
                      info.imageLinks.small ||
                      info.imageLinks.thumbnail;
      
      if (coverUrl && !book.coverUrl) {
        // Remove http and use https, remove zoom parameter
        enriched.coverUrl = coverUrl.replace('http://', 'https://').replace(/&zoom=\d+/, '');
      }
    }

    // Add description if missing
    if (info.description && !book.review) {
      enriched.review = info.description.substring(0, 500);
    }

    // Add rating if available and book doesn't have one
    if (info.averageRating && !book.rating) {
      enriched.rating = Math.round(info.averageRating);
    }

    // Add tags from categories
    if (info.categories && info.categories.length > 0) {
      const existingTags = book.tags || [];
      const newTags = info.categories
        .slice(0, 5)
        .map(cat => cat.toLowerCase().replace(/\s+/g, '-'));
      enriched.tags = [...new Set([...existingTags, ...newTags])];
    }

    // Add ISBN if missing
    if (!book.isbn && info.industryIdentifiers) {
      const isbn13 = info.industryIdentifiers.find(id => id.type === 'ISBN_13');
      const isbn10 = info.industryIdentifiers.find(id => id.type === 'ISBN_10');
      if (isbn13) {
        enriched.isbn = isbn13.identifier;
      } else if (isbn10) {
        enriched.isbn = isbn10.identifier;
      }
    }
  }

  return enriched;
}

/**
 * Enrich multiple books with rate limiting
 */
export async function enrichBooksWithGoogleBooks(
  books: NormalizedBook[],
  rateLimitMs: number = 200
): Promise<NormalizedBook[]> {
  const enriched: NormalizedBook[] = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const enrichment = await enrichWithGoogleBooks(book);

    enriched.push({
      ...book,
      ...enrichment,
    });

    // Rate limiting
    if (i < books.length - 1) {
      await new Promise(resolve => setTimeout(resolve, rateLimitMs));
    }
  }

  return enriched;
}
