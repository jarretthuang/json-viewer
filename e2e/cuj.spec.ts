import { expect, test } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

test("core CUJ smoke flow works", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("jsonviewer.io")).toBeVisible();

  await page.getByRole("button", { name: /^example$/i }).click();
  await page.getByRole("tab", { name: /^view$/i }).click();

  const tree = page.getByLabel(/json viewer tree/i);
  await expect(tree).toBeVisible();
  await expect(page.getByLabel(/key json/i)).toBeVisible();

  await page.getByRole("button", { name: /more options/i }).click();
  await expect(page.getByRole("dialog", { name: /json viewer information/i })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /json viewer information/i })).toBeHidden();
});

test("XL example toolbar action is visible on mobile and desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto("/");

  const xlExampleButton = page.getByRole("button", {
    name: /^xl example$/i,
  });
  await expect(xlExampleButton).toBeVisible();

  await page.setViewportSize({ width: 900, height: 800 });
  await expect(xlExampleButton).toBeVisible();
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

test("edit tab lets keyboard users leave Monaco after Escape then Tab", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("tab", { name: /^edit$/i }).click();

  const editor = page.locator(".monaco-editor").first();
  await expect(editor).toBeVisible();
  await editor.click();

  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(document.activeElement?.closest(".monaco-editor"))
      )
    )
    .toBe(true);

  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");

  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(document.activeElement?.closest(".monaco-editor"))
      )
    )
    .toBe(false);
});

test("navbar overlay covers Monaco find widget", async ({ page }) => {
  await page.goto("/");

  const editor = page.locator(".monaco-editor").first();
  await expect(editor).toBeVisible();
  await editor.evaluate((editorElement) => {
    const findWidget = document.createElement("div");
    findWidget.className = "editor-widget find-widget visible";
    findWidget.textContent = "Find";
    findWidget.style.background = "rgb(255, 0, 0)";
    findWidget.style.height = "96px";
    findWidget.style.position = "absolute";
    findWidget.style.right = "0";
    findWidget.style.top = "0";
    findWidget.style.width = "320px";
    findWidget.style.zIndex = "35";
    editorElement.appendChild(findWidget);
  });

  const findWidget = page.locator(".monaco-editor .find-widget.visible").first();
  await expect(findWidget).toBeVisible();

  await page.getByRole("button", { name: /more options/i }).click();

  const dialog = page.getByRole("dialog", { name: /json viewer information/i });
  await expect(dialog).toBeVisible();

  await expect
    .poll(async () =>
      findWidget.evaluate((widget) => {
        const { left, top, width, height } = widget.getBoundingClientRect();
        const elementAtWidgetCenter = document.elementFromPoint(
          left + width / 2,
          top + height / 2
        );

        return elementAtWidgetCenter?.closest("#navbar-expanded-panel")?.id;
      })
    )
    .toBe("navbar-expanded-panel");
});
