import { NextResponse } from "next/server";

import { buildOpenApiSpec } from "./openapi";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: "json-viewer API",
    docs: {
      openapi: `${origin}/openapi.json`,
    },
    endpoints: [
      {
        method: "POST",
        path: "/api/json",
        description:
          "Accepts any JSON payload and returns a shareable json-viewer URL.",
        requestBody: {
          examples: [{ hello: "world" }, { json: { hello: "world" } }],
        },
        response: {
          example: {
            url: `${origin}/?json=<compressed-json-query-param>`,
          },
        },
      },
      {
        method: "POST",
        path: "/api/share",
        description:
          "Creates a share link with auto URL mode and Google Drive fallback for large payloads.",
        requestBody: {
          examples: [{ json: { hello: "world" }, mode: "auto" }],
        },
        response: {
          example: {
            mode: "drive",
            slug: "gdrive:<fileId>",
            url: `${origin}/s/gdrive:<fileId>`,
          },
        },
      },
    ],
    openapi: buildOpenApiSpec(origin),
  });
}
