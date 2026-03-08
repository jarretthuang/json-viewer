import { resolveShareTarget } from "./shareStrategy";

describe("resolveShareTarget", () => {
  test("returns url target in auto mode when payload fits", () => {
    const result = resolveShareTarget('{"a":1}', "auto", 1000);
    expect(result.type).toBe("url");
  });

  test("returns drive target in auto mode when payload exceeds url limit", () => {
    const result = resolveShareTarget("a".repeat(200), "auto", 0);
    expect(result).toEqual({ type: "drive" });
  });

  test("throws in url mode when payload exceeds url limit", () => {
    expect(() => resolveShareTarget("a".repeat(200), "url", 0)).toThrow(
      "JSON payload is too large for URL sharing.",
    );
  });

  test("returns drive target when mode is drive", () => {
    const result = resolveShareTarget('{"a":1}', "drive", 1000);
    expect(result).toEqual({ type: "drive" });
  });
});
