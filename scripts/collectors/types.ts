/**
 * Type definitions for book data across all sources
 */

export type BookSource = 'goodreads' | 'audible' | 'spotify' | 'physical' | 'manual';

export type BookStatus = 'currently-reading' | 'read' | 'want-to-read';

export interface RawBook {
  title: string;
  author: string;
  coverUrl?: string;
  isbn?: string;
  source: BookSource;
  status: BookStatus;
  startedDate?: Date;
  completedDate?: Date;
  rating?: number;
  review?: string;
  tags?: string[];
  // Source-specific metadata
  metadata?: Record<string, unknown>;
}

export interface NormalizedBook extends RawBook {
  // Normalized fields
  normalizedTitle: string;
  normalizedAuthor: string;
  // For fuzzy matching
  id: string;
  // Sources that contributed to this book
  sources: BookSource[];
}
