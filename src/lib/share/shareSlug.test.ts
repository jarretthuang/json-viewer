import { buildGoogleDriveSlug, parseShareSlug } from "./shareSlug";

describe("shareSlug", () => {
  const previousShareSecret = process.env.SHARE_SLUG_SECRET;

  beforeEach(() => {
    process.env.SHARE_SLUG_SECRET = "test-share-secret";
  });

  afterAll(() => {
    process.env.SHARE_SLUG_SECRET = previousShareSecret;
  });

  it("builds and parses a signed gdrive slug", () => {
    const slug = buildGoogleDriveSlug("abc123");

    expect(slug).toMatch(/^gdrive:abc123:[A-Za-z0-9_-]{24}$/);
    expect(parseShareSlug(slug)).toEqual({ provider: "gdrive", fileId: "abc123" });
  });

  it("returns url provider for non-gdrive values", () => {
    expect(parseShareSlug("plain-url")).toEqual({ provider: "url" });
  });

  it("returns null for empty gdrive id", () => {
    expect(parseShareSlug("gdrive:")).toBeNull();
  });

  it("returns null for unsigned gdrive references", () => {
    expect(parseShareSlug("gdrive:abc123")).toBeNull();
  });

  it("returns null when signature is invalid", () => {
    expect(parseShareSlug("gdrive:abc123:invalid-signature")).toBeNull();
  });
});
