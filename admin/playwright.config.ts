import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/mock-content-api.mjs",
      url: "http://127.0.0.1:4010/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev",
      url: "http://127.0.0.1:3001/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
