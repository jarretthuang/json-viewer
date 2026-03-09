import { buildGDriveSlug, parseShareSlug } from "./shareSlug";

describe("shareSlug", () => {
  it("builds and parses gdrive slugs", () => {
    const slug = buildGDriveSlug("abc123");

    expect(slug).toBe("gdrive:abc123");
    expect(parseShareSlug(slug)).toEqual({ provider: "gdrive", fileId: "abc123" });
  });

  it("returns unknown for invalid slug", () => {
    expect(parseShareSlug("foo:bar")).toEqual({ provider: "unknown" });
    expect(parseShareSlug("gdrive:")).toEqual({ provider: "unknown" });
  });
});
