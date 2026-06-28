import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000';
const AUTH_URL = process.env.E2E_AUTH_URL ?? 'http://localhost:3004';
const PRODUCT_URL = process.env.E2E_PRODUCT_URL ?? 'http://localhost:3001';
const ORDER_URL = process.env.E2E_ORDER_URL ?? 'http://localhost:3003';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev --prefix frontend',
        url: FRONTEND_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  metadata: {
    authUrl: AUTH_URL,
    productUrl: PRODUCT_URL,
    orderUrl: ORDER_URL,
  },
});
