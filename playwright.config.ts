import { defineConfig, devices } from '@playwright/test'

const previewURL = 'http://127.0.0.1:4189/'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: previewURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'ipad-webkit', use: { ...devices['iPad (gen 7)'] } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npx vite --mode preview --host 127.0.0.1 --port 4189 --strictPort',
      url: previewURL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npx vite --mode production-hub --host 127.0.0.1 --port 4193 --strictPort',
      url: 'http://127.0.0.1:4193/math-grade1-quiz/',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
