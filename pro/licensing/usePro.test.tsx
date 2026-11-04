import { act, renderHook, waitFor } from "@testing-library/react";
import { REVALIDATE_MS, STORAGE_KEY, usePro } from "./usePro";
const fetchMock = jest.fn();
const originalFetch = global.fetch;
const response = (body: object, ok = true) => ({ ok, json: async () => body });
beforeEach(() => {
  localStorage.clear();
  global.fetch = fetchMock;
  fetchMock.mockReset();
});
afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  jest.restoreAllMocks();
});
it("does not validate on load without a key", () => {
  const { result } = renderHook(usePro);
  expect(result.current.isPro).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();
});
it("validates on entry and reuses saved success across remounts", async () => {
  fetchMock.mockResolvedValue(response({ valid: true }));
  const first = renderHook(usePro);
  await act(async () => {
    expect(await first.result.current.validateKey(" key ")).toEqual({
      valid: true,
    });
  });
  expect(first.result.current.isPro).toBe(true);
  first.unmount();
  const second = renderHook(usePro);
  expect(second.result.current.isPro).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each([
  [{ valid: false }, true, "invalid_key"],
  [{ error: "not_configured" }, false, "not_configured"],
  [{ error: "rate_limited" }, false, "rate_limited"],
  [{ error: "provider_unavailable" }, false, "network_error"],
] as const)("distinguishes errors %j", async (body, ok, error) => {
  fetchMock.mockResolvedValue(response(body, ok));
  const { result } = renderHook(usePro);
  await act(async () => {
    expect(await result.current.validateKey("key")).toEqual({
      valid: false,
      error,
    });
  });
  expect(result.current.isPro).toBe(false);
});
it("reports network failure", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  const { result } = renderHook(usePro);
  await act(async () => {
    expect(await result.current.validateKey("key")).toEqual({
      valid: false,
      error: "network_error",
    });
  });
});
it("revalidates at 24h while mounted and closes gate after revocation", async () => {
  jest.useFakeTimers();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ key: "key", valid: true, checkedAt: Date.now() })
  );
  fetchMock.mockResolvedValue(response({ valid: false }));
  const { result } = renderHook(usePro);
  expect(result.current.isPro).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(REVALIDATE_MS);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(result.current.isPro).toBe(false);
});
it("revalidates an expired cache", async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      key: "key",
      valid: true,
      checkedAt: Date.now() - REVALIDATE_MS - 1,
    })
  );
  fetchMock.mockResolvedValue(response({ valid: true }));
  const { result } = renderHook(usePro);
  expect(result.current.isPro).toBe(false);
  await waitFor(() => expect(result.current.isPro).toBe(true));
});
it("clear invalidates an in-flight validation and synchronizes consumers", async () => {
  let finish!: (value: unknown) => void;
  fetchMock.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const first = renderHook(usePro);
  const second = renderHook(usePro);
  let task!: Promise<unknown>;
  act(() => {
    task = first.result.current.validateKey("key");
    second.result.current.clearKey();
  });
  await act(async () => {
    finish(response({ valid: true }));
    await task;
  });
  expect(first.result.current.isPro).toBe(false);
  expect(second.result.current.isPro).toBe(false);
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
it("handles unavailable storage", async () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  fetchMock.mockResolvedValue(response({ valid: true }));
  const { result } = renderHook(usePro);
  await act(async () => {
    expect(await result.current.validateKey("key")).toEqual({
      valid: false,
      error: "storage_unavailable",
    });
  });
});
