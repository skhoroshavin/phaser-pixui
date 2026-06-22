import { expect, test } from "@playwright/test";

test("smoke test", async ({ page }) => {
  const width = 640;
  const height = 360;

  await page.goto("http://localhost:8080");

  const canvas = page.locator("#game-container canvas");
  await canvas.waitFor({ state: "visible", timeout: 15000 });

  // Wait for assets to load and scenes to render.
  await page.waitForTimeout(100);
  await expect(canvas).toHaveScreenshot("start.png");

  // Wait for a bit and check that game renders the same
  await page.waitForTimeout(1000);
  await expect(canvas).toHaveScreenshot("start.png");

  // Move the mouse above the load button and check it moves to hover state
  await page.mouse.move(width / 2, height / 2);
  await expect(canvas).toHaveScreenshot("load_hover.png");

  // Press the mouse on the load button and check it moves to pressed state
  await page.mouse.down();
  await expect(canvas).toHaveScreenshot("load_press.png");

  // Release the mouse and check that the load dialog appears
  await page.mouse.up();
  await expect(canvas).toHaveScreenshot("load_dialog.png");

  // Click the OK button and check that the load dialog disappears
  await page.mouse.click(width / 2, height / 2 + 16);
  await expect(canvas).toHaveScreenshot("start.png");
});
