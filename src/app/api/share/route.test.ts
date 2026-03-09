/** @jest-environment node */

import { POST } from "./route";

jest.mock("@/lib/share/driveShare", () => ({
  uploadJsonToDrive: jest.fn(),
}));

const { uploadJsonToDrive } = jest.requireMock("@/lib/share/driveShare") as {
  uploadJsonToDrive: jest.Mock;
};

describe("POST /api/share", () => {
  beforeEach(() => {
    uploadJsonToDrive.mockReset();
  });

  it("returns URL mode when payload fits", async () => {
    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({ json: { hello: "world" } }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("url");
    expect(data.url).toMatch(/^https:\/\/example\.com\/\?json=/);
  });

  it("falls back to Drive in auto mode when payload is too large", async () => {
    uploadJsonToDrive.mockResolvedValue("file-123");

    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({
        json: {
          items: Array.from({ length: 6000 }, (_, i) => `item-${i}-${Math.sin(i).toString(36)}`),
        },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mode).toBe("drive");
    expect(data.slug).toBe("gdrive:file-123");
    expect(data.url).toBe("https://example.com/s/gdrive:file-123");
  });

  it("returns 413 in url mode when payload is too large", async () => {
    const request = new Request("https://example.com/api/share", {
      method: "POST",
      body: JSON.stringify({
        mode: "url",
        json: {
          items: Array.from({ length: 6000 }, (_, i) => `item-${i}-${Math.sin(i).toString(36)}`),
        },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });
});
