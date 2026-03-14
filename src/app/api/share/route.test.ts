/** @jest-environment node */

jest.mock("@/lib/share/googleDriveShare", () => ({
  isGoogleDriveConfigured: jest.fn(),
  uploadJsonToDrive: jest.fn(),
}));

import { POST } from "./route";
import {
  isGoogleDriveConfigured,
  uploadJsonToDrive,
} from "@/lib/share/googleDriveShare";
import { decodeJsonQueryParam } from "@/components/json-viewer/utils/jsonUrlUtils";

const mockedDriveConfigured = isGoogleDriveConfigured as jest.Mock;
const mockedUploadJsonToDrive = uploadJsonToDrive as jest.Mock;

describe("POST /api/share", () => {
  const previousDriveToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  const previousShareSecret = process.env.SHARE_SLUG_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = "test-drive-token";
    process.env.SHARE_SLUG_SECRET = "test-share-secret";
  });

  afterAll(() => {
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN = previousDriveToken;
    process.env.SHARE_SLUG_SECRET = previousShareSecret;
  });

  it("returns URL mode for small payloads in auto mode", async () => {
    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({ json: { hello: "world" }, mode: "auto" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("url");
    expect(data.url).toMatch(/^https:\/\/example\.com\/\?json=/);
    expect(mockedUploadJsonToDrive).not.toHaveBeenCalled();
  });

  it("falls back to Google Drive for large payloads in auto mode", async () => {
    mockedDriveConfigured.mockReturnValue(true);
    mockedUploadJsonToDrive.mockResolvedValue("file-123");

    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({
        json: {
          items: Array.from(
            { length: 6000 },
            (_, index) => `item-${index}-${Math.sin(index).toString(36)}`,
          ),
        },
        mode: "auto",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("drive");
    expect(data.url).toMatch(
      /^https:\/\/example\.com\/s\/gdrive%3Afile-123%3A[A-Za-z0-9_-]{24}$/,
    );
    expect(mockedUploadJsonToDrive).toHaveBeenCalledTimes(1);
  });

  it("returns 413 when payload is large and drive is not configured", async () => {
    mockedDriveConfigured.mockReturnValue(false);

    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({
        json: {
          items: Array.from(
            { length: 6000 },
            (_, index) => `item-${index}-${Math.sin(index).toString(36)}`,
          ),
        },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });

  it("preserves raw objects that include a json field", async () => {
    const payload = { json: { hello: "world" }, meta: { source: "raw" } };

    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("url");

    const encoded = new URL(data.url).searchParams.get("json");
    expect(encoded).toBeTruthy();

    const decoded = encoded ? decodeJsonQueryParam(encoded) : undefined;
    expect(decoded ? JSON.parse(decoded) : undefined).toEqual(payload);
  });

  it("treats {json, mode} with non-share mode as raw payload", async () => {
    const payload = { json: { hello: "world" }, mode: "strict" };

    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("url");

    const encoded = new URL(data.url).searchParams.get("json");
    expect(encoded).toBeTruthy();

    const decoded = encoded ? decodeJsonQueryParam(encoded) : undefined;
    expect(decoded ? JSON.parse(decoded) : undefined).toEqual(payload);
  });
});
