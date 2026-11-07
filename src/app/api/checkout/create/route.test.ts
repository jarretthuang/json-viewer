/** @jest-environment node */
import { POST } from "./route";
import { getStripe } from "../../../../../pro/licensing/stripe";

jest.mock("../../../../../pro/licensing/stripe", () => ({
  getStripe: jest.fn(),
}));
const originalEnv = { ...process.env };
const create = jest.fn();
beforeEach(() => {
  process.env.LICENSE_KEY_SECRET = "test-secret";
  jest.mocked(getStripe).mockReturnValue({
    checkout: { sessions: { create } },
  } as unknown as NonNullable<ReturnType<typeof getStripe>>);
  create.mockResolvedValue({ url: "https://checkout.stripe.com/test" });
});
afterEach(() => {
  process.env = { ...originalEnv };
  jest.clearAllMocks();
});

test("blocks checkout while Pro is off even with configuration", async () => {
  delete process.env.NEXT_PUBLIC_PRO_ENABLED;
  const response = await POST(
    new Request("https://example.com/api/checkout/create")
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "not_configured" });
  expect(create).not.toHaveBeenCalled();
});

test("preserves checkout while Pro is on and configured", async () => {
  process.env.NEXT_PUBLIC_PRO_ENABLED = "true";
  const response = await POST(
    new Request("https://example.com/api/checkout/create")
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    url: "https://checkout.stripe.com/test",
  });
  expect(create).toHaveBeenCalledTimes(1);
});
