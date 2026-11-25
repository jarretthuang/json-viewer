import { expect, test } from "@playwright/test";

for (const width of [1440, 375, 320]) {
  for (const theme of ["light", "dark"]) {
    test(`${width}px ${theme}: mock placements preserve the editor and stay within the viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (theme) => localStorage.setItem("theme", theme),
        theme
      );
      await page.goto("/prototype/ads");
      await expect(page.locator(".monaco-editor").first()).toBeVisible();
      const editor = page.locator(".ads-editor");
      const initial = await editor.boundingBox();
      for (const placement of ["below", "rail", "top", "sticky"]) {
        await page
          .getByLabel("Ad placement", { exact: true })
          .selectOption(placement);
        const ad = page.getByRole("complementary", { name: "Advertisement" });
        await expect(ad).toHaveCount(1);
        await expect(ad).toContainText("Sponsored · Mock");
        const box = await editor.boundingBox();
        expect(box!.width).toBeCloseTo(initial!.width, 0);
        expect(box!.height).toBeCloseTo(initial!.height, 0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          )
        ).toBe(true);
        const adBox = await ad.boundingBox();
        expect(adBox!.x).toBeGreaterThanOrEqual(0);
        expect(adBox!.x + adBox!.width).toBeLessThanOrEqual(width);
        if (width < 600 && placement !== "sticky") {
          expect(adBox!.y).toBeGreaterThanOrEqual(box!.y + box!.height);
        }
        if (placement === "sticky") {
          const dock = await page.locator(".ads-sticky-slot").boundingBox();
          const scrollArea = await page.locator("main").boundingBox();
          expect(scrollArea!.y + scrollArea!.height).toBeLessThanOrEqual(
            dock!.y
          );
        }
        if (["top", "sticky"].includes(placement)) {
          const dismiss = page.getByRole("button", {
            name: "Dismiss mock advertisement",
          });
          const target = await dismiss.boundingBox();
          expect(target!.height).toBeGreaterThanOrEqual(44);
          expect(target!.width).toBeGreaterThanOrEqual(44);
          const slot = page.locator(
            placement === "top" ? ".ads-top-slot" : ".ads-sticky-slot"
          );
          const before = await slot.boundingBox();
          await dismiss.click();
          await expect(ad).toHaveCount(0);
          expect((await slot.boundingBox())!.height).toEqual(before!.height);
          await page.getByRole("button", { name: "Next mock" }).click();
        }
        await page
          .getByRole("checkbox", { name: "Pro user (ads hidden)" })
          .check();
        await expect(ad).toHaveCount(0);
        await page
          .getByRole("checkbox", { name: "Pro user (ads hidden)" })
          .uncheck();
        await expect(ad).toHaveCount(1);
      }
      await page.getByRole("tab", { name: "View", exact: true }).click();
      await expect(page.getByRole("tree")).toBeVisible();
      await page.getByRole("button", { name: "Expand", exact: true }).click();
      await expect(page.getByRole("tree")).toContainText("JSON Viewer");
      await page.getByRole("tab", { name: "Edit", exact: true }).click();
      await expect(page.locator(".monaco-editor").first()).toBeVisible();
    });
  }
}

test("homepage has no prototype controls or ads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("tab", { name: "Edit", exact: true })
  ).toBeVisible();
  await expect(page.getByLabel("Prototype controls")).toHaveCount(0);
  await expect(
    page.getByRole("complementary", { name: "Advertisement" })
  ).toHaveCount(0);
});
