import { hasShareSignatureSecret } from "./shareSignature";

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";

function getAccessToken(): string | null {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  return token ? token.trim() : null;
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(getAccessToken()) && hasShareSignatureSecret();
}

export async function uploadJsonToDrive(content: string): Promise<string> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Google Drive is not configured.");
  }

  const boundary = `json-viewer-${Date.now()}`;
  const metadata = {
    name: `json-viewer-${Date.now()}.json`,
    mimeType: "application/json",
  };

  const multipartBody = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    content,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const response = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to Google Drive (${response.status}).`);
  }

  const data = (await response.json()) as { id?: string };

  if (!data.id) {
    throw new Error("Google Drive upload succeeded but no file ID was returned.");
  }

  return data.id;
}

export async function readJsonFromDriveById(fileId: string): Promise<string> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Google Drive is not configured.");
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read Google Drive file (${response.status}).`);
  }

  return response.text();
}
