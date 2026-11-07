/** @jest-environment node */
jest.mock("server-only", () => ({}), { virtual: true });
const mockCustomers = jest.fn();
const mockSessions = jest.fn();
const mockCreate = jest.fn();
const mockRetrieve = jest.fn();
const mockConstruct = jest.fn();
const mockSend = jest.fn();
const mockSadd = jest.fn();
const mockSismember = jest.fn();
jest.mock("@vercel/kv", () => ({ kv: { sadd: (...args: unknown[]) => mockSadd(...args), sismember: (...args: unknown[]) => mockSismember(...args) } }));
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    customers: { list: mockCustomers },
    checkout: {
      sessions: {
        create: mockCreate,
        retrieve: mockRetrieve,
        list: mockSessions,
      },
    },
    webhooks: { constructEvent: mockConstruct },
  }))
);
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));
import { POST as checkout } from "../../src/app/api/checkout/create/route";
import { POST as webhook } from "../../src/app/api/stripe/webhook/route";
import { getStripe, paidLicense } from "./stripe";
import { STRIPE_PRICE_ID, STRIPE_PRODUCT_ID } from "@/lib/pro-config";
import { verifyLicense } from "./keys";
import { revokedKeyHash } from "./revocation";
const originalEnv = { ...process.env };
const paid = {
  id: "cs_test_order",
  payment_status: "paid",
  mode: "payment",
  customer_details: { email: "buyer@example.com" },
  line_items: {
    data: [
      {
        quantity: 1,
        price: { id: STRIPE_PRICE_ID, product: STRIPE_PRODUCT_ID },
      },
    ],
  },
};
const request = (signature: string | null = "valid-signature") =>
  new Request("https://jsonviewer.io/api/stripe/webhook", {
    method: "POST",
    body: "raw-event-body",
    headers: signature ? { "stripe-signature": signature } : {},
  });
beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  mockSadd.mockReset().mockResolvedValue(1);
  mockSismember.mockReset().mockResolvedValue(0);
  process.env.NEXT_PUBLIC_PRO_ENABLED = "true";
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fixture";
  process.env.LICENSE_KEY_SECRET = "license-test-fixture";
  process.env.RESEND_API_KEY = "re_fixture";
  mockCustomers.mockReturnValue(iterable([]));
  mockSessions.mockReturnValue(iterable([]));
  mockRetrieve.mockResolvedValue(paid);
  mockConstruct.mockReturnValue({
    type: "checkout.session.completed",
    data: { object: { id: paid.id } },
  });
  mockSend.mockResolvedValue({ data: { id: "email" }, error: null });
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...originalEnv };
  jest.restoreAllMocks();
});
it("creates a one-time Managed Payments session with the configured price", async () => {
  mockCreate.mockResolvedValue({ url: "https://checkout.stripe.com/test" });
  const result = await checkout(
    new Request("https://jsonviewer.io/api/checkout/create", { method: "POST" })
  );
  expect(await result.json()).toEqual({
    url: "https://checkout.stripe.com/test",
  });
  expect(mockCreate).toHaveBeenCalledWith({
    mode: "payment",
    managed_payments: { enabled: true },
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url:
      "https://jsonviewer.io/pro/thank-you?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://jsonviewer.io/pro",
  });
});
it("degrades gracefully without Stripe configuration", async () => {
  delete process.env.STRIPE_SECRET_KEY;
  const result = await checkout(request());
  expect(result.status).toBe(503);
  expect(await result.json()).toEqual({ error: "not_configured" });
  expect(mockCreate).not.toHaveBeenCalled();
});
it.each([null, "invalid-signature"])(
  "rejects missing or invalid signatures: %s",
  async (signature) => {
    mockConstruct.mockImplementation(() => {
      throw new Error("invalid");
    });
    expect((await webhook(request(signature))).status).toBe(400);
    expect(mockRetrieve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  }
);
it("verifies the raw body and idempotently fulfills duplicate events", async () => {
  // Model Resend's provider-side idempotency: multiple requests, one delivery effect.
  const deliveries = new Map<string, unknown>();
  mockSend.mockImplementation(async (message, options) => {
    if (!deliveries.has(options.idempotencyKey))
      deliveries.set(options.idempotencyKey, message);
    return { error: null };
  });
  expect((await webhook(request())).status).toBe(200);
  expect((await webhook(request())).status).toBe(200);
  expect(mockConstruct).toHaveBeenCalledWith(
    "raw-event-body",
    "valid-signature",
    "whsec_fixture"
  );
  expect(mockSend.mock.calls[0]).toEqual(mockSend.mock.calls[1]);
  expect(deliveries.size).toBe(1);
  const license = await paidLicense(getStripe()!, paid.id);
  expect(verifyLicense(license!.key)).toBe(true);
  expect(mockSend.mock.calls[0][0].text).toContain(license!.key);
  expect(mockSend.mock.calls[0][0].html).toContain(license!.key);
  expect(mockSend.mock.calls[0][0].subject).toBe("Your JSON Viewer PRO license key");
});
it.each([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
])("fulfills paid events: %s", async (type) => {
  mockConstruct.mockReturnValue({ type, data: { object: { id: paid.id } } });
  expect((await webhook(request())).status).toBe(200);
  expect(mockSend).toHaveBeenCalledTimes(1);
});
it.each([
  "checkout.session.async_payment_failed",
  "charge.refunded",
  "unhandled",
])("does not fulfill %s", async (type) => {
  mockConstruct.mockReturnValue({ type, data: { object: {} } });
  expect((await webhook(request())).status).toBe(200);
  expect(mockSend).not.toHaveBeenCalled();
});
it.each([
  { payment_status: "unpaid" },
  { mode: "subscription" },
  { customer_details: null },
  {
    line_items: {
      data: [
        { quantity: 1, price: { id: "other", product: STRIPE_PRODUCT_ID } },
      ],
    },
  },
])("does not issue a key for an ineligible session %j", async (patch) => {
  mockRetrieve.mockResolvedValue({ ...paid, ...patch });
  expect(await paidLicense(getStripe()!, paid.id)).toBeNull();
  expect((await webhook(request())).status).toBe(200);
  expect(mockSend).not.toHaveBeenCalled();
});
it("skips email when unset but retains server-verified key delivery", async () => {
  delete process.env.RESEND_API_KEY;
  expect((await webhook(request())).status).toBe(200);
  expect(mockSend).not.toHaveBeenCalled();
  expect(await paidLicense(getStripe()!, paid.id)).toMatchObject({
    key: expect.any(String),
  });
});
it("returns retryable failure on email errors without logging payment data", async () => {
  mockSend.mockResolvedValue({ error: { message: "private-data" } });
  expect((await webhook(request())).status).toBe(502);
  expect(console.warn).toHaveBeenCalledWith("[stripe] fulfillment_unavailable");
});

const recoveryRequest = (email = "buyer@example.com") =>
  new Request("https://jsonviewer.io/api/license/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
const iterable = (values: object[]) => ({
  async *[Symbol.asyncIterator]() {
    yield* values;
  },
});
it("recovers a paid PRO purchase while sales are disabled and uses a fresh delivery key", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  process.env.NEXT_PUBLIC_PRO_ENABLED = "false";
  mockCustomers.mockReturnValue(iterable([{ id: "cus_buyer" }]));
  mockSessions.mockReturnValue(iterable([{ id: paid.id }]));
  const response = await POST(recoveryRequest());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    message: "If that email purchased PRO, the key has been sent.",
  });
  expect(mockCustomers).toHaveBeenCalledWith({
    email: "buyer@example.com",
    limit: 100,
  });
  expect(mockSessions).toHaveBeenCalledWith({
    customer: "cus_buyer",
    status: "complete",
    limit: 100,
  });
  expect(mockSend.mock.calls[0][0].text).toContain(
    (await paidLicense(getStripe()!, paid.id))!.key
  );
  expect(mockSend.mock.calls[0][0].html).toContain(
    (await paidLicense(getStripe()!, paid.id))!.key
  );
  expect(mockSend.mock.calls[0][1].idempotencyKey).toMatch(/^pro-recovery\//);
});
it("returns the identical success for an email with no purchase", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  mockCustomers.mockReturnValue(iterable([]));
  const response = await POST(recoveryRequest());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    message: "If that email purchased PRO, the key has been sent.",
  });
  expect(mockSend).not.toHaveBeenCalled();
});
it("returns a generic retry on delivery failure without private logs", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  mockCustomers.mockReturnValue(iterable([{ id: "cus_buyer" }]));
  mockSessions.mockReturnValue(iterable([{ id: paid.id }]));
  mockSend.mockResolvedValue({ error: { message: "private" } });
  const response = await POST(recoveryRequest());
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    message: "Could not send right now. Please try again later.",
  });
  expect(console.warn).toHaveBeenCalledWith("[license] recovery_unavailable");
});
it("searches past ineligible sessions and duplicate customers", async () => {
  const { recoverLicense } = await import("./stripe");
  mockCustomers.mockReturnValue(
    iterable([{ id: "cus_old" }, { id: "cus_buyer" }])
  );
  mockSessions
    .mockReturnValueOnce(
      iterable([{ id: "cs_unpaid" }, { id: "cs_other_email" }])
    )
    .mockReturnValueOnce(iterable([{ id: paid.id }]));
  mockRetrieve.mockImplementation(async (id) =>
    id === "cs_unpaid"
      ? { ...paid, payment_status: "unpaid" }
      : id === "cs_other_email"
      ? { ...paid, customer_details: { email: "other@example.com" } }
      : paid
  );
  await recoverLicense(getStripe()!, "buyer@example.com");
  expect(mockSessions).toHaveBeenCalledTimes(2);
  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend.mock.calls[0][0].to).toBe("buyer@example.com");
});

it("recovers a customerless paid session using its email case-insensitively", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  const guest = { ...paid, customer: null };
  mockSessions.mockReturnValue(iterable([guest]));
  mockRetrieve.mockResolvedValue(guest);
  const response = await POST(recoveryRequest("BUYER@example.com"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    message: "If that email purchased PRO, the key has been sent.",
  });
  expect(mockSessions).toHaveBeenCalledWith({ status: "complete", limit: 100 });
  expect(mockRetrieve).toHaveBeenCalledWith(guest.id, {
    expand: ["line_items.data.price"],
  });
  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend.mock.calls[0][0].to).toBe("buyer@example.com");
  expect(mockSend.mock.calls[0][1].idempotencyKey).toMatch(/^pro-recovery\//);
});
it("finds a lowercase customer for a mixed-case recovery entry", async () => {
  const { recoverLicense } = await import("./stripe");
  mockCustomers.mockImplementation(({ email }) =>
    iterable(email === "buyer@example.com" ? [{ id: "cus_buyer" }] : [])
  );
  mockSessions.mockReturnValue(iterable([{ id: paid.id }]));
  await recoverLicense(getStripe()!, "Buyer@Example.com");
  expect(mockCustomers.mock.calls.map(([params]) => params.email)).toEqual([
    "Buyer@Example.com", "buyer@example.com",
  ]);
  expect(mockSend).toHaveBeenCalledTimes(1);
});
it("deduplicates customers returned for both email spellings", async () => {
  const { recoverLicense } = await import("./stripe");
  mockCustomers.mockReturnValue(iterable([{ id: "cus_buyer" }]));
  await recoverLicense(getStripe()!, "Buyer@Example.com");
  expect(mockSessions.mock.calls.filter(([params]) => params.customer)).toHaveLength(1);
  expect(mockSend).not.toHaveBeenCalled();
});
it("skips ineligible guest matches and stops after the first paid match", async () => {
  const { recoverLicense } = await import("./stripe");
  mockSessions.mockReturnValue(iterable([
    { ...paid, id: "cs_unpaid" }, paid, { ...paid, id: "cs_later" },
  ]));
  mockRetrieve.mockImplementation(async (id) =>
    id === "cs_unpaid" ? { ...paid, payment_status: "unpaid" } : paid
  );
  await recoverLicense(getStripe()!, "buyer@example.com");
  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockRetrieve).not.toHaveBeenCalledWith("cs_later", expect.anything());
});
it("stops the paginated guest scan after 1,000 sessions", async () => {
  const { recoverLicense } = await import("./stripe");
  let visited = 0;
  mockSessions.mockReturnValue({
    async *[Symbol.asyncIterator]() {
      for (let i = 0; i < 1_001; i++) {
        visited++;
        yield i === 1_000 ? paid : { id: `cs_other_${i}` };
      }
    },
  });
  await recoverLicense(getStripe()!, "buyer@example.com");
  expect(visited).toBe(1_000);
  expect(mockRetrieve).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

it("exhausts the five-attempt resend bucket", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  jest.spyOn(Date, "now").mockReturnValue(Date.now() + 11 * 60_000);
  mockCustomers.mockReturnValue(iterable([]));
  for (let i = 0; i < 5; i++)
    expect((await POST(recoveryRequest())).status).toBe(200);
  expect((await POST(recoveryRequest())).status).toBe(429);
});

function refund(amountRefunded = 100) {
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "test-token";
  mockConstruct.mockReturnValue({
    type: "charge.refunded",
    data: { object: { amount: 100, amount_refunded: amountRefunded, payment_intent: "pi_test" } },
  });
  mockSessions.mockResolvedValue({ data: [{ id: paid.id }] });
}
it("revokes only the hash on full refunds and safely handles redelivery", async () => {
  refund();
  for (let i = 0; i < 2; i++) expect((await webhook(request())).status).toBe(200);
  const license = await paidLicense(getStripe()!, paid.id);
  expect(mockSadd).toHaveBeenCalledWith("pro:revoked-keys:v1", revokedKeyHash(license!.key));
  expect(mockSadd).toHaveBeenCalledTimes(2);
  expect(mockSessions).toHaveBeenCalledWith({ payment_intent: "pi_test", limit: 1 });
  expect(mockSend).not.toHaveBeenCalled();
});
it("does not revoke partial refunds", async () => {
  refund(50);
  expect((await webhook(request())).status).toBe(200);
  expect(mockSadd).not.toHaveBeenCalled();
  expect(mockSessions).not.toHaveBeenCalled();
});
it("acknowledges refunds without KV and logs a fixed code", async () => {
  refund();
  delete process.env.KV_REST_API_TOKEN;
  expect((await webhook(request())).status).toBe(200);
  expect(mockSadd).not.toHaveBeenCalled();
  expect(console.info).toHaveBeenCalledWith("[stripe] revocation_not_configured");
});
it("retries KV failures without logging private data", async () => {
  refund();
  mockSadd.mockRejectedValue(new Error("private-data"));
  expect((await webhook(request())).status).toBe(502);
  expect(console.warn).toHaveBeenCalledWith("[stripe] fulfillment_unavailable");
});
it("acknowledges a refund without a checkout session", async () => {
  refund();
  mockSessions.mockResolvedValue({ data: [] });
  expect((await webhook(request())).status).toBe(200);
  expect(console.info).toHaveBeenCalledWith("[stripe] refund_session_not_found");
  expect(mockSadd).not.toHaveBeenCalled();
});
it("does not revoke an ineligible purchase", async () => {
  refund();
  mockRetrieve.mockResolvedValue({ ...paid, payment_status: "unpaid" });
  expect((await webhook(request())).status).toBe(200);
  expect(mockSadd).not.toHaveBeenCalled();
});
it("does not resend revoked keys and preserves the generic response", async () => {
  const { POST } = await import("../../src/app/api/license/resend/route");
  jest.spyOn(Date, "now").mockReturnValue(Date.now() + 22 * 60_000);
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "test-token";
  mockSismember.mockResolvedValue(1);
  mockCustomers.mockReturnValue(iterable([{ id: "cus_buyer" }]));
  mockSessions.mockReturnValue(iterable([{ id: paid.id }]));
  const response = await POST(recoveryRequest());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ message: "If that email purchased PRO, the key has been sent." });
  expect(mockSend).not.toHaveBeenCalled();
  expect(console.info).toHaveBeenCalledWith("[stripe] revoked_key_not_sent");
});

it("hashes revoked keys with SHA-256 hex", () => {
  expect(revokedKeyHash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});
