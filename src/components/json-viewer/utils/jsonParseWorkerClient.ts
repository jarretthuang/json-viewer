import { parseJsonTextWithError } from "./jsonUtils";
import {
  JsonParseTaskResult,
  JsonParseWorkerRequest,
  JsonParseWorkerResponse,
  getJsonParseTaskResult,
} from "./jsonParseWorkerMessages";

type JsonParseWorkerFactory = () => Worker | undefined;

export type JsonParseTask = {
  requestId: number;
  promise: Promise<JsonParseTaskResult>;
  cancel: () => void;
};

let nextRequestId = 0;

export function createJsonParseWorker(): Worker | undefined {
  if (typeof Worker === "undefined") {
    return undefined;
  }

  return new Worker(new URL("../workers/jsonParse.worker.ts", import.meta.url));
}

export function createJsonParseTask(
  text: string,
  workerFactory: JsonParseWorkerFactory = createJsonParseWorker
): JsonParseTask {
  const requestId = nextRequestId + 1;
  nextRequestId = requestId;

  const worker = workerFactory();

  if (!worker) {
    return createFallbackJsonParseTask(requestId, text);
  }

  let settled = false;
  let resolveTask: (result: JsonParseTaskResult) => void = () => {};

  const promise = new Promise<JsonParseTaskResult>((resolve) => {
    resolveTask = resolve;

    worker.onmessage = (event: MessageEvent<JsonParseWorkerResponse>) => {
      if (event.data.requestId !== requestId || settled) {
        return;
      }

      settled = true;
      worker.terminate();
      resolve(getJsonParseTaskResult(event.data));
    };

    worker.onerror = () => {
      if (settled) {
        return;
      }

      settled = true;
      worker.terminate();
      resolve({
        status: "error",
        errorMessage: "Unable to parse JSON in the background worker.",
      });
    };
  });

  const request: JsonParseWorkerRequest = { requestId, text };
  worker.postMessage(request);

  return {
    requestId,
    promise,
    cancel: () => {
      if (settled) {
        return;
      }

      settled = true;
      worker.terminate();
      resolveTask({ status: "cancelled" });
    },
  };
}

function createFallbackJsonParseTask(
  requestId: number,
  text: string
): JsonParseTask {
  let cancelled = false;

  return {
    requestId,
    promise: Promise.resolve().then(() => {
      if (cancelled) {
        return { status: "cancelled" };
      }

      const { parsed, errorMessage } = parseJsonTextWithError(text);

      if (parsed !== undefined) {
        return {
          status: "success",
          parsed,
        };
      }

      return {
        status: "error",
        errorMessage,
      };
    }),
    cancel: () => {
      cancelled = true;
    },
  };
}
