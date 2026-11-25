import { expect, test } from "@playwright/test";

test("donation banner uses the footer URL and supports keyboard dismissal across reloads", async ({
  page,
  browserName,
}) => {
  await page.goto("/");
  const banner = page.getByRole("complementary", {
    name: "Support JSON Viewer",
  });
  const link = banner.getByRole("link", { name: /Buy me a coffee/ });
  await expect(link).toHaveAttribute(
    "href",
    "https://www.buymeacoffee.com/jarretthuang"
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  await link.focus();
  // macOS WebKit uses Option+Tab to include buttons in keyboard navigation.
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab"
  );
  await expect(
    banner.getByRole("button", { name: "Dismiss donation banner" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(banner).toBeHidden();
  await page.getByRole("button", { name: /^example$/i }).click();
  await page.getByRole("tab", { name: /^view$/i }).click();
  await expect(page.getByLabel(/json viewer tree/i)).toBeVisible();
});

test("saved dismissal applies before hydration without reserving banner space", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("json-viewer:donation-banner-dismissed", "true");
  });
  // The inline storage check must work even before the app's JavaScript loads.
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator(".donation-banner")).toHaveCSS("display", "none");
  await expect(page.locator("html")).toHaveAttribute(
    "data-donation-dismissed",
    "true"
  );
});

test("storage restrictions still allow dismissal and editor use", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage unavailable");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Dismiss donation banner" }).click();
  await expect(page.locator(".donation-banner")).toBeHidden();
  await page.getByRole("button", { name: /^example$/i }).click();
  await expect(page.locator(".monaco-editor").first()).toBeVisible();
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 640 },
]) {
  test(`banner fits above the editor at ${viewport.width}px in light and dark themes`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const banner = page.getByRole("complementary", {
      name: "Support JSON Viewer",
    });
    await expect(banner).toBeVisible();
    await expect(page.locator(".monaco-editor").first()).toBeVisible();

    for (const dark of [false, true]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        dark
      );
      const bounds = await banner.boundingBox();
      const editor = await page.locator(".monaco-editor").first().boundingBox();
      // Monaco rounds its internal canvas width down to whole pixels; compare
      // the actual editor container for the app's fractional rem-based inset.
      const editorContainer = await page
        .locator(".JsonViewerEditor")
        .boundingBox();
      const nav = await page.getByRole("navigation").boundingBox();
      const message = await banner.locator("p").boundingBox();
      const cta = await banner.getByRole("link").boundingBox();
      expect(bounds!.x).toBeCloseTo(editorContainer!.x, 1);
      expect(bounds!.width).toBeCloseTo(editorContainer!.width, 1);
      expect(bounds!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height);
      expect(bounds!.height).toBeLessThan(viewport.width < 768 ? 110 : 42);
      if (viewport.width >= 768) {
        expect(message!.height).toBeLessThanOrEqual(18);
        expect(message!.y + message!.height / 2).toBeCloseTo(
          cta!.y + cta!.height / 2,
          0
        );
      }
      expect(cta!.x + cta!.width).toBeLessThanOrEqual(
        bounds!.x + bounds!.width
      );
      expect(editor!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
      expect(editor!.height).toBeGreaterThan(200);
      expect(editor!.y + editor!.height).toBeLessThanOrEqual(viewport.height);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBe(viewport.width);
    }
  });
}
