import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      // iPhone 12 defaults to webkit; the configured executablePath is Chrome,
      // so pin the engine to chromium while keeping the iPhone viewport.
      use: { ...devices["iPhone 12"], browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
