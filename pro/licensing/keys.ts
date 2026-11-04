import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
function sign(value: string) {
  const secret = process.env.LICENSE_KEY_SECRET;
  if (!secret) throw new Error("not_configured");
  return createHmac("sha256", secret).update(value).digest("base64url");
}
// No email or payment identifiers in the portable payload. No timestamps: retries mint the same key.
export function mintLicense(sessionId: string, email: string) {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, pro: sign(`${sessionId}|${email}`) })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function verifyLicense(key: string) {
  if (!process.env.LICENSE_KEY_SECRET) return false;
  const parts = key.split(".");
  if (parts.length !== 2 || !parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p)))
    return false;
  const [payload, signature] = parts;
  const expected = Buffer.from(sign(payload));
  const supplied = Buffer.from(signature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      data.v === 1 &&
      typeof data.pro === "string" &&
      /^[A-Za-z0-9_-]{43}$/.test(data.pro)
    );
  } catch {
    return false;
  }
}
