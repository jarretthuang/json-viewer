import {
  isGoogleDriveConfigured,
  readJsonFromDriveById,
  uploadJsonToDrive,
} from "./googleDriveShare";

describe("googleDriveShare config", () => {
  const previousDriveToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  const previousShareSecret = process.env.SHARE_SLUG_SECRET;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = previousDriveToken;
    process.env.SHARE_SLUG_SECRET = previousShareSecret;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
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

  it("rejects uploads when the slug secret is missing", async () => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = "test-drive-token";
    delete process.env.SHARE_SLUG_SECRET;
    global.fetch = jest.fn();

    await expect(uploadJsonToDrive('{"hello":"world"}')).rejects.toThrow(
      "Google Drive is not configured.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects reads when the slug secret is missing", async () => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = "test-drive-token";
    delete process.env.SHARE_SLUG_SECRET;
    global.fetch = jest.fn();

    await expect(readJsonFromDriveById("file-123")).rejects.toThrow(
      "Google Drive is not configured.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
