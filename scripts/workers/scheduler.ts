/**
 * Worker scheduler for orchestrating periodic book collection
 * Can be used with cron jobs, GitHub Actions, or Vercel Cron
 */

import { aggregateBooks, saveBooks } from '../vision-books.js';
import { updateSyncState } from '../utils/sync-state.js';
import type { NormalizedBook } from '../collectors/types.js';

export interface SyncResult {
  success: boolean;
  booksCount: number;
  newBooksCount: number;
  sources: {
    [source: string]: {
      count: number;
      newCount: number;
    };
  };
  error?: string;
}

/**
 * Run a full sync of all sources
 */
export async function runSync(): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    booksCount: 0,
    newBooksCount: 0,
    sources: {},
  };

  try {
    console.log('🔄 Starting scheduled book sync...\n');

    // Run aggregation
    const books = await aggregateBooks();
    result.booksCount = books.length;

    // Save books
    await saveBooks(books);

    // Update sync state for each source
    const sourceCounts: { [source: string]: number } = {};
    books.forEach(book => {
      book.sources?.forEach(source => {
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
    });

    // Update sync state
    Object.entries(sourceCounts).forEach(([source, count]) => {
      const bookIds = books
        .filter(b => b.sources?.includes(source))
        .map(b => b.id || `${b.title}-${b.author}`);
      
      updateSyncState(source, count, bookIds);
      
      result.sources[source] = {
        count,
        newCount: 0, // Will be calculated by change detection
      };
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Sync completed in ${duration}s`);
    console.log(`📚 Total books: ${books.length}`);

    result.success = true;
    return result;

  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    result.error = error.message;
    return result;
  }
}

/**
 * Run sync if executed directly (for testing)
 */
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('scheduler')) {
  runSync()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runSync };
