import { expect, test } from "@playwright/test";

test("smoke test", async ({ page }) => {
  const width = 1920;
  const height = 1080;

  await page.goto("http://localhost:8080");

  const canvas = page.locator("#game-container canvas");
  await canvas.waitFor({ state: "visible", timeout: 15000 });

  // Wait for assets to settings and scenes to render.
  await page.waitForTimeout(100);
  await expect(canvas).toHaveScreenshot("start.png");

  // Wait for a bit and check that game renders the same
  await page.waitForTimeout(1000);
  await expect(canvas).toHaveScreenshot("start.png");

  // Move the mouse above the settings button and check it moves to hover state
  await page.mouse.move(width / 2, height / 2 + 24);
  await expect(canvas).toHaveScreenshot("settings-hover.png");

  // Press the mouse on the settings button and check it moves to pressed state
  await page.mouse.down();
  await expect(canvas).toHaveScreenshot("settings-press.png");

  // Release the mouse and check that the settings dialog appears
  await page.mouse.up();
  await expect(canvas).toHaveScreenshot("settings-dialog.png");

  // Click the OK button and check that the settings dialog disappears
  await page.mouse.click(width / 2, height / 2 + 192);
  await expect(canvas).toHaveScreenshot("start.png");
});
