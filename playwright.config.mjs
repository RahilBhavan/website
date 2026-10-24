import { defineConfig, devices } from '@playwright/test';

// Smoke test against the built site. Run `bun run build` first.
export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', ...devices['Desktop Firefox'] },
  projects: [{ name: 'firefox' }],
  webServer: {
    command: 'node scripts/serve-dist.mjs 4321',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
  },
});
