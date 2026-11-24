import { expect, test } from "@playwright/test";

test("compare prototype toggles, navigates live changes, and handles invalid B", async ({
  page,
}) => {
  await page.goto("/prototype/compare");
  await expect(page.getByText("Prototype · review only")).toBeVisible();
  const toggle = page.getByRole("switch", { name: /Compare/ });
  await expect(page.locator(".monaco-editor")).toHaveCount(1);
  await toggle.click();
  await expect(page.locator(".monaco-editor")).toHaveCount(2);
  await page.getByRole("tab", { name: "View", exact: true }).click();
  await expect(page.getByText("6 total", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator('[data-current-change="true"]')).toHaveAttribute(
    "data-review-path",
    '["version"]'
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator('[data-current-change="true"]')).toHaveAttribute(
    "data-diff",
    "removed"
  );
  await page.getByRole("button", { name: "Prev", exact: true }).click();
  await expect(page.locator('[data-current-change="true"]')).toHaveAttribute(
    "data-diff",
    "changed"
  );

  await page.getByRole("tab", { name: "Edit", exact: true }).click();
  const secondary = page.getByRole("region", {
    name: "B · Secondary document",
  });
  await secondary.locator(".monaco-editor").click();
  await page.keyboard.press(
    process.platform === "darwin" ? "Meta+A" : "Control+A"
  );
  await page.keyboard.insertText("{invalid");
  await page.getByRole("tab", { name: "View", exact: true }).click();
  await expect(
    page.getByText(
      "Secondary document is invalid. Showing primary document only."
    )
  ).toBeVisible();
  await expect(page.locator("[data-diff]")).toHaveCount(0);
  await expect(page.getByLabel(/json viewer tree/i)).toBeVisible();

  await toggle.click();
  await expect(page.locator(".diff-summary")).toHaveCount(0);
  await page.getByLabel("Preview as free user").check();
  await toggle.click();
  await expect(page.getByRole("region", { name: "PRO upgrade" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Upgrade to PRO" })
  ).toBeVisible();
});

test("compare editors stack on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/compare");
  await page.getByRole("switch", { name: /Compare/ }).click();
  const panes = page.locator(".editor-pane");
  const a = await panes.nth(0).boundingBox();
  const b = await panes.nth(1).boundingBox();
  expect(a).toBeTruthy();
  expect(b).toBeTruthy();
  expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height);
});
