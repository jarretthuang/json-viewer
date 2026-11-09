import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { getStripe, recoverLicense } from "./stripe";
import { verifyLicense } from "./keys";
import { isLicenseKeyRevoked } from "./revocation";
const WINDOW = 10 * 60_000;
const attempts = new Map<string, number[]>();
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const reply = (body: object, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": "600" } : {}),
    },
  });

function limited(request: Request, operation: string) {
  const now = Date.now();
  attempts.forEach((times, key) => {
    if (times[times.length - 1] <= now - WINDOW) attempts.delete(key);
  });
  const ip =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for") || "unknown"
      : "shared";
  const id = hash(`${operation}:${ip}`);
  const recent = (attempts.get(id) || []).filter((t) => t > now - WINDOW);
  if (
    recent.length >= (operation === "validate" ? 20 : 5) ||
    (!attempts.has(id) && attempts.size >= 10_000)
  )
    return true;
  attempts.set(id, [...recent, now]);
  return false;
}
async function field(request: Request, name: string) {
  // Bound actual bytes, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return null;
  let text = "";
  let size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2048) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  const body = JSON.parse(text + decoder.decode());
  return body && typeof body[name] === "string"
    ? (body[name].trim() as string)
    : null;
}
export async function licenseRequest(
  request: Request,
  operation: "validate" | "resend"
) {
  if (limited(request, operation))
    return reply({ valid: false, error: "rate_limited" }, 429);
  if (operation === "resend") {
    try {
      const email = await field(request, "email");
      if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
        return reply({ error: "bad_request" }, 400);
      const stripe = getStripe();
      if (
        !stripe ||
        !process.env.LICENSE_KEY_SECRET ||
        !process.env.RESEND_API_KEY
      )
        throw new Error("not_configured");
      await recoverLicense(stripe, email);
      return reply({
        message: "If that email purchased PRO, the key has been sent.",
      });
    } catch {
      console.warn("[license] recovery_unavailable");
      return reply(
        { message: "Could not send right now. Please try again later." },
        503
      );
    }
  }
  let input: string | null;
  try {
    input = await field(request, "key");
  } catch {
    return reply({ valid: false, error: "bad_request" }, 400);
  }
  if (!input || input.length > 256)
    return reply({ valid: false, error: "bad_request" }, 400);
  if (!process.env.LICENSE_KEY_SECRET)
    return reply({ valid: false, error: "not_configured" }, 503);
  const valid = verifyLicense(input) && !(await isLicenseKeyRevoked(input));
  return reply(
    valid ? { valid: true, activations: 1 } : { valid: false, activations: 0 }
  );
}
