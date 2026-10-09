import { defineConfig } from "@playwright/test";

const adminPort = process.env.ADMIN_E2E_PORT ?? "3001";
const mockApiPort = process.env.PORTFOLIO_MOCK_API_PORT ?? "4010";
const adminOrigin = `http://127.0.0.1:${adminPort}`;
const mockApiOrigin = `http://127.0.0.1:${mockApiPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: adminOrigin,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/mock-content-api.mjs",
      url: `${mockApiOrigin}/health`,
      env: { PORTFOLIO_MOCK_API_PORT: mockApiPort },
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `npx next dev --hostname 127.0.0.1 --port ${adminPort}`,
      url: `${adminOrigin}/login`,
      env: {
        ADMIN_APP_ORIGIN: adminOrigin,
        BETTER_AUTH_URL: adminOrigin,
        PORTFOLIO_CONTENT_API_URL: `${mockApiOrigin}/api/admin/content`,
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
