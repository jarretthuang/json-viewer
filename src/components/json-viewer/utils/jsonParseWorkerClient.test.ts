import { createJsonParseTask } from "./jsonParseWorkerClient";
import {
  JsonParseWorkerRequest,
  JsonParseWorkerResponse,
} from "./jsonParseWorkerMessages";

class FakeWorker {
  onmessage: ((event: MessageEvent<JsonParseWorkerResponse>) => void) | null =
    null;
  onerror: (() => void) | null = null;
  postedMessage: JsonParseWorkerRequest | undefined;
  terminated = false;

  constructor(private response: JsonParseWorkerResponse) {}

  postMessage(message: JsonParseWorkerRequest) {
    this.postedMessage = message;
    queueMicrotask(() => {
      this.onmessage?.({
        data: {
          ...this.response,
          requestId: message.requestId,
        },
      } as MessageEvent<JsonParseWorkerResponse>);
    });
  }

  terminate() {
    this.terminated = true;
  }
}

describe("jsonParseWorkerClient", () => {
  test("falls back to async in-process parsing when Worker is unavailable", async () => {
    const task = createJsonParseTask('{"a":1}', () => undefined);

    await expect(task.promise).resolves.toEqual({
      status: "success",
      parsed: { a: 1 },
    });
  });

  test("returns parser errors from the fallback path", async () => {
    const task = createJsonParseTask('{"a":', () => undefined);
    const result = await task.promise;

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errorMessage).toContain("JSON");
    }
  });

  test("posts parse requests to a worker and terminates after success", async () => {
    const worker = new FakeWorker({
      requestId: 0,
      status: "success",
      parsed: { ok: true },
    });
    const task = createJsonParseTask(
      '{"ok":true}',
      () => worker as unknown as Worker
    );

    await expect(task.promise).resolves.toEqual({
      status: "success",
      parsed: { ok: true },
    });
    expect(worker.postedMessage).toMatchObject({ text: '{"ok":true}' });
    expect(worker.terminated).toBe(true);
  });

  test("cancel terminates the worker and resolves as cancelled", async () => {
    const worker = new FakeWorker({
      requestId: 0,
      status: "success",
      parsed: { ok: true },
    });
    const task = createJsonParseTask(
      '{"ok":true}',
      () => worker as unknown as Worker
    );

    task.cancel();

    await expect(task.promise).resolves.toEqual({ status: "cancelled" });
    expect(worker.terminated).toBe(true);
  });
});
