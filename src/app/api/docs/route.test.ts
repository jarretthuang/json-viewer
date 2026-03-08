/** @jest-environment node */

import { GET } from "./route";

describe("GET /api/docs", () => {
  it("returns available API endpoints", async () => {
    const request = new Request("https://example.com/api/docs");

    const response = GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("json-viewer API");
    expect(data.docs.openapi).toBe("https://example.com/openapi.json");
    expect(data.endpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/api/json",
        }),
      ]),
    );
    expect(data.openapi?.openapi).toBe("3.1.0");
    expect(data.openapi?.paths?.["/api/json"]?.post).toBeTruthy();
  });
});
