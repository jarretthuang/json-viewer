import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

const REVOKED_KEYS = "pro:revoked-keys:v1";
const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const configured = () => Boolean(redisUrl() && redisToken());

export function revokedKeyHash(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function revokeLicenseKey(key: string): Promise<void> {
  if (!configured()) {
    console.info("[stripe] revocation_not_configured");
    return;
  }
  await new Redis({ url: redisUrl()!, token: redisToken()! }).sadd(REVOKED_KEYS, revokedKeyHash(key));
}

export async function isLicenseKeyRevoked(key: string): Promise<boolean> {
  if (!configured()) return false;
  return (await new Redis({ url: redisUrl()!, token: redisToken()! }).sismember(REVOKED_KEYS, revokedKeyHash(key))) === 1;
}
