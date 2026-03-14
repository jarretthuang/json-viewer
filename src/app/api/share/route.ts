import { NextResponse } from "next/server";

import {
  JSON_QUERY_PARAM,
  buildUrlWithQueryParam,
  encodeJsonQueryParam,
} from "@/components/json-viewer/utils/jsonUrlUtils";
import { buildGoogleDriveSlug } from "@/lib/share/shareSlug";
import {
  isGoogleDriveConfigured,
  uploadJsonToDrive,
} from "@/lib/share/googleDriveShare";

type ShareMode = "auto" | "url" | "drive";

type ShareRequestBody =
  | {
      json?: unknown;
      mode?: ShareMode;
    }
  | unknown;

function isShareMode(value: unknown): value is ShareMode {
  return value === "auto" || value === "url" || value === "drive";
}

function extractPayload(body: ShareRequestBody): { payload: unknown; mode: ShareMode } {
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    const parsed = body as { json?: unknown; mode?: unknown };
    const keys = Object.keys(parsed);
    const hasOnlyEnvelopeKeys =
      keys.includes("json") && keys.every((key) => key === "json" || key === "mode");

    if (hasOnlyEnvelopeKeys) {
      const mode = parsed.mode;

      if (mode === undefined || isShareMode(mode)) {
        return {
          payload: parsed.json,
          mode: mode ?? "auto",
        };
      }
    }
  }

  return { payload: body, mode: "auto" };
}

function buildUrlShareLink(origin: string, jsonText: string): string | null {
  const encoded = encodeJsonQueryParam(jsonText);

  if (!encoded) {
    return null;
  }

  return buildUrlWithQueryParam(`${origin}/`, JSON_QUERY_PARAM, encoded);
}

async function buildDriveShareLink(origin: string, jsonText: string): Promise<string> {
  const fileId = await uploadJsonToDrive(jsonText);
  const slug = buildGoogleDriveSlug(fileId);
  return `${origin}/s/${encodeURIComponent(slug)}`;
}

export async function POST(request: Request) {
  let body: ShareRequestBody;

  try {
    body = (await request.json()) as ShareRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { payload, mode } = extractPayload(body);

  if (payload === undefined) {
    return NextResponse.json({ error: "Missing JSON payload." }, { status: 400 });
  }

  if (!isShareMode(mode)) {
    return NextResponse.json(
      { error: 'Invalid mode. Expected one of: "auto", "url", "drive".' },
      { status: 400 },
    );
  }

  const requestUrl = new URL(request.url);
  const jsonText = JSON.stringify(payload);

  if (mode !== "drive") {
    const urlLink = buildUrlShareLink(requestUrl.origin, jsonText);

    if (urlLink) {
      return NextResponse.json({ mode: "url", url: urlLink });
    }

    if (mode === "url") {
      return NextResponse.json(
        { error: "JSON payload is too large to encode in URL." },
        { status: 413 },
      );
    }
  }

  if (!isGoogleDriveConfigured()) {
    return NextResponse.json(
      {
        error:
          "JSON payload is too large for URL sharing and Google Drive fallback is not configured.",
      },
      { status: 413 },
    );
  }

  try {
    const driveUrl = await buildDriveShareLink(requestUrl.origin, jsonText);
    return NextResponse.json({ mode: "drive", url: driveUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to create Google Drive share link." },
      { status: 502 },
    );
  }
}
