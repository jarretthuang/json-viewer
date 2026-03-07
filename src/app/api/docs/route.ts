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
    ],
    openapi: buildOpenApiSpec(origin),
  });
}
