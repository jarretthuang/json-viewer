/** @jest-environment node */

import { GET } from "./route";

describe("GET /openapi.json", () => {
  it("returns OpenAPI spec for API discovery", async () => {
    const request = new Request("https://example.com/openapi.json");

    const response = GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.openapi).toBe("3.1.0");
    expect(data.paths?.["/api/json"]?.post).toBeTruthy();
    expect(data.servers).toEqual([{ url: "https://example.com" }]);
  });
});
