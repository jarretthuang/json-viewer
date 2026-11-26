import { expect, type Page } from "@playwright/test";

export async function waitForEditor(page: Page) {
  const editor = page.locator(".monaco-editor").first();
  // Monaco loads asynchronously in a separate, large development bundle.
  // WebKit on CI can need longer than the default 5s assertion timeout.
  await expect(editor).toBeVisible({ timeout: 15_000 });
  return editor;
}
