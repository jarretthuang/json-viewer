export const GDRIVE_SLUG_PREFIX = "gdrive:";

export function buildGDriveSlug(fileId: string): string {
  return `${GDRIVE_SLUG_PREFIX}${fileId}`;
}

export function parseShareSlug(slug: string):
  | { provider: "gdrive"; fileId: string }
  | { provider: "unknown" } {
  if (!slug.startsWith(GDRIVE_SLUG_PREFIX)) {
    return { provider: "unknown" };
  }

  const fileId = slug.slice(GDRIVE_SLUG_PREFIX.length).trim();
  if (!fileId) {
    return { provider: "unknown" };
  }

  return { provider: "gdrive", fileId };
}
