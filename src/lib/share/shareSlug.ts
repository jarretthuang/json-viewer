import { buildShareSignature, isValidShareSignature } from "./shareSignature";

export const GDRIVE_SLUG_PREFIX = "gdrive:";
const GDRIVE_SLUG_SIGNATURE_SEPARATOR = ":";

export type ShareReference =
  | {
      provider: "gdrive";
      fileId: string;
    }
  | {
      provider: "url";
    };

export function buildGoogleDriveSlug(fileId: string): string {
  const signature = buildShareSignature(fileId);
  return `${GDRIVE_SLUG_PREFIX}${fileId}${GDRIVE_SLUG_SIGNATURE_SEPARATOR}${signature}`;
}

export function parseShareSlug(slug: string): ShareReference | null {
  if (!slug.startsWith(GDRIVE_SLUG_PREFIX)) {
    return { provider: "url" };
  }

  const rawReference = slug.slice(GDRIVE_SLUG_PREFIX.length).trim();

  if (!rawReference) {
    return null;
  }

  const separatorIndex = rawReference.lastIndexOf(GDRIVE_SLUG_SIGNATURE_SEPARATOR);

  if (separatorIndex <= 0 || separatorIndex === rawReference.length - 1) {
    return null;
  }

  const fileId = rawReference.slice(0, separatorIndex).trim();
  const signature = rawReference.slice(separatorIndex + 1).trim();

  if (!fileId || !signature || !isValidShareSignature(fileId, signature)) {
    return null;
  }

  return { provider: "gdrive", fileId };
}
