import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

/**
 * E2E + a11y harness against the prerendered static build (what actually ships).
 *   npm run build && npm run e2e
 * E2E_DIST=<path> tests another build output (e.g. .devcache/build/qa), E2E_PORT changes the port.
 * Browsers live in .devcache/playwright (C: is full); workers inherit the env set here.
 */
const root = __dirname;
process.env['PLAYWRIGHT_BROWSERS_PATH'] ??= resolve(root, '.devcache/playwright');
const dist = process.env['E2E_DIST'] ?? 'dist/mhfrough/browser';
const port = Number(process.env['E2E_PORT'] ?? 4400);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests',
  outputDir: '.devcache/playwright-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright/html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    colorScheme: 'dark',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    // Pixel 7 viewport on Chromium (the device preset is Chromium already).
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx http-server "${dist}" -p ${port} -a 127.0.0.1 -c-1 --silent`,
    url: `${baseURL}/`,
    // Reuse a running `npm run serve:dist` locally, but never when a specific build was requested:
    // whatever already listens on that port may be serving something else.
    reuseExistingServer: !process.env['CI'] && !process.env['E2E_DIST'],
    timeout: 30_000,
  },
});
