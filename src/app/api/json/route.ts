import { NextResponse } from "next/server";

import {
  JSON_QUERY_PARAM,
  buildUrlWithQueryParam,
  encodeJsonQueryParam,
} from "@/components/json-viewer/utils/jsonUrlUtils";

type JsonRequestBody =
  | {
      json?: unknown;
    }
  | unknown;

function extractJsonPayload(body: JsonRequestBody): unknown {
  if (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    Object.keys(body).length === 1 &&
    "json" in body &&
    (body as { json?: unknown }).json !== undefined
  ) {
    return (body as { json?: unknown }).json;
  }

  return body;
}

export async function POST(request: Request) {
  let body: JsonRequestBody;

  try {
    body = (await request.json()) as JsonRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const payload = extractJsonPayload(body);

  if (payload === undefined) {
    return NextResponse.json(
      {
        error:
          "Missing JSON payload. Send JSON directly or in a { \"json\": ... } field.",
      },
      { status: 400 },
    );
  }

  const jsonText = JSON.stringify(payload);
  const encoded = encodeJsonQueryParam(jsonText);

  if (!encoded) {
    return NextResponse.json(
      {
        error:
          "JSON payload is too large to encode in URL. Try a smaller payload.",
      },
      { status: 413 },
    );
  }

  const requestUrl = new URL(request.url);
  const viewUrl = buildUrlWithQueryParam(
    `${requestUrl.origin}/`,
    JSON_QUERY_PARAM,
    encoded,
  );

  return NextResponse.json({ url: viewUrl });
}
