export function buildOpenApiSpec(origin: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "json-viewer API",
      version: "1.1.0",
      description:
        "Accepts JSON payloads and returns shareable json-viewer links via URL mode or Google Drive fallback.",
    },
    servers: [{ url: origin }],
    paths: {
      "/api/json": {
        post: {
          summary: "Create a shareable json-viewer URL",
          description:
            "Accepts JSON directly or wrapped in an envelope object with only a top-level `json` key.",
          responses: {
            "200": { description: "Shareable URL generated" },
            "400": { description: "Invalid or missing JSON payload" },
            "413": { description: "Payload too large to encode in URL" },
          },
        },
      },
      "/api/share": {
        post: {
          summary: "Create a share link with URL/Drive fallback",
          description:
            "Supports modes: auto (default), url, and drive. Auto uses URL when small and Drive fallback when payload is large.",
          responses: {
            "200": { description: "Share link generated" },
            "400": { description: "Invalid or missing JSON payload" },
            "413": { description: "Payload too large for URL mode" },
            "503": { description: "Drive fallback unavailable" },
          },
        },
      },
    },
  };
}
