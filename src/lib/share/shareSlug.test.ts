import { buildGoogleDriveSlug, parseShareSlug } from "./shareSlug";

describe("shareSlug", () => {
  it("builds and parses a gdrive slug", () => {
    const slug = buildGoogleDriveSlug("abc123");

    expect(slug).toBe("gdrive:abc123");
    expect(parseShareSlug(slug)).toEqual({ provider: "gdrive", fileId: "abc123" });
  });

  it("returns url provider for non-gdrive values", () => {
    expect(parseShareSlug("plain-url")).toEqual({ provider: "url" });
  });

  it("returns null for empty gdrive id", () => {
    expect(parseShareSlug("gdrive:")).toBeNull();
  });
});
