import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const API = "https://api.lemonsqueezy.com/v1";
const WINDOW = 10 * 60_000;
const attempts = new Map<string, number[]>();
const cache = new Map<string, { until: number; activations: number }>();
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

function configured() {
  return Boolean(
    process.env.LEMON_SQUEEZY_API_KEY &&
      process.env.LEMON_SQUEEZY_STORE_ID &&
      process.env.LEMON_SQUEEZY_PRODUCT_ID
  );
}
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
function matches(attributes: Record<string, unknown>) {
  return (
    String(attributes.store_id) === process.env.LEMON_SQUEEZY_STORE_ID &&
    String(attributes.product_id) === process.env.LEMON_SQUEEZY_PRODUCT_ID
  );
}
async function provider(path: string) {
  const response = await fetch(`${API}/${path}`, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("provider_error");
  return response.json();
}
type Resource = { id: string; attributes: Record<string, unknown> };
async function* pages(
  resource: string,
  filters: Record<string, string>
): AsyncGenerator<Resource[]> {
  for (let page = 1; page <= 10; page++) {
    const params = new URLSearchParams({
      ...filters,
      "page[size]": "100",
      "page[number]": String(page),
    });
    const result = await provider(`${resource}?${params}`);
    if (!Array.isArray(result.data)) throw new Error("provider_error");
    yield result.data;
    if (result.meta?.page?.lastPage <= page || result.data.length < 100) return;
  }
  throw new Error("pagination_limit");
}
export async function licenseRequest(
  request: Request,
  operation: "validate" | "resend"
) {
  if (limited(request, operation))
    return reply({ valid: false, error: "rate_limited" }, 429);
  let input: string | null;
  try {
    input = await field(request, operation === "validate" ? "key" : "email");
  } catch {
    return reply({ valid: false, error: "bad_request" }, 400);
  }
  if (
    !input ||
    input.length > (operation === "validate" ? 256 : 254) ||
    (operation === "resend" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input))
  )
    return reply({ valid: false, error: "bad_request" }, 400);
  if (!configured())
    return reply({ valid: false, error: "not_configured" }, 503);
  try {
    if (operation === "validate") {
      const id = hash(
        `${process.env.LEMON_SQUEEZY_STORE_ID}:${process.env.LEMON_SQUEEZY_PRODUCT_ID}:${process.env.LEMON_SQUEEZY_TEST_MODE}:${input}`
      );
      const now = Date.now();
      cache.forEach((entry, key) => {
        if (entry.until <= now) cache.delete(key);
      });
      const cached = cache.get(id);
      if (cached)
        return reply({ valid: true, activations: cached.activations });
      const response = await fetch(`${API}/licenses/validate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ license_key: input }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok && response.status !== 400 && response.status !== 404)
        throw new Error("provider_error");
      const result = await response.json();
      if (typeof result.valid !== "boolean") throw new Error("provider_error");
      // Mode and refund status are supplied by the authenticated order API.
      const valid = response.ok && result.valid && matches(result.meta || {});
      if (!valid) return reply({ valid: false });
      if (!Number.isInteger(result.meta?.order_id))
        throw new Error("provider_error");
      const order = (await provider(`orders/${result.meta.order_id}`)).data
        ?.attributes;
      if (
        !order ||
        String(order.store_id) !== process.env.LEMON_SQUEEZY_STORE_ID ||
        order.status !== "paid" ||
        order.refunded !== false ||
        order.test_mode !== (process.env.LEMON_SQUEEZY_TEST_MODE === "true")
      )
        return reply({ valid: false });
      const activations = result.license_key?.activation_usage;
      if (!Number.isInteger(activations) || activations < 0)
        throw new Error("provider_error");
      if (cache.size >= 1000) cache.delete(cache.keys().next().value!);
      cache.set(id, { until: now + 300_000, activations });
      return reply({ valid: true, activations });
    }
    const email = input.toLowerCase();
    for await (const orders of pages("orders", {
      "filter[user_email]": email,
      "filter[store_id]": process.env.LEMON_SQUEEZY_STORE_ID!,
    })) {
      for (const order of orders) {
        const a = order.attributes;
        if (
          String(a.user_email).toLowerCase() !== email ||
          a.status !== "paid" ||
          a.refunded !== false ||
          String(a.store_id) !== process.env.LEMON_SQUEEZY_STORE_ID ||
          a.test_mode !== (process.env.LEMON_SQUEEZY_TEST_MODE === "true")
        )
          continue;
        for await (const licenses of pages("license-keys", {
          "filter[order_id]": order.id,
          "filter[product_id]": process.env.LEMON_SQUEEZY_PRODUCT_ID!,
          "filter[store_id]": process.env.LEMON_SQUEEZY_STORE_ID!,
        })) {
          const license = licenses.find(
            ({ attributes: l }) =>
              matches(l) &&
              String(l.user_email).toLowerCase() === email &&
              ["active", "inactive"].includes(String(l.status)) &&
              typeof l.key === "string" &&
              (!l.expires_at || Date.parse(String(l.expires_at)) > Date.now())
          );
          if (license)
            return reply({ key: license.attributes.key, delivery: "display" });
        }
      }
    }
    return reply({ error: "not_found" }, 404);
  } catch {
    console.warn(`[license] ${operation}: provider_unavailable`);
    return reply({ valid: false, error: "provider_unavailable" }, 502);
  }
}
