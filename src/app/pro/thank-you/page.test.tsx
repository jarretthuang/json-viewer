/** @jest-environment node */
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("../../../../pro/licensing/stripe", () => ({
  getStripe: jest.fn(),
  paidLicense: jest.fn(),
}));
import Page from "./page";
import { getStripe, paidLicense } from "../../../../pro/licensing/stripe";
const originalEnv = { ...process.env };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.LICENSE_KEY_SECRET = "fixture";
  (getStripe as jest.Mock).mockReturnValue({});
});
afterEach(() => {
  process.env = { ...originalEnv };
});
it("only exposes the key from the server-verified purchase adapter", async () => {
  (paidLicense as jest.Mock).mockResolvedValue({ key: "verified-key" });
  const result = await Page({
    searchParams: Promise.resolve({ session_id: "cs_test_purchase" }),
  });
  expect(result.props.completion).toEqual({
    key: "verified-key",
    emailSent: false,
  });
  expect(paidLicense).toHaveBeenCalledWith({}, "cs_test_purchase");
});
it.each([null, undefined])(
  "never exposes a key for unverified completion",
  async (completion) => {
    (paidLicense as jest.Mock).mockResolvedValue(completion);
    const result = await Page({
      searchParams: Promise.resolve({ session_id: "cs_test_purchase" }),
    });
    expect(result.props.completion).toBeUndefined();
  }
);
it("renders the unconnected state without Stripe configuration", async () => {
  (getStripe as jest.Mock).mockReturnValue(null);
  const result = await Page({
    searchParams: Promise.resolve({ session_id: "cs_test_purchase" }),
  });
  expect(result.props.completion).toBeUndefined();
  expect(paidLicense).not.toHaveBeenCalled();
});
it("rejects arbitrary query values without contacting Stripe", async () => {
  const result = await Page({
    searchParams: Promise.resolve({ session_id: ["cs_a", "cs_b"] }),
  });
  expect(result.props.completion).toBeUndefined();
  expect(paidLicense).not.toHaveBeenCalled();
});
