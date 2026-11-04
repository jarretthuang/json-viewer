/** @jest-environment node */
jest.mock("server-only", () => ({}), { virtual: true });
const mockCreate = jest.fn();
const mockRetrieve = jest.fn();
const mockConstruct = jest.fn();
const mockSend = jest.fn();
jest.mock("stripe", () =>
  jest
    .fn()
    .mockImplementation(() => ({
      checkout: { sessions: { create: mockCreate, retrieve: mockRetrieve } },
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
  process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fixture";
  process.env.LICENSE_KEY_SECRET = "license-test-fixture";
  process.env.RESEND_API_KEY = "re_fixture";
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
