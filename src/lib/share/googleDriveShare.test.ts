import { isGoogleDriveConfigured } from "./googleDriveShare";

describe("googleDriveShare config", () => {
  const previousDriveToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  const previousShareSecret = process.env.SHARE_SLUG_SECRET;

  afterEach(() => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = previousDriveToken;
    process.env.SHARE_SLUG_SECRET = previousShareSecret;
  });

  it("returns false when SHARE_SLUG_SECRET is missing", () => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = "test-drive-token";
    delete process.env.SHARE_SLUG_SECRET;

    expect(isGoogleDriveConfigured()).toBe(false);
  });

  it("returns true when drive token and slug secret are both present", () => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = "test-drive-token";
    process.env.SHARE_SLUG_SECRET = "test-secret";

    expect(isGoogleDriveConfigured()).toBe(true);
  });
});
