/** @jest-environment node */
jest.mock("server-only", () => ({}), { virtual: true });
import { POST as validate } from "./validate/route";
import { POST as resend } from "./resend/route";
const originalEnv = { ...process.env };
const originalFetch = global.fetch;
const fetchMock = jest.fn();
const request = (body: unknown) =>
  new Request("https://example.com/api/license", {
    method: "POST",
    body: JSON.stringify(body),
  });
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const order = {
  store_id: 1,
  status: "paid",
  refunded: false,
  test_mode: false,
  user_email: "buyer@example.com",
};
const valid = {
  valid: true,
  meta: { store_id: 1, product_id: 2, order_id: 3 },
  license_key: { activation_usage: 2 },
};
let clock = Date.now();
beforeEach(() => {
  clock += 11 * 60_000;
  jest.spyOn(Date, "now").mockReturnValue(clock);
  process.env.LEMON_SQUEEZY_API_KEY = "test-only";
  process.env.LEMON_SQUEEZY_STORE_ID = "1";
  process.env.LEMON_SQUEEZY_PRODUCT_ID = "2";
  delete process.env.LEMON_SQUEEZY_TEST_MODE;
  delete process.env.VERCEL;
  global.fetch = fetchMock;
  fetchMock.mockReset();
  jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});
it.each([validate, resend])(
  "fails gracefully without configuration",
  async (handler) => {
    delete process.env.LEMON_SQUEEZY_API_KEY;
    const result = await handler(
      request({ key: "a", email: "buyer@example.com" })
    );
    expect(result.status).toBe(503);
    expect(await result.json()).toMatchObject({ error: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  }
);
it.each([{}, { key: 5 }, { key: " " }, { key: "a".repeat(300) }])(
  "rejects malformed validation input %j",
  async (body) => {
    expect((await validate(request(body))).status).toBe(400);
  }
);
it("rejects malformed JSON and oversized requests", async () => {
  expect(
    (
      await validate(
        new Request("https://example.com", { method: "POST", body: "{" })
      )
    ).status
  ).toBe(400);
  expect((await validate(request({ key: "a".repeat(3000) }))).status).toBe(400);
});
it("validates, caches positive results, and expires the cache", async () => {
  fetchMock
    .mockResolvedValueOnce(response(valid))
    .mockResolvedValueOnce(response({ data: { attributes: order } }));
  const first = await validate(request({ key: "a" }));
  expect(await first.json()).toEqual({ valid: true, activations: 2 });
  expect(first.headers.get("cache-control")).toBe("no-store");
  expect(fetchMock.mock.calls[0][1].body.toString()).toBe("license_key=a");
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  await validate(request({ key: "a" }));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  jest.spyOn(Date, "now").mockReturnValue(clock + 300_001);
  fetchMock.mockResolvedValueOnce(response({ valid: false }));
  expect(await (await validate(request({ key: "a" }))).json()).toEqual({
    valid: false,
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
it("does not cache invalid keys", async () => {
  fetchMock.mockImplementation(async () => response({ valid: false }, 400));
  await validate(request({ key: "bad" }));
  await validate(request({ key: "bad" }));
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it("rejects other products", async () => {
  fetchMock.mockResolvedValue(
    response({ ...valid, meta: { ...valid.meta, product_id: 99 } })
  );
  expect(await (await validate(request({ key: "other" }))).json()).toEqual({
    valid: false,
  });
});
it.each([{ refunded: true }, { test_mode: true }, { status: "pending" }])(
  "rejects ineligible orders %j",
  async (patch) => {
    fetchMock
      .mockResolvedValueOnce(response(valid))
      .mockResolvedValueOnce(
        response({ data: { attributes: { ...order, ...patch } } })
      );
    expect(
      await (await validate(request({ key: "ineligible" }))).json()
    ).toEqual({ valid: false });
  }
);
it("returns a distinct upstream error without logging sensitive input", async () => {
  fetchMock.mockRejectedValue(new Error("sensitive upstream payload"));
  const result = await validate(request({ key: "private-key" }));
  expect(result.status).toBe(502);
  expect(console.warn).toHaveBeenCalledWith(
    "[license] validate: provider_unavailable"
  );
});
it("limits validation requests including cached or malformed requests", async () => {
  for (let i = 0; i < 20; i++) await validate(request({}));
  const result = await validate(request({}));
  expect(result.status).toBe(429);
  expect(result.headers.get("retry-after")).toBe("600");
});
it("finds a key through email-filtered orders and product-filtered licenses", async () => {
  fetchMock
    .mockResolvedValueOnce(response({ data: [{ id: "3", attributes: order }] }))
    .mockResolvedValueOnce(
      response({
        data: [
          {
            id: "4",
            attributes: {
              ...order,
              product_id: 2,
              status: "active",
              key: "found-key",
            },
          },
        ],
      })
    );
  const result = await resend(request({ email: "Buyer@example.com" }));
  expect(await result.json()).toEqual({
    key: "found-key",
    delivery: "display",
  });
  expect(
    new URL(fetchMock.mock.calls[0][0]).searchParams.get("filter[user_email]")
  ).toBe("buyer@example.com");
  expect(
    new URL(fetchMock.mock.calls[1][0]).searchParams.get("filter[product_id]")
  ).toBe("2");
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
    "Bearer test-only"
  );
});
it("does not return keys for refunded orders", async () => {
  fetchMock.mockResolvedValueOnce(
    response({ data: [{ id: "3", attributes: { ...order, refunded: true } }] })
  );
  expect((await resend(request({ email: "buyer@example.com" }))).status).toBe(
    404
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it("rejects invalid email and limits recovery attempts", async () => {
  for (let i = 0; i < 5; i++)
    expect((await resend(request({ email: "bad" }))).status).toBe(400);
  expect((await resend(request({ email: "bad" }))).status).toBe(429);
});
it("maps recovery provider failure without leaking its body", async () => {
  fetchMock.mockResolvedValue(response({ secret: "private" }, 401));
  const result = await resend(request({ email: "buyer@example.com" }));
  expect(result.status).toBe(502);
  expect(await result.json()).toEqual({
    valid: false,
    error: "provider_unavailable",
  });
});
