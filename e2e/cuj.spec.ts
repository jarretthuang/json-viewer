import { expect, test } from "@playwright/test";

test("core CUJ smoke flow works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("jsonviewer.io")).toBeVisible();

  await page.getByRole("button", { name: /example/i }).click();
  await page.getByRole("tab", { name: /^view$/i }).click();

  const tree = page.getByLabel(/json viewer tree/i);
  await expect(tree).toBeVisible();
  await expect(page.getByLabel(/key json/i)).toBeVisible();

  await page.getByRole("button", { name: /more options/i }).click();
  await expect(page.getByRole("dialog", { name: /json viewer information/i })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /json viewer information/i })).toBeHidden();
});
