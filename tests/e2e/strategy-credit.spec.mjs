import { test, expect } from '@playwright/test';

for (const width of [1280, 390, 320]) {
  test(`Strategy credit dashboard renders without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));

    await page.goto('/tools/strategy-credit');
    await expect(page.locator('h1')).toContainText("Strategy's digital credit");
    await expect(page.locator('.status')).toContainText('not a forecast or investment advice');
    await expect(page.locator('main section')).toHaveCount(12);
    expect(await page.evaluate(() => document.fonts.check('700 20px Archivo'))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('nav a[href="#limitations"]').click();
    await expect(page.locator('#limitations')).toBeInViewport();
    expect(errors).toEqual([]);
  });
}

test('page title names the author', async ({ page }) => {
  await page.goto('/tools/strategy-credit');
  await expect(page).toHaveTitle(/Rahil Bhavan/);
});
