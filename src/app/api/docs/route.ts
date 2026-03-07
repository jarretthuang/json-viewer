import { NextResponse } from "next/server";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: "json-viewer API",
    endpoints: [
      {
        method: "POST",
        path: "/api/json",
        description:
          "Accepts any JSON payload and returns a shareable json-viewer URL.",
        requestBody: {
          examples: [
            { hello: "world" },
            { json: { hello: "world" } },
          ],
        },
        response: {
          example: {
            url: `${origin}/?json=<compressed-json-query-param>`,
          },
        },
      },
    ],
  });
}
