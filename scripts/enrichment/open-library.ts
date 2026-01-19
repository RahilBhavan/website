/**
 * Open Library API enrichment
 * Fetches additional metadata for books (descriptions, covers, etc.)
 */

import axios from 'axios';
import type { NormalizedBook } from '../collectors/types.js';

interface OpenLibraryBook {
  title: string;
  authors?: Array<{ name: string }>;
  isbn?: string[];
  cover?: {
    large?: string;
    medium?: string;
    small?: string;
  };
  description?: string | { value: string };
  publish_date?: string;
  number_of_pages?: number;
  subjects?: string[];
}

/**
 * Search Open Library by ISBN
 */
async function searchByISBN(isbn: string): Promise<OpenLibraryBook | null> {
  try {
    const response = await axios.get(
      `https://openlibrary.org/isbn/${isbn}.json`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.warn(`Open Library API error for ISBN ${isbn}:`, error.message);
    }
    return null;
  }
}

/**
 * Search Open Library by title and author
 */
async function searchByTitleAuthor(
  title: string,
  author: string
): Promise<OpenLibraryBook | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${query}&limit=1`,
      { timeout: 5000 }
    );

    const docs = response.data?.docs;
    if (docs && docs.length > 0) {
      const book = docs[0];
      return {
        title: book.title,
        authors: book.author_name?.map((name: string) => ({ name })),
        isbn: book.isbn,
        cover: book.cover_i
          ? {
              large: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
              medium: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
              small: `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`,
            }
          : undefined,
        description: book.first_sentence,
        publish_date: book.first_publish_year?.toString(),
        number_of_pages: book.number_of_pages_median,
        subjects: book.subject,
      };
    }
    return null;
  } catch (error: any) {
    console.warn(`Open Library search error for "${title}":`, error.message);
    return null;
  }
}

/**
 * Enrich book with Open Library data
 */
export async function enrichWithOpenLibrary(
  book: NormalizedBook
): Promise<Partial<NormalizedBook>> {
  const enriched: Partial<NormalizedBook> = {};

  // Try ISBN first (most accurate)
  let olData: OpenLibraryBook | null = null;
  if (book.isbn) {
    // Clean ISBN (remove hyphens)
    const cleanISBN = book.isbn.replace(/[-\s]/g, '');
    olData = await searchByISBN(cleanISBN);
  }

  // Fallback to title/author search
  if (!olData) {
    olData = await searchByTitleAuthor(book.title, book.author);
  }

  if (olData) {
    // Use better cover if available
    if (olData.cover?.large && !book.coverUrl) {
      enriched.coverUrl = olData.cover.large;
    }

    // Add description if missing
    if (olData.description && !book.review) {
      const description = typeof olData.description === 'string'
        ? olData.description
        : olData.description.value;
      enriched.review = description.substring(0, 500); // Limit length
    }

    // Add tags from subjects
    if (olData.subjects && olData.subjects.length > 0) {
      const existingTags = book.tags || [];
      const newTags = olData.subjects
        .slice(0, 5)
        .map((s: string) => s.toLowerCase().replace(/\s+/g, '-'));
      enriched.tags = [...new Set([...existingTags, ...newTags])];
    }

    // Add ISBN if missing
    if (!book.isbn && olData.isbn && olData.isbn.length > 0) {
      enriched.isbn = olData.isbn[0];
    }
  }

  return enriched;
}

/**
 * Enrich multiple books with rate limiting
 */
export async function enrichBooksWithOpenLibrary(
  books: NormalizedBook[],
  rateLimitMs: number = 200
): Promise<NormalizedBook[]> {
  const enriched: NormalizedBook[] = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const enrichment = await enrichWithOpenLibrary(book);

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
