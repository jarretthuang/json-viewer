import { createHmac, timingSafeEqual } from "crypto";

const SIGNATURE_LENGTH = 24;

function getShareSignatureSecret(): string | null {
  const explicitSecret = process.env.SHARE_SLUG_SECRET?.trim();

  if (explicitSecret) {
    return explicitSecret;
  }

  const driveToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN?.trim();
  return driveToken || null;
}

function createSignature(fileId: string): string | null {
  const secret = getShareSignatureSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret)
    .update(fileId)
    .digest("base64url")
    .slice(0, SIGNATURE_LENGTH);
}

export function buildShareSignature(fileId: string): string {
  const signature = createSignature(fileId);

  if (!signature) {
    throw new Error("Missing share slug signature secret.");
  }

  return signature;
}

export function isValidShareSignature(fileId: string, signature: string): boolean {
  const expected = createSignature(fileId);

  if (!expected || !signature) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}
