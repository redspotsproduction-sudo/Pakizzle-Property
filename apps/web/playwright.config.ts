import { defineConfig, devices } from "@playwright/test";

/**
 * Pakizzle E2E configuration.
 *
 * Targets BASE_URL (default http://localhost:3000) so the same suite can run
 * against:
 *   • a local docker-compose stack (CI default)
 *   • a dev server you started with `make web`
 *   • a deployed environment (set BASE_URL=https://pakizzle.amsterdamhostel.cloud)
 *
 * In CI, `webServer` is intentionally NOT used — docker-compose brings up the
 * whole stack before the tests run. For purely local dev, you can uncomment
 * the webServer block to have Playwright spawn `next start` on demand.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false, // tests touch shared DB state — keep sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  expect: { timeout: 10_000 },
});
