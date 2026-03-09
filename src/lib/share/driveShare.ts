const DRIVE_UPLOAD_URL =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";

function getGoogleDriveAccessToken(): string | undefined {
  return process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
}

export async function uploadJsonToDrive(jsonText: string): Promise<string | undefined> {
  const accessToken = getGoogleDriveAccessToken();
  if (!accessToken) {
    return undefined;
  }

  const metadata = {
    name: `json-viewer-${Date.now()}.json`,
    mimeType: "application/json",
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", new Blob([jsonText], { type: "application/json" }));

  const response = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as { id?: string };
  return data.id;
}

export async function readJsonFromDrive(fileId: string): Promise<string | undefined> {
  const accessToken = getGoogleDriveAccessToken();
  if (!accessToken) {
    return undefined;
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return undefined;
  }

  return response.text();
}
