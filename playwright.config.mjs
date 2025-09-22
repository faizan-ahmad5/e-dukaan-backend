import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E-Dukaan E2E Tests
 *
 * Tests comprehensive user journeys including:
 * - User registration and authentication
 * - Product browsing and search
 * - Shopping cart operations
 * - Order placement and checkout
 * - Admin operations
 */
export default defineConfig({
  // Test directory
  testDir: "./tests/e2e",

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Maximum time to wait for action
  expect: {
    timeout: 10 * 1000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "test-results/html-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:5000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Record video on failure
    video: "retain-on-failure",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Extra HTTP headers
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Test against mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: "cross-env NODE_ENV=test npm run start",
    port: 5000,
    reuseExistingServer: !process.env.CI,

    // Environment variables for the server
    env: {
      NODE_ENV: "test",
      PORT: "5000",
    },
  },

  // Global setup and teardown
  globalSetup: "./tests/e2e/global-setup.mjs",
  globalTeardown: "./tests/e2e/global-teardown.mjs",

  // Output directory for test artifacts
  outputDir: "test-results/artifacts",

  // Directory for test fixtures
  testDir: "./tests/e2e",

  // Test match patterns
  testMatch: ["**/*.e2e.{js,mjs}", "**/*.spec.{js,mjs}", "**/*.test.{js,mjs}"],

  // Global test configuration
  globalTimeout: 10 * 60 * 1000, // 10 minutes

  // Metadata
  metadata: {
    testType: "e2e",
    framework: "playwright",
    application: "e-dukaan-backend",
    version: "1.0.0",
  },
});
