export const GDRIVE_SLUG_PREFIX = "gdrive:";

export type ShareReference =
  | {
      provider: "gdrive";
      fileId: string;
    }
  | {
      provider: "url";
    };

export function buildGoogleDriveSlug(fileId: string): string {
  return `${GDRIVE_SLUG_PREFIX}${fileId}`;
}

export function parseShareSlug(slug: string): ShareReference | null {
  if (!slug.startsWith(GDRIVE_SLUG_PREFIX)) {
    return { provider: "url" };
  }

  const fileId = slug.slice(GDRIVE_SLUG_PREFIX.length).trim();

  if (!fileId) {
    return null;
  }

  return { provider: "gdrive", fileId };
}
