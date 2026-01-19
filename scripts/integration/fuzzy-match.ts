/**
 * Fuzzy matching system for resolving book data collisions
 * Based on Ajay's implementation using similarity scoring
 */

import type { RawBook, NormalizedBook } from '../collectors/types.js';

/**
 * Calculate similarity between two strings (0.0 to 1.0)
 * Based on Ajay's implementation - uses word-based matching
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1.0;

  // Word-based similarity (Jaccard similarity)
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0.0;
  
  return intersection.size / union.size;
}

/**
 * Normalize string for comparison
 * Based on Ajay's implementation - removes articles and special chars
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '') // Remove leading articles
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Normalize author name (handles "Last, First" vs "First Last")
 */
function normalizeAuthor(author: string): string {
  const normalized = normalizeString(author);
  
  // Check if it's "Last, First" format
  if (normalized.includes(',')) {
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
  }
  
  return normalized;
}

/**
 * Check if two books are likely the same
 * Based on Ajay's implementation - matches by author and partial title
 */
function areBooksSimilar(book1: RawBook, book2: RawBook, threshold: number = 0.92): boolean {
  const title1 = normalizeString(book1.title);
  const title2 = normalizeString(book2.title);
  const author1 = normalizeAuthor(book1.author);
  const author2 = normalizeAuthor(book2.author);
  
  const titleSimilarity = calculateSimilarity(title1, title2);
  const authorSimilarity = calculateSimilarity(author1, author2);

  // Both title and author must be similar (as per Ajay's implementation)
  // Also check for partial title matches (one title contains the other)
  const titleContains = title1.includes(title2) || title2.includes(title1);
  const authorMatch = authorSimilarity > threshold;

  return authorMatch && (titleSimilarity > threshold || titleContains);
}

/**
 * Merge book details, preferring more complete data
 */
function mergeBookDetails(existing: NormalizedBook, newBook: RawBook): NormalizedBook {
  return {
    ...existing,
    // Add new source if not already present
    sources: existing.sources.includes(newBook.source)
      ? existing.sources
      : [...existing.sources, newBook.source],
    // Prefer non-empty values
    coverUrl: existing.coverUrl || newBook.coverUrl,
    isbn: existing.isbn || newBook.isbn,
    // Prefer more recent dates
    startedDate: newBook.startedDate && (!existing.startedDate || newBook.startedDate < existing.startedDate)
      ? newBook.startedDate
      : existing.startedDate,
    completedDate: newBook.completedDate && (!existing.completedDate || newBook.completedDate > existing.completedDate)
      ? newBook.completedDate
      : existing.completedDate,
    // Prefer higher rating
    rating: newBook.rating && (!existing.rating || newBook.rating > existing.rating)
      ? newBook.rating
      : existing.rating,
    // Merge tags
    tags: [...new Set([...(existing.tags || []), ...(newBook.tags || [])])],
    // Merge reviews (prefer longer one)
    review: newBook.review && (!existing.review || newBook.review.length > existing.review.length)
      ? newBook.review
      : existing.review,
  };
}

/**
 * Resolve book collisions using fuzzy matching
 * Based on Ajay's implementation
 */
export function resolveBookCollisions(books: RawBook[]): NormalizedBook[] {
  const library: NormalizedBook[] = [];

  for (const newBook of books) {
    let matched = false;

    for (const existing of library) {
      if (areBooksSimilar(newBook, existing)) {
        // Found a match - merge the books
        const index = library.indexOf(existing);
        library[index] = mergeBookDetails(existing, newBook);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // No match found - add as new book
      library.push({
        ...newBook,
        normalizedTitle: normalizeString(newBook.title),
        normalizedAuthor: normalizeAuthor(newBook.author),
        id: generateBookId(newBook),
        sources: [newBook.source],
      });
    }
  }

  return library;
}

/**
 * Generate a unique ID for a book
 */
function generateBookId(book: RawBook): string {
  const title = normalizeString(book.title);
  const author = normalizeAuthor(book.author);
  return `${title}-${author}`.replace(/\s+/g, '-').toLowerCase();
}
