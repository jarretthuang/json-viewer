import { expect, test } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

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

test("edit tab can format and minimize JSON", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: /^edit$/i }).click();

  const editor = page.locator(".monaco-editor").first();
  await expect(editor).toBeVisible();
  await editor.click();

  const modifier = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+A`);
  await page.keyboard.type('{"a":1}');

  await page.getByRole("button", { name: /^format$/i }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("json"))
    .toBe(compressToEncodedURIComponent('{\n  "a": 1\n}'));

  await page.getByRole("button", { name: /^minimize$/i }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("json"))
    .toBe(compressToEncodedURIComponent('{"a":1}'));
});
