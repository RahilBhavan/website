/**
 * Helper script to export Goodreads cookies for authentication
 * Opens your default browser and provides instructions for exporting cookies
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as readline from 'readline';

const execAsync = promisify(exec);

/**
 * Open URL in default browser (cross-platform)
 */
async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  
  let command: string;
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  await execAsync(command);
}

/**
 * Prompt user for input
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Instructions for exporting cookies
 */
function printInstructions() {
  console.log('\n📋 Instructions to Export Cookies:\n');
  console.log('1. After logging in, open Developer Tools:');
  console.log('   - Chrome/Edge: Press F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)');
  console.log('   - Firefox: Press F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)');
  console.log('   - Safari: Enable Developer menu first, then Cmd+Option+I\n');
  
  console.log('2. Go to the Application/Storage tab:');
  console.log('   - Chrome/Edge: Application → Cookies → https://www.goodreads.com');
  console.log('   - Firefox: Storage → Cookies → https://www.goodreads.com');
  console.log('   - Safari: Storage → Cookies → https://www.goodreads.com\n');
  
  console.log('3. Find these cookies and copy their values:');
  console.log('   - _session_id');
  console.log('   - _session_id2');
  console.log('   - Any other session cookies\n');
  
  console.log('4. Paste the cookie values when prompted below.\n');
  console.log('─'.repeat(60) + '\n');
}

async function exportCookies() {
  console.log('🔐 Goodreads Cookie Exporter\n');
  console.log('This will open your default browser to Goodreads.\n');
  
  // Open Goodreads login page in default browser
  console.log('Opening Goodreads login page in your default browser...\n');
  await openBrowser('https://www.goodreads.com/user/sign_in');
  
  // Wait a moment for browser to open
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ Browser opened! Please log in to Goodreads.\n');
  
  // Wait for user to log in
  await promptUser('Press Enter after you have logged in to Goodreads...\n');
  
  printInstructions();
  
  // Collect cookie values
  const sessionId = await promptUser('Enter _session_id value: ');
  const sessionId2 = await promptUser('Enter _session_id2 value (or press Enter if not available): ');
  
  if (!sessionId) {
    console.error('\n❌ _session_id is required!');
    process.exit(1);
  }
  
  // Build cookies array
  const cookies: any[] = [
    {
      name: '_session_id',
      value: sessionId.trim(),
      domain: '.goodreads.com',
      path: '/',
      expires: -1,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ];
  
  if (sessionId2 && sessionId2.trim()) {
    cookies.push({
      name: '_session_id2',
      value: sessionId2.trim(),
      domain: '.goodreads.com',
      path: '/',
      expires: -1,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
  }
  
  // Save cookies
  const cookiesPath = join(process.cwd(), 'scripts/.goodreads-cookies.json');
  await writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
  
  console.log(`\n✅ Cookies saved to ${cookiesPath}`);
  console.log(`📚 Saved ${cookies.length} cookie(s)`);
  console.log('\n🎉 Done! Your cookies are saved and ready to use.');
  console.log('   The browser automation will now use these cookies for authentication.\n');
}

exportCookies().catch(console.error);
