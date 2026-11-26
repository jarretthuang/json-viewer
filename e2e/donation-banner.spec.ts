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
  { width: 375, height: 812 },
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
      const tabs = await page
        .getByRole("tab", { name: /^view$/i })
        .boundingBox();
      const dismiss = await banner.getByRole("button").boundingBox();
      const message = await banner.locator("p").boundingBox();
      const cta = await banner.getByRole("link").boundingBox();
      expect(bounds!.x).toBeCloseTo(editorContainer!.x, 1);
      expect(bounds!.width).toBeCloseTo(editorContainer!.width, 1);
      const spaceAbove = bounds!.y - (nav!.y + nav!.height);
      const spaceBelow = tabs!.y - (bounds!.y + bounds!.height);
      expect(spaceAbove).toBeGreaterThan(0);
      expect(Math.abs(spaceAbove - spaceBelow)).toBeLessThanOrEqual(1);
      expect(bounds!.height).toBeLessThan(viewport.width < 768 ? 110 : 42);
      await expect(banner).toHaveCSS("border-radius", "12px");
      await expect(banner).not.toHaveCSS("box-shadow", "none");
      if (viewport.width >= 768) {
        expect(message!.height).toBeLessThanOrEqual(20);
        expect(message!.y + message!.height / 2).toBeCloseTo(
          cta!.y + cta!.height / 2,
          0
        );
      }
      if (viewport.width < 768) {
        expect(dismiss!.width).toBeGreaterThanOrEqual(44);
        expect(dismiss!.height).toBeGreaterThanOrEqual(44);
      }
      for (const item of [message!, cta!, dismiss!]) {
        expect(item.x).toBeGreaterThanOrEqual(bounds!.x);
        expect(item.x + item.width).toBeLessThanOrEqual(
          bounds!.x + bounds!.width
        );
        expect(item.y).toBeGreaterThanOrEqual(bounds!.y);
        expect(item.y + item.height).toBeLessThanOrEqual(
          bounds!.y + bounds!.height
        );
      }
      expect(message!.x + message!.width).toBeLessThanOrEqual(dismiss!.x);
      expect(cta!.x + cta!.width).toBeLessThanOrEqual(dismiss!.x);
      const messageSize = await banner
        .locator("p")
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      const ctaSize = await banner
        .getByRole("link")
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      expect(messageSize).toBeGreaterThan(ctaSize);
      // Check message, CTA (including its coffee icon), and dismiss control
      // against their own composited backgrounds in both themes.
      for (const element of [
        banner.locator("p"),
        banner.getByRole("link"),
        banner.getByRole("button"),
      ]) {
        const contrast = await element.evaluate((element) => {
          const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
          let background = [255, 255, 255];
          const ancestors = [];
          for (
            let node: Element | null = element;
            node;
            node = node.parentElement
          ) {
            ancestors.unshift(node);
          }
          for (const node of ancestors) {
            const [r, g, b, a = 1] = rgb(
              getComputedStyle(node).backgroundColor
            );
            background = [r, g, b].map(
              (channel, i) => channel * a + background[i] * (1 - a)
            );
          }
          const luminance = (channels: number[]) =>
            channels
              .slice(0, 3)
              .map((channel) => channel / 255)
              .map((channel) =>
                channel <= 0.04045
                  ? channel / 12.92
                  : ((channel + 0.055) / 1.055) ** 2.4
              )
              .reduce(
                (sum, channel, i) =>
                  sum + channel * [0.2126, 0.7152, 0.0722][i],
                0
              );
          const foreground = luminance(rgb(getComputedStyle(element).color));
          const backdrop = luminance(background);
          return (
            (Math.max(foreground, backdrop) + 0.05) /
            (Math.min(foreground, backdrop) + 0.05)
          );
        });
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
      expect(editor!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
      expect(editor!.height).toBeGreaterThan(200);
      expect(editor!.y + editor!.height).toBeLessThanOrEqual(viewport.height);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBe(viewport.width);
    }
    await page.getByRole("button", { name: /^example$/i }).click();
    await page.getByRole("tab", { name: /^view$/i }).click();
    await expect(page.getByLabel(/json viewer tree/i)).toBeVisible();
    await page.getByRole("tab", { name: /^edit$/i }).click();
    await expect(page.locator(".monaco-editor").first()).toBeVisible();
  });
}

// Protect the rounded, elevated solid strip in both themes and its softly rounded CTA.
for (const dark of [false, true]) {
  test(`banner uses a quiet palette and readable interaction states in ${
    dark ? "dark" : "light"
  } mode`, async ({ page }) => {
    await page.addInitScript(
      (dark) => localStorage.setItem("theme", dark ? "dark" : "light"),
      dark
    );
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(dark ? "dark" : "light");
    const banner = page.locator(".donation-banner");
    const link = banner.getByRole("link");
    const dismiss = banner.getByRole("button");
    await expect(banner).toHaveCSS(
      "background-color",
      dark ? "rgb(48, 48, 48)" : "rgb(197, 233, 239)"
    );
    await expect(banner).toHaveCSS(
      "border-top-color",
      dark ? "rgb(48, 48, 48)" : "rgb(197, 233, 239)"
    );
    await expect(banner).toHaveCSS("border-radius", "12px");
    await expect(banner).not.toHaveCSS("box-shadow", "none");
    await expect(banner).toHaveCSS(
      "color",
      dark ? "rgb(177, 177, 177)" : "rgb(71, 85, 105)"
    );
    await expect(link).toHaveCSS("border-radius", "8px");
    await expect(link).toHaveCSS(
      "background-color",
      dark ? "rgb(42, 42, 42)" : "rgba(255, 255, 255, 0.4)"
    );
    await expect(link).toHaveCSS(
      "color",
      dark ? "rgb(207, 207, 207)" : "rgb(71, 85, 105)"
    );
    await expect(link.locator("svg")).toHaveCSS(
      "color",
      dark ? "rgb(207, 207, 207)" : "rgb(71, 85, 105)"
    );
    await expect(dismiss.locator("svg")).toHaveCSS(
      "color",
      dark ? "rgb(158, 158, 158)" : "rgb(71, 85, 105)"
    );
    await link.hover();
    await expect(link).toHaveCSS(
      "background-color",
      dark ? "rgba(77, 77, 77, 0.4)" : "rgba(255, 255, 255, 0.6)"
    );
    await link.focus();
    await expect(link).toHaveCSS("outline-style", "solid");
    await expect(link).toHaveCSS("outline-width", "2px");
    await dismiss.hover();
    await expect(dismiss).toHaveCSS(
      "background-color",
      dark ? "rgb(42, 42, 42)" : "rgba(0, 0, 0, 0.05)"
    );
    await expect(dismiss).toHaveCSS(
      "color",
      dark ? "rgb(207, 207, 207)" : "rgb(71, 85, 105)"
    );
  });
}
