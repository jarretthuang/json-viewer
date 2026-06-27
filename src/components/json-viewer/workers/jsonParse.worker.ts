import {
  JsonParseWorkerRequest,
  createJsonParseErrorResponse,
  createJsonParseSuccessResponse,
} from "../utils/jsonParseWorkerMessages";
import { stripJsonLineComments } from "../utils/jsonUtils";

self.onmessage = (event: MessageEvent<JsonParseWorkerRequest>) => {
  const { requestId, text } = event.data;

  try {
    self.postMessage(
      createJsonParseSuccessResponse(
        requestId,
        JSON.parse(stripJsonLineComments(text))
      )
    );
  } catch (error) {
    self.postMessage(createJsonParseErrorResponse(requestId, error));
  }
};

export {};
