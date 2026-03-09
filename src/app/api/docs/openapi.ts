export function buildOpenApiSpec(origin: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "json-viewer API",
      version: "1.0.0",
      description:
        "Accepts JSON payloads and returns a shareable json-viewer URL.",
    },
    servers: [{ url: origin }],
    paths: {
      "/api/json": {
        post: {
          summary: "Create a shareable json-viewer URL",
          description:
            "Accepts JSON directly or wrapped in an envelope object with only a top-level `json` key.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      description: "Raw JSON payload",
                    },
                    {
                      type: "object",
                      additionalProperties: false,
                      required: ["json"],
                      properties: {
                        json: {
                          description: "JSON payload to encode",
                        },
                      },
                    },
                  ],
                },
                examples: {
                  raw: {
                    value: { hello: "world" },
                  },
                  envelope: {
                    value: { json: { hello: "world" } },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Shareable URL generated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["url"],
                    properties: {
                      url: {
                        type: "string",
                        format: "uri",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid or missing JSON payload",
            },
            "413": {
              description: "Payload too large to encode in URL",
            },
          },
        },
      },
    },
  };
}
