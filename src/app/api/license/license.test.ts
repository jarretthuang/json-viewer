/** @jest-environment node */
jest.mock("server-only", () => ({}), { virtual: true });
import { POST as validate } from "./validate/route";
import { POST as resend } from "./resend/route";
import { mintLicense, verifyLicense } from "../../../../pro/licensing/keys";
const originalEnv = { ...process.env };
let clock = Date.now();
const request = (body: unknown) =>
  new Request("https://example.com/api/license", {
    method: "POST",
    body: JSON.stringify(body),
  });
beforeEach(() => {
  clock += 11 * 60_000;
  jest.spyOn(Date, "now").mockReturnValue(clock);
  process.env.LICENSE_KEY_SECRET = "test-only-secret";
});
afterEach(() => {
  process.env = { ...originalEnv };
  jest.restoreAllMocks();
});
it("mints deterministic, self-validating keys without customer information", async () => {
  delete process.env.NEXT_PUBLIC_PRO_ENABLED;
  const key = mintLicense("cs_test_order", "buyer@example.com");
  expect(key).toBe(mintLicense("cs_test_order", "buyer@example.com"));
  expect(key.length).toBeLessThan(256);
  expect(Buffer.from(key.split(".")[0], "base64url").toString()).not.toContain(
    "buyer"
  );
  expect(verifyLicense(key)).toBe(true);
  expect(verifyLicense(key + "x")).toBe(false);
  expect(verifyLicense("bad")).toBe(false);
  const result = await validate(request({ key }));
  expect(await result.json()).toEqual({ valid: true, activations: 1 });
  expect(result.headers.get("cache-control")).toBe("no-store");
  process.env.LICENSE_KEY_SECRET = "different-test-secret";
  expect(verifyLicense(key)).toBe(false);
});
it("fails gracefully without configuration", async () => {
  delete process.env.LICENSE_KEY_SECRET;
  expect(await (await validate(request({ key: "a" }))).json()).toMatchObject({
    error: "not_configured",
  });
});
it.each([{}, { key: 5 }, { key: " " }, { key: "a".repeat(3000) }])(
  "rejects malformed input %j",
  async (body) => {
    expect((await validate(request(body))).status).toBe(400);
  }
);
it("rejects invalid keys", async () => {
  expect(await (await validate(request({ key: "invalid" }))).json()).toEqual({
    valid: false,
    activations: 0,
  });
});
it("returns a generic retry when recovery is not configured", async () => {
  delete process.env.STRIPE_SECRET_KEY;
  jest.spyOn(console, "warn").mockImplementation(() => {});
  const result = await resend(request({ email: "buyer@example.com" }));
  expect(result.status).toBe(503);
  expect(await result.json()).toMatchObject({
    message: "Could not send right now. Please try again later.",
  });
});
it("limits validation requests", async () => {
  for (let i = 0; i < 20; i++) await validate(request({}));
  expect((await validate(request({}))).status).toBe(429);
});

it.each([{}, { email: 5 }, { email: "invalid" }, { email: "x".repeat(3000) }])(
  "rejects malformed recovery input %j",
  async (body) => {
    expect((await resend(request(body))).status).toBe(400);
  }
);
