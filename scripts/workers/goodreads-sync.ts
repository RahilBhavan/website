/**
 * Incremental Goodreads sync worker
 * Only fetches books added/modified since last sync
 */

import { collectGoodreadsBooksBrowser } from '../collectors/goodreads-browser.js';
import { getLastSync, updateSyncState } from '../utils/sync-state.js';
import type { RawBook } from '../collectors/types.js';

/**
 * Sync Goodreads books incrementally
 * Returns only new books since last sync
 */
export async function syncGoodreadsIncremental(
  goodreadsUserId?: string
): Promise<RawBook[]> {
  if (!goodreadsUserId) {
    console.log('No Goodreads user ID provided, skipping sync');
    return [];
  }

  const lastSync = getLastSync('goodreads');
  const allBooks = await collectGoodreadsBooksBrowser(goodreadsUserId);

  if (lastSync) {
    // Filter to only books added/modified since last sync
    // For now, we'll return all books and let the main system handle deduplication
    // In a more sophisticated implementation, we'd track book IDs and compare
    const newBooks = allBooks.filter(book => {
      if (!book.completedDate && !book.startedDate) {
        // If no date, assume it's new (conservative approach)
        return true;
      }

      const bookDate = book.completedDate || book.startedDate;
      if (!bookDate) return true;

      return new Date(bookDate) >= lastSync;
    });

    console.log(`   ✓ Goodreads: ${newBooks.length} new books since last sync (${allBooks.length} total)`);
    
    // Update sync state
    updateSyncState('goodreads', allBooks.length, allBooks.map(b => `${b.title}-${b.author}`));
    
    return newBooks;
  } else {
    // First sync - return all books
    console.log(`   ✓ Goodreads: ${allBooks.length} books (first sync)`);
    updateSyncState('goodreads', allBooks.length, allBooks.map(b => `${b.title}-${b.author}`));
    return allBooks;
  }
}
