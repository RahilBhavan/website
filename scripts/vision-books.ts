/**
 * Main script that orchestrates the book aggregation system
 * Based on Ajay Misra's architecture: https://www.ajaymisra.com/posts/psuedocode
 * 
 * This is the "Dyson Sphere" - aggregates data from multiple sources
 * and creates a unified view of reading habits
 */

import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { collectManualBooks } from './collectors/manual.js';
import { collectGoodreadsBooks } from './collectors/goodreads.js';
import { collectGoodreadsRSS } from './collectors/goodreads-rss.js';
import { collectGoodreadsBooksBrowser } from './collectors/goodreads-browser.js';
import { syncGoodreadsIncremental } from './workers/goodreads-sync.js';
import { normalizeBooks } from './integration/normalize.js';
import { resolveBookCollisions } from './integration/fuzzy-match.js';
import { loadSyncState } from './utils/sync-state.js';
import { enrichBooksMetadata } from './enrichment/metadata-enricher.js';
import { generateInsights } from './ai/insights-generator.js';
import { computeAnalytics } from './analytics/compute-stats.js';
import { detectNewBooks } from './utils/change-detection.js';
import type { NormalizedBook } from './collectors/types.js';

// Load environment variables from .env.local or .env
config({ path: '.env.local' });
config(); // Also try .env

/**
 * Load existing books for incremental updates
 */
function loadExistingBooks(): NormalizedBook[] {
  const booksPath = join(process.cwd(), 'src/data/books.json');
  if (!existsSync(booksPath)) {
    return [];
  }

  try {
    const content = readFileSync(booksPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Main aggregation function
 * Supports incremental updates when existing books are present
 */
async function aggregateBooks(incremental: boolean = false): Promise<NormalizedBook[]> {
  console.log('📚 Starting book aggregation...\n');

  const existingBooks = incremental ? loadExistingBooks() : [];
  const isIncremental = incremental && existingBooks.length > 0;

  if (isIncremental) {
    console.log(`📊 Incremental mode: ${existingBooks.length} existing books found\n`);
  }

  // Step 1: Collect from all sources
  console.log('1️⃣ Collecting books from all sources...');
  
  // Get Goodreads user ID from environment
  const goodreadsUserId = process.env.GOODREADS_USER_ID;
  
  if (!goodreadsUserId && !process.env.CI) {
    console.log('   ℹ No Goodreads user ID provided, skipping Goodreads collection');
  }
  
  // Use incremental sync if enabled, otherwise full sync
  const goodreadsPromise = !goodreadsUserId
    ? Promise.resolve([])
    : isIncremental
    ? syncGoodreadsIncremental(goodreadsUserId)
    : Promise.all([
        collectGoodreadsBooksBrowser(goodreadsUserId),
        collectGoodreadsRSS(goodreadsUserId),
        collectGoodreadsBooks(goodreadsUserId),
      ]).then(([browser, rss, basic]) => {
        const allGoodreads = browser.length > 0 
          ? browser 
          : (rss.length > 0 ? rss : basic);
        console.log(`   ✓ Goodreads: ${allGoodreads.length} books`);
        return allGoodreads;
      });
  
  // Try browser automation first (most reliable), then RSS, then basic scraping
  const [manualBooks, allGoodreadsBooks] = await Promise.all([
    collectManualBooks(),
    goodreadsPromise,
  ]);

  console.log(`   ✓ Manual: ${manualBooks.length} books`);
  
  // Combine Goodreads sources (browser > RSS > basic)
  const allGoodreadsBooksFinal = Array.isArray(allGoodreadsBooks) 
    ? allGoodreadsBooks 
    : [];

  // Step 2: Normalize data
  console.log('\n2️⃣ Normalizing data...');
  const newBooks = normalizeBooks([...manualBooks, ...allGoodreadsBooksFinal]);
  console.log(`   ✓ Normalized ${newBooks.length} new books`);

  // For incremental updates, merge with existing books
  const allBooks = isIncremental 
    ? [...existingBooks, ...newBooks]
    : newBooks;

  // Step 3: Resolve collisions with fuzzy matching
  console.log('\n3️⃣ Resolving data collisions...');
  const unifiedBooks = resolveBookCollisions(allBooks);
  console.log(`   ✓ Unified into ${unifiedBooks.length} unique books`);
  
  if (isIncremental) {
    const newCount = unifiedBooks.length - existingBooks.length;
    console.log(`   📈 ${newCount > 0 ? `+${newCount}` : newCount} new books added`);
  }

  // Step 4: Enrich metadata (Open Library, Google Books)
  const shouldEnrich = process.env.ENABLE_METADATA_ENRICHMENT !== 'false';
  let enrichedBooks = unifiedBooks;
  
  if (shouldEnrich) {
    console.log('\n4️⃣ Enriching metadata...');
    enrichedBooks = await enrichBooksMetadata(unifiedBooks, {
      useOpenLibrary: true,
      useGoogleBooks: true,
      rateLimitMs: 200,
      onlyMissing: true, // Only enrich books missing key data
    });
    console.log(`   ✓ Enrichment complete`);
  }

  // Step 5: Sort by completion date (most recent first)
  enrichedBooks.sort((a, b) => {
    const dateA = a.completedDate?.valueOf() || 0;
    const dateB = b.completedDate?.valueOf() || 0;
    return dateB - dateA;
  });

  // Step 6: Detect new books
  const changes = detectNewBooks(enrichedBooks);
  if (changes.count > 0) {
    console.log(`\n🆕 Detected ${changes.count} new book(s):`);
    changes.newBooks.slice(0, 5).forEach(book => {
      console.log(`   • ${book.title} by ${book.author}`);
    });
    if (changes.count > 5) {
      console.log(`   ... and ${changes.count - 5} more`);
    }
  }

  console.log('\n✅ Aggregation complete!\n');

  return enrichedBooks;
}

/**
 * Save aggregated books to JSON
 */
async function saveBooks(books: NormalizedBook[]): Promise<void> {
  const outputPath = join(process.cwd(), 'src/data/books.json');
  const data = JSON.stringify(books, null, 2);
  await writeFile(outputPath, data, 'utf-8');
  console.log(`💾 Saved ${books.length} books to ${outputPath}`);
}

/**
 * Generate and save insights
 */
async function generateAndSaveInsights(books: NormalizedBook[]): Promise<void> {
  console.log('\n5️⃣ Generating insights and analytics...');
  
  try {
    // Generate AI insights
    const insights = await generateInsights(books);
    const insightsPath = join(process.cwd(), 'src/data/insights.json');
    await writeFile(insightsPath, JSON.stringify(insights, null, 2), 'utf-8');
    console.log(`   ✓ Insights saved to ${insightsPath}`);

    // Compute analytics
    const analytics = computeAnalytics(books, insights);
    const analyticsPath = join(process.cwd(), 'src/data/analytics.json');
    await writeFile(analyticsPath, JSON.stringify(analytics, null, 2), 'utf-8');
    console.log(`   ✓ Analytics saved to ${analyticsPath}`);
  } catch (error: any) {
    console.warn('   ⚠ Failed to generate insights:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const incremental = process.env.INCREMENTAL_SYNC === 'true';
    const books = await aggregateBooks(incremental);
    await saveBooks(books);
    
    // Generate insights and analytics
    const shouldGenerateInsights = process.env.GENERATE_INSIGHTS !== 'false';
    if (shouldGenerateInsights) {
      await generateAndSaveInsights(books);
    }
    
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error aggregating books:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('vision-books')) {
  main();
}

export { aggregateBooks, saveBooks };
