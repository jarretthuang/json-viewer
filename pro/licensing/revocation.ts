import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

const REVOKED_KEYS = "pro:revoked-keys:v1";
const configured = () =>
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export function revokedKeyHash(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function revokeLicenseKey(key: string): Promise<void> {
  if (!configured()) {
    console.info("[stripe] revocation_not_configured");
    return;
  }
  await Redis.fromEnv().sadd(REVOKED_KEYS, revokedKeyHash(key));
}

export async function isLicenseKeyRevoked(key: string): Promise<boolean> {
  if (!configured()) return false;
  return (await Redis.fromEnv().sismember(REVOKED_KEYS, revokedKeyHash(key))) === 1;
}
