import {
  JsonParseWorkerRequest,
  createJsonParseErrorResponse,
  createJsonParseSuccessResponse,
} from "../utils/jsonParseWorkerMessages";

self.onmessage = (event: MessageEvent<JsonParseWorkerRequest>) => {
  const { requestId, text } = event.data;

  try {
    self.postMessage(createJsonParseSuccessResponse(requestId, JSON.parse(text)));
  } catch (error) {
    self.postMessage(createJsonParseErrorResponse(requestId, error));
  }
};

export {};
