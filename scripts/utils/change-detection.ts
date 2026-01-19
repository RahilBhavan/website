/**
 * Change detection system
 * Identifies new books added since last sync
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { NormalizedBook } from '../collectors/types.js';

interface ChangeLog {
  newBooks: Array<{
    id: string;
    title: string;
    author: string;
    addedAt: string;
  }>;
  lastCheck: string;
}

const CHANGE_LOG_PATH = join(process.cwd(), 'src/data/.change-log.json');

/**
 * Load previous book IDs
 */
function loadPreviousBookIds(): Set<string> {
  const booksPath = join(process.cwd(), 'src/data/books.json');
  if (!existsSync(booksPath)) {
    return new Set();
  }

  try {
    const content = readFileSync(booksPath, 'utf-8');
    const books: NormalizedBook[] = JSON.parse(content);
    return new Set(books.map(b => b.id));
  } catch {
    return new Set();
  }
}

/**
 * Load change log
 */
function loadChangeLog(): ChangeLog {
  if (!existsSync(CHANGE_LOG_PATH)) {
    return {
      newBooks: [],
      lastCheck: new Date().toISOString(),
    };
  }

  try {
    const content = readFileSync(CHANGE_LOG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      newBooks: [],
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Save change log
 */
function saveChangeLog(changelog: ChangeLog): void {
  try {
    writeFileSync(CHANGE_LOG_PATH, JSON.stringify(changelog, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save change log:', error);
  }
}

/**
 * Detect new books
 */
export function detectNewBooks(currentBooks: NormalizedBook[]): {
  newBooks: NormalizedBook[];
  count: number;
} {
  const previousIds = loadPreviousBookIds();
  const currentIds = new Set(currentBooks.map(b => b.id));

  const newBooks = currentBooks.filter(book => !previousIds.has(book.id));

  // Update change log
  const changelog = loadChangeLog();
  const newEntries = newBooks.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    addedAt: new Date().toISOString(),
  }));

  changelog.newBooks = [...changelog.newBooks, ...newEntries].slice(-50); // Keep last 50
  changelog.lastCheck = new Date().toISOString();
  saveChangeLog(changelog);

  return {
    newBooks,
    count: newBooks.length,
  };
}

/**
 * Get recent changes
 */
export function getRecentChanges(limit: number = 10): ChangeLog['newBooks'] {
  const changelog = loadChangeLog();
  return changelog.newBooks.slice(-limit).reverse();
}

/**
 * Clear change log
 */
export function clearChangeLog(): void {
  saveChangeLog({
    newBooks: [],
    lastCheck: new Date().toISOString(),
  });
}
