import {
  ARRAY_CHILD_CHUNK_SIZE,
  LARGE_JSON_TEXT_LENGTH,
  MAX_EXPAND_ALL_NODE_COUNT,
  MAX_HIGHLIGHT_TEXT_LENGTH,
  MAX_URL_SYNC_SOURCE_LENGTH,
  XL_JSON_TEXT_LENGTH,
  getJsonUrlSyncDelay,
  isLargeJsonText,
  isXLJsonText,
  shouldAllowExpandAll,
  shouldHighlightJsonText,
  shouldSyncJsonTextToUrl,
} from "./jsonPerformanceUtils";

describe("jsonPerformanceUtils", () => {
  test("classifies large and XL text by source length", () => {
    expect(isLargeJsonText("x".repeat(LARGE_JSON_TEXT_LENGTH - 1))).toBe(false);
    expect(isLargeJsonText("x".repeat(LARGE_JSON_TEXT_LENGTH))).toBe(true);

    expect(isXLJsonText("x".repeat(XL_JSON_TEXT_LENGTH - 1))).toBe(false);
    expect(isXLJsonText("x".repeat(XL_JSON_TEXT_LENGTH))).toBe(true);
  });

  test("uses a longer URL sync delay for large JSON", () => {
    expect(getJsonUrlSyncDelay("{}")).toBeLessThan(
      getJsonUrlSyncDelay("x".repeat(LARGE_JSON_TEXT_LENGTH))
    );
  });

  test("skips URL sync and syntax highlighting above source thresholds", () => {
    expect(shouldSyncJsonTextToUrl("")).toBe(false);
    expect(shouldSyncJsonTextToUrl("x".repeat(MAX_URL_SYNC_SOURCE_LENGTH))).toBe(
      true
    );
    expect(
      shouldSyncJsonTextToUrl("x".repeat(MAX_URL_SYNC_SOURCE_LENGTH + 1))
    ).toBe(false);

    expect(shouldHighlightJsonText("x".repeat(MAX_HIGHLIGHT_TEXT_LENGTH))).toBe(
      true
    );
    expect(
      shouldHighlightJsonText("x".repeat(MAX_HIGHLIGHT_TEXT_LENGTH + 1))
    ).toBe(false);
  });

  test("caps expand-all by node count", () => {
    expect(shouldAllowExpandAll(0)).toBe(false);
    expect(shouldAllowExpandAll(MAX_EXPAND_ALL_NODE_COUNT)).toBe(true);
    expect(shouldAllowExpandAll(MAX_EXPAND_ALL_NODE_COUNT + 1)).toBe(false);
  });

  test("defines a bounded array child chunk size", () => {
    expect(ARRAY_CHILD_CHUNK_SIZE).toBe(100);
  });
});
