import { test, expect } from '@playwright/test';

test('RAM guide exposes real traces, all chapters and public-only data', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/guides/box-ram');
  await expect(page.locator('#traces circle')).toHaveCount(602);
  await page.locator('#expand').click();
  await expect(page.locator('.chapter[open]')).toHaveCount(6);
  await expect(page.locator('#chapter-5')).toContainText('Stop conditions');
  await page.locator('#collapse').click();
  await expect(page.locator('.chapter[open]')).toHaveCount(0);
  const response = await page.request.get('/guides/box-ram/measurements.json');
  expect(response.ok()).toBeTruthy();
  const text = await response.text();
  expect(text).not.toContain('/home/');
  expect(text).not.toContain('project');
  const data = JSON.parse(text);
  expect(data.first.samples.length + data.repeat.samples.length).toBe(602);
  expect(errors).toEqual([]);
});

test('RAM guide stays readable at 320px and retains chapter navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/guides/box-ram#chapter-3');
  await expect(page.locator('#chapter-3')).toHaveAttribute('open', '');
  await page.locator('#expand').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('RAM guide retains evidence when the optional data plot cannot load', async ({ page }) => {
  await page.route('**/guides/box-ram/measurements.json', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/guides/box-ram');
  await expect(page.locator('#traces')).toContainText('could not load');
  await expect(page.getByText('4.063 ms', { exact: true }).first()).toBeVisible();
  await page.locator('#expand').click();
  await expect(page.locator('.chapter[open]')).toHaveCount(6);
});
