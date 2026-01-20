/**
 * Test script to verify Goodreads integration
 * Run with: tsx scripts/test-goodreads.ts
 */

import { config } from 'dotenv';
import { collectGoodreadsRSS } from './collectors/goodreads-rss.js';
import { collectGoodreadsBooks } from './collectors/goodreads.js';

// Load environment variables
config({ path: '.env.local' });
config(); // Also try .env

async function testGoodreads() {
  const goodreadsUserId = process.env.GOODREADS_USER_ID;

  if (!goodreadsUserId) {
    console.log('❌ No GOODREADS_USER_ID found in environment variables.');
    console.log('\n📝 To set it up:');
    console.log('1. Create a .env.local file in the project root');
    console.log('2. Add: GOODREADS_USER_ID=your_user_id_or_username');
    console.log('\n💡 To find your Goodreads user ID:');
    console.log('   - Go to your Goodreads profile page');
    console.log('   - Check the URL: https://www.goodreads.com/user/show/12345678-username');
    console.log('   - Use either the numeric ID (12345678) or your username');
    process.exit(1);
  }

  console.log(`🔍 Testing Goodreads collection for user: ${goodreadsUserId}\n`);

  // Test RSS feed first (no authentication needed)
  console.log('1️⃣ Testing RSS feed...');
  try {
    const rssBooks = await collectGoodreadsRSS(goodreadsUserId);
    if (rssBooks.length > 0) {
      console.log(`   ✅ RSS feed works! Found ${rssBooks.length} books\n`);
      console.log('   Sample books:');
      rssBooks.slice(0, 3).forEach(book => {
        console.log(`   - ${book.title} by ${book.author}`);
      });
      return;
    } else {
      console.log('   ⚠️  RSS feed returned no books (may not be enabled)\n');
    }
  } catch (error: any) {
    console.log(`   ⚠️  RSS feed error: ${error.message}\n`);
  }

  // Test basic scraping
  console.log('2️⃣ Testing basic scraping...');
  try {
    const books = await collectGoodreadsBooks(goodreadsUserId);
    if (books.length > 0) {
      console.log(`   ✅ Basic scraping works! Found ${books.length} books\n`);
      console.log('   Sample books:');
      books.slice(0, 3).forEach(book => {
        console.log(`   - ${book.title} by ${book.author}`);
      });
    } else {
      console.log('   ⚠️  No books found. Your profile may be private or require authentication.\n');
      console.log('   💡 Try setting up cookies for authentication:');
      console.log('      npm run export:goodreads-cookies');
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('\n   💡 Your profile may require authentication.');
    console.log('      Try: npm run export:goodreads-cookies');
  }
}

testGoodreads().catch(console.error);
