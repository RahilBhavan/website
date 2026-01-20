/**
 * Debug script to inspect Goodreads HTML structure
 * Saves HTML to files for inspection
 */

import { config } from 'dotenv';
import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });
config();

async function debugGoodreads() {
  const goodreadsUserId = process.env.GOODREADS_USER_ID;

  if (!goodreadsUserId) {
    console.log('❌ No GOODREADS_USER_ID found');
    process.exit(1);
  }

  // Load cookies
  let savedCookies: any[] | null = null;
  try {
    const { readFile } = await import('fs/promises');
    const cookiesPath = join(process.cwd(), 'scripts/.goodreads-cookies.json');
    const cookiesData = await readFile(cookiesPath, 'utf-8');
    savedCookies = JSON.parse(cookiesData);
    console.log(`✅ Loaded ${savedCookies.length} cookies\n`);
  } catch {
    console.log('⚠️  No cookies found\n');
  }

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  if (savedCookies && savedCookies.length > 0) {
    await context.addCookies(savedCookies);
  }

  const page = await context.newPage();

  const url = `https://www.goodreads.com/review/list/${goodreadsUserId}?shelf=read`;
  console.log(`🔍 Fetching: ${url}\n`);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000); // Wait for any JS to load

  const html = await page.content();
  const title = await page.title();

  console.log(`📄 Page title: ${title}`);
  console.log(`📏 HTML length: ${html.length} characters\n`);

  // Check for common indicators
  console.log('🔍 Checking for indicators:');
  console.log(`   - Contains "Sign in": ${html.includes('Sign in')}`);
  console.log(`   - Contains "login": ${html.includes('login')}`);
  console.log(`   - Contains "#booksBody": ${html.includes('booksBody')}`);
  console.log(`   - Contains "bookTitle": ${html.includes('bookTitle')}`);
  console.log(`   - Contains "authorName": ${html.includes('authorName')}`);
  console.log(`   - Contains "bookalike": ${html.includes('bookalike')}`);
  console.log(`   - Contains "No books": ${html.includes('No books')}`);
  console.log(`   - Contains "empty": ${html.includes('empty')}\n`);

  // Try to find any book-related elements
  const selectors = [
    '#booksBody',
    'tbody',
    '.bookalike',
    '.bookContainer',
    'tr[itemtype="http://schema.org/Book"]',
    '.bookTitle',
    'a[href*="/book/show/"]',
  ];

  console.log('🔍 Checking selectors:');
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`   - "${selector}": ${count} elements`);
  }

  // Save HTML for inspection
  const outputPath = join(process.cwd(), 'scripts/debug-goodreads-output.html');
  await writeFile(outputPath, html, 'utf-8');
  console.log(`\n💾 Saved HTML to: ${outputPath}`);

  // Keep browser open for manual inspection
  console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('\n✅ Done!');
}

debugGoodreads().catch(console.error);
