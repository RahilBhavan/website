/**
 * Automated cookie exporter using Playwright
 * Opens browser, waits for login, then automatically extracts cookies
 */

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function exportCookiesAuto() {
  console.log('🔐 Automated Goodreads Cookie Exporter\n');
  console.log('This will open a browser window. Please log in to Goodreads.\n');
  console.log('The cookies will be automatically extracted after you log in.\n');

  const browser = await chromium.launch({
    headless: false, // Show browser so user can log in
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Navigate to Goodreads login
  console.log('🌐 Opening Goodreads login page...');
  await page.goto('https://www.goodreads.com/user/sign_in', {
    waitUntil: 'networkidle',
  });

  console.log('\n✅ Browser opened!');
  console.log('📝 Please log in to Goodreads in the browser window.\n');
  console.log('⏳ Waiting for you to log in...');
  console.log('   (The script will detect when you\'re logged in)\n');

  // Wait for successful login - check if we're redirected away from sign_in page
  try {
    // Wait for navigation away from login page or for user to manually navigate
    console.log('   Waiting for navigation away from login page...');
    
    await Promise.race([
      page.waitForFunction(
        () => {
          const url = window.location.href;
          return !url.includes('/user/sign_in') && 
                 !url.includes('/ap/signin') &&
                 !url.includes('sign_in');
        },
        { timeout: 300000 } // 5 minutes timeout
      ),
      // Also wait for user to manually navigate or close
      new Promise(resolve => {
        page.on('framenavigated', () => {
          const url = page.url();
          if (!url.includes('/user/sign_in') && !url.includes('/ap/signin')) {
            resolve(null);
          }
        });
      })
    ]);

    // Wait a bit more to ensure cookies are set
    await page.waitForTimeout(3000);

    // Navigate to a Goodreads page to ensure we're logged in
    console.log('   Verifying login status...');
    await page.goto('https://www.goodreads.com/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check if we're actually logged in by looking for user-specific elements
    const isLoggedIn = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      const hasMyBooks = bodyText.includes('My Books') || bodyText.includes('my books');
      const hasSignOut = bodyText.includes('Sign out') || bodyText.includes('sign out') || bodyText.includes('Sign Out');
      const hasUserLink = !!document.querySelector('a[href*="/user/show/"]');
      const noSignIn = !bodyText.includes('Sign in') && !bodyText.includes('sign in');
      
      return (hasMyBooks || hasSignOut || hasUserLink) && noSignIn;
    });

    if (!isLoggedIn) {
      console.log('\n⚠️  Could not confirm login automatically.');
      console.log('   But we\'ll try to extract cookies anyway...\n');
      // Continue anyway - cookies might still be valid
    } else {
      console.log('✅ Login confirmed!\n');
    }

    console.log('✅ Login detected!\n');

    // Get all cookies
    const cookies = await context.cookies();
    
    // Filter for Goodreads cookies - prioritize session cookies
    const goodreadsCookies = cookies.filter(cookie => 
      cookie.domain.includes('goodreads.com') || cookie.domain.includes('.goodreads.com')
    );

    // Also check for important session cookies
    const hasSessionId = goodreadsCookies.some(c => c.name === '_session_id' || c.name === '_session_id2');
    
    if (goodreadsCookies.length === 0) {
      console.log('❌ No Goodreads cookies found.');
      console.log('   Please make sure you\'re logged in and try again.');
      await browser.close();
      process.exit(1);
    }

    if (!hasSessionId) {
      console.log('⚠️  Warning: No session cookies found. The cookies might not work for authentication.');
      console.log('   But we\'ll save them anyway - you can try using them.\n');
    }

    console.log(`📦 Found ${goodreadsCookies.length} cookie(s):`);
    goodreadsCookies.forEach(cookie => {
      console.log(`   - ${cookie.name}`);
    });

    // Save cookies
    const cookiesPath = join(process.cwd(), 'scripts/.goodreads-cookies.json');
    await writeFile(cookiesPath, JSON.stringify(goodreadsCookies, null, 2));

    console.log(`\n✅ Cookies saved to ${cookiesPath}`);
    console.log('🎉 Done! Your cookies are saved and ready to use.\n');

    await browser.close();

  } catch (error: any) {
    if (error.message.includes('timeout')) {
      console.log('\n⏱️  Timeout waiting for login. Please try again.');
    } else {
      console.log(`\n❌ Error: ${error.message}`);
    }
    await browser.close();
    process.exit(1);
  }
}

exportCookiesAuto().catch(console.error);
