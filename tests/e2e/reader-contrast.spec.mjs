import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { readingContrast } from './contrast.mjs';
const books = [...JSON.parse(readFileSync('src/data/textbooks.json', 'utf8')).map(book => book.slug), 'strategy-bitcoin'];
for (const width of [390, 1280]) for (const book of books) {
  test(`${book} text contrasts with the final reading background at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/textbooks/${book}`);
    const result = await page.evaluate(readingContrast);
    expect(result.checked).toBeGreaterThan(20);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(result.failures).toEqual([]);
  });
}
