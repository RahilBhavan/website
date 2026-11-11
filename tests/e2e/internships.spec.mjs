import { test, expect } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`internship list searches, filters and keeps the view in the link at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));

    await page.goto('/tools/internships');
    await expect(page.locator('h1')).toHaveText('Internship openings');
    await expect(page.locator('#count')).toContainText(/Showing all [\d,]+ open roles/);
    await expect(page.locator('.role')).toHaveCount(50);
    const href = await page.locator('.role .go').first().getAttribute('href');
    expect(href).toMatch(/^https:\/\//);

    await page.locator('#q').fill('zzzz-no-such-role');
    await expect(page.locator('#list')).toContainText('No open roles match these filters');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('#count')).toContainText('Showing all');

    await page.locator('#field').selectOption({ index: 1 });
    const field = await page.locator('#field').inputValue();
    await expect(page.locator('#count')).toContainText(/roles? match/);
    for (const meta of await page.locator('.role .meta').allInnerTexts()) expect(meta).toContain(field);
    await page.reload();
    await expect(page.locator('#field')).toHaveValue(field);

    await page.getByRole('button', { name: /^Show \d+ more/ }).click();
    await expect(page.locator('.role .go').nth(50)).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('a failed data load explains itself', async ({ page }) => {
  await page.route('**/tools/internships/data.json', (route) => route.fulfill({ status: 503, body: '' }));
  await page.goto('/tools/internships');
  await expect(page.locator('#count')).toHaveText("The role list didn't load.");
  await expect(page.locator('#list')).toContainText('Reload the page to try again');
});
