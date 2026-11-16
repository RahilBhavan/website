import { test, expect } from '@playwright/test';

for (const book of ['riscv', 'cortex-m']) {
  test(`${book} reading text contrasts with its final cascaded background`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/textbooks/${book}`);
    const result = await page.evaluate(() => {
      const rgb = value => value.match(/[\d.]+/g).map(Number);
      const luminance = color => rgb(color).slice(0, 3).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const failures = [];
      let checked = 0;
      for (const el of document.querySelectorAll('a, small, .eyebrow, .foot, code, .top h1, .top p, footer p')) {
        if (!el.getClientRects().length || !el.textContent.trim() || el.closest('svg')) continue;
        let background = 'rgb(255, 255, 255)';
        for (let node = el; node; node = node.parentElement) {
          const value = getComputedStyle(node).backgroundColor;
          if (rgb(value)[3] !== 0) { background = value; break; }
        }
        const foreground = getComputedStyle(el).color;
        const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
        const ratio = (values[1] + .05) / (values[0] + .05);
        checked++;
        if (ratio < 4.5) failures.push({ text: el.textContent.trim().slice(0, 80), foreground, background, ratio });
      }
      return { checked, failures };
    });
    expect(result.checked).toBeGreaterThan(20);
    expect(result.failures).toEqual([]);
  });
}
