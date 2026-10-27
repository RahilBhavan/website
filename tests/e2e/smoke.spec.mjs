import { test, expect } from '@playwright/test';

const pages = [
  ['/', 'Rahil Bhavan'],
  ['/projects', 'Projects'],
  ['/writing', 'Writing'],
  ['/about', 'About'],
  ['/crypto-finance', 'Crypto finance'],
  ['/projects/spine-coinbase-loan-book-risk-model', 'Spine'],
  ['/projects/strategy-capital-markets-toolkit', 'Strategy Capital Markets Toolkit'],
  ['/drag-the-number/spine', 'Drag the number'],
  ['/projects/filing-research-assistant', 'Filing Research Assistant'],
  ['/writing/can-a-filing-answer-be-forced-to-quote-or-abstain', 'quote or abstain'],
  ['/tools/datacenter-math', null],
  ['/riscv/post', null],
];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const [path, heading] of pages) {
    test(`${path} loads at ${viewport.width}px without console errors`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const problems = [];
      page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
      page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));

      const response = await page.goto(path, { waitUntil: 'load' });
      expect(response.status()).toBe(200);
      if (heading) {
        await expect(page.locator('h1').first()).toContainText(heading, { ignoreCase: true });
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });
  }
}
