import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/screenshots",
  snapshotPathTemplate: "{snapshotDir}/{testFileName}/{arg}{ext}",
  retries: 0,
  workers: 1,

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        launchOptions: {
          args: ["--use-gl=angle"],
        },
      },
    },
  ],

  webServer: {
    command: "cd example && npm run build && npm run preview",
    port: 8080,
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
    },
  },
});
