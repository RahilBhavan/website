import { test, expect } from '@playwright/test';

for (const width of [1280, 390, 320]) {
  test(`token guide navigation and evidence at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));
    await page.goto('/writing/stop-asking-a-model-to-wait');
    await expect(page.locator('h1')).toHaveText('Stop asking a model to wait');
    await page.getByRole('link', { name: /Explore the interactive guide/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stop asking a model to wait.');
    const sections = ['waiting', 'polling', 'context', 'reviews', 'instructions', 'accounting'];
    for (const id of sections) {
      await page.locator(`[aria-controls="${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('#tab-instructions').click();
    await expect(page.locator('#instructions')).toContainText('19,829');
    await expect(page.locator('#instructions')).toContainText('10,547');
    await page.locator('#tab-context').click();
    await expect(page.locator('#context')).toContainText('Existing owners still use continuing sessions');
    await page.locator('#tab-waiting').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-polling')).toBeFocused();
    await expect(page.locator('#polling')).toBeVisible();
    await page.getByText('Read the public methods and implementation notes', { exact: true }).click();
    await page.getByRole('link', { name: 'Open the methods', exact: true }).click();
    await expect(page.locator('h1')).toContainText('How I measured');
    expect(errors).toEqual([]);
  });
}

test('all guide sections remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/tools/token-efficiency');
  for (const id of ['waiting', 'polling', 'context', 'reviews', 'instructions', 'accounting']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await context.close();
});
