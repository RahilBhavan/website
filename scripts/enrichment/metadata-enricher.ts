/**
 * Metadata enricher - orchestrates enrichment from multiple sources
 * Combines Open Library and Google Books data
 */

import { enrichWithOpenLibrary, enrichBooksWithOpenLibrary } from './open-library.js';
import { enrichWithGoogleBooks, enrichBooksWithGoogleBooks } from './google-books.js';
import type { NormalizedBook } from '../collectors/types.js';

/**
 * Enrich a single book with all available sources
 * Tries multiple sources and merges best data
 */
export async function enrichBookMetadata(
  book: NormalizedBook,
  useOpenLibrary: boolean = true,
  useGoogleBooks: boolean = true
): Promise<NormalizedBook> {
  let enriched = { ...book };

  // Try Open Library first
  if (useOpenLibrary) {
    try {
      const olEnrichment = await enrichWithOpenLibrary(enriched);
      enriched = { ...enriched, ...olEnrichment };
    } catch (error) {
      console.warn(`Open Library enrichment failed for "${book.title}":`, error);
    }
  }

  // Then try Google Books (often has better ratings)
  if (useGoogleBooks) {
    try {
      const gbEnrichment = await enrichWithGoogleBooks(enriched);
      // Merge, but don't overwrite existing good data
      enriched = {
        ...enriched,
        ...gbEnrichment,
        // Prefer existing cover if it's better quality
        coverUrl: enriched.coverUrl || gbEnrichment.coverUrl,
        // Prefer existing rating
        rating: enriched.rating || gbEnrichment.rating,
      };
    } catch (error) {
      console.warn(`Google Books enrichment failed for "${book.title}":`, error);
    }
  }

  return enriched;
}

/**
 * Enrich multiple books with rate limiting and caching
 * Only enriches books that need enrichment (missing data)
 */
export async function enrichBooksMetadata(
  books: NormalizedBook[],
  options: {
    useOpenLibrary?: boolean;
    useGoogleBooks?: boolean;
    rateLimitMs?: number;
    onlyMissing?: boolean; // Only enrich books missing key data
  } = {}
): Promise<NormalizedBook[]> {
  const {
    useOpenLibrary = true,
    useGoogleBooks = true,
    rateLimitMs = 200,
    onlyMissing = true,
  } = options;

  // Filter books that need enrichment
  const booksToEnrich = onlyMissing
    ? books.filter(book => {
        // Enrich if missing cover, description, or ISBN
        return !book.coverUrl || !book.review || !book.isbn;
      })
    : books;

  if (booksToEnrich.length === 0) {
    console.log('   ✓ All books already enriched');
    return books;
  }

  console.log(`   → Enriching ${booksToEnrich.length} books...`);

  const enriched: NormalizedBook[] = [];
  const booksMap = new Map(books.map(b => [b.id, b]));

  for (let i = 0; i < booksToEnrich.length; i++) {
    const book = booksToEnrich[i];
    const enrichedBook = await enrichBookMetadata(book, useOpenLibrary, useGoogleBooks);
    booksMap.set(book.id, enrichedBook);

    // Rate limiting
    if (i < booksToEnrich.length - 1) {
      await new Promise(resolve => setTimeout(resolve, rateLimitMs));
    }
  }

  // Return all books (enriched + unchanged)
  return Array.from(booksMap.values());
}
