import { NextResponse } from "next/server";

import {
  JSON_QUERY_PARAM,
  buildUrlWithQueryParam,
  encodeJsonQueryParam,
} from "@/components/json-viewer/utils/jsonUrlUtils";
import { buildGDriveSlug } from "@/lib/share/shareSlug";
import { uploadJsonToDrive } from "@/lib/share/driveShare";

type ShareMode = "auto" | "url" | "drive";

type ShareRequestBody =
  | {
      json?: unknown;
      mode?: ShareMode;
    }
  | unknown;

function extractJsonPayload(body: ShareRequestBody): unknown {
  if (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    "json" in body &&
    (body as { json?: unknown }).json !== undefined
  ) {
    return (body as { json?: unknown }).json;
  }

  return body;
}

function extractMode(body: ShareRequestBody): ShareMode {
  if (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    "mode" in body &&
    (body as { mode?: ShareMode }).mode
  ) {
    const mode = (body as { mode?: ShareMode }).mode;
    if (mode === "auto" || mode === "url" || mode === "drive") {
      return mode;
    }
  }

  return "auto";
}

export async function POST(request: Request) {
  let body: ShareRequestBody;

  try {
    body = (await request.json()) as ShareRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const payload = extractJsonPayload(body);
  if (payload === undefined) {
    return NextResponse.json(
      { error: "Missing JSON payload. Send JSON directly or in a { \"json\": ... } field." },
      { status: 400 },
    );
  }

  const mode = extractMode(body);
  const jsonText = JSON.stringify(payload);

  if (mode !== "drive") {
    const encoded = encodeJsonQueryParam(jsonText);
    if (encoded) {
      const requestUrl = new URL(request.url);
      return NextResponse.json({
        mode: "url",
        url: buildUrlWithQueryParam(`${requestUrl.origin}/`, JSON_QUERY_PARAM, encoded),
      });
    }

    if (mode === "url") {
      return NextResponse.json(
        { error: "JSON payload is too large to encode in URL. Try auto or drive mode." },
        { status: 413 },
      );
    }
  }

  const driveFileId = await uploadJsonToDrive(jsonText);
  if (!driveFileId) {
    return NextResponse.json(
      { error: "Google Drive fallback unavailable. Ensure server auth is configured." },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const slug = buildGDriveSlug(driveFileId);

  return NextResponse.json({
    mode: "drive",
    slug,
    url: `${requestUrl.origin}/s/${slug}`,
  });
}
