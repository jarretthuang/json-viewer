/** @jest-environment node */

import { decodeJsonQueryParam, JSON_QUERY_PARAM } from "@/components/json-viewer/utils/jsonUrlUtils";
import { POST } from "./route";

describe("POST /api/json", () => {
  it("returns a viewer URL for raw JSON payload", async () => {
    const request = new Request("https://example.com/api/json", {
      method: "POST",
      body: JSON.stringify({ hello: "world" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toMatch(/^https:\/\/example\.com\/\?json=/);

    const url = new URL(data.url);
    const encoded = url.searchParams.get(JSON_QUERY_PARAM);

    expect(decodeJsonQueryParam(encoded)).toBe(JSON.stringify({ hello: "world" }));
  });

  it("supports payload passed in a json field", async () => {
    const request = new Request("https://example.com/api/json", {
      method: "POST",
      body: JSON.stringify({ json: { answer: 42 } }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();
    const encoded = new URL(data.url).searchParams.get(JSON_QUERY_PARAM);

    expect(response.status).toBe(200);
    expect(decodeJsonQueryParam(encoded)).toBe(JSON.stringify({ answer: 42 }));
  });

  it("returns 400 when payload is invalid json", async () => {
    const request = new Request("https://example.com/api/json", {
      method: "POST",
      body: "{invalid json",
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 413 when payload is too large for query param", async () => {
    const request = new Request("https://example.com/api/json", {
      method: "POST",
      body: JSON.stringify({
        items: Array.from(
          { length: 6000 },
          (_, index) => `item-${index}-${Math.sin(index).toString(36)}`,
        ),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error).toMatch(/too large/i);
  });
});
