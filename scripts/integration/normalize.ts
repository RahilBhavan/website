/**
 * Data normalization layer
 * Handles inconsistent formatting from different sources
 */

import type { RawBook, NormalizedBook } from '../collectors/types.js';

/**
 * Normalize book data from any source
 */
export function normalizeBook(book: RawBook): RawBook {
  return {
    ...book,
    title: normalizeTitle(book.title),
    author: normalizeAuthor(book.author),
    coverUrl: normalizeCoverUrl(book.coverUrl, book.source),
  };
}

/**
 * Normalize book title
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Handle common title variations
    .replace(/\s*\(.*?\)\s*$/, '') // Remove trailing (Edition) info
    .trim();
}

/**
 * Normalize author name
 * Handles "Last, First" vs "First Last" formats
 */
function normalizeAuthor(author: string): string {
  const trimmed = author.trim();
  
  // Check if it's "Last, First" format
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
  }
  
  return trimmed;
}

/**
 * Normalize cover URL
 * Based on Ajay's implementation - removes size parameters
 */
function normalizeCoverUrl(url: string | undefined, source: string): string | undefined {
  if (!url) return undefined;

  // Goodreads URL normalization - remove size parameters like _SX200_, _SY300_, etc.
  if (source === 'goodreads') {
    return url.replace(/_S[XY]\d+_/g, '').replace(/\.{2,}/g, '.');
  }

  return url;
}

/**
 * Normalize all books in a collection
 */
export function normalizeBooks(books: RawBook[]): RawBook[] {
  return books.map(normalizeBook);
}
