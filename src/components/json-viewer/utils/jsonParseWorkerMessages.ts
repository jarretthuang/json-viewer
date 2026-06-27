import { getJsonParseErrorMessage } from "./jsonUtils";

export type JsonParseWorkerRequest = {
  requestId: number;
  text: string;
};

export type JsonParseWorkerResponse =
  | {
      requestId: number;
      status: "success";
      parsed: unknown;
    }
  | {
      requestId: number;
      status: "error";
      errorMessage: string;
    };

export type JsonParseTaskResult =
  | {
      status: "success";
      parsed: unknown;
    }
  | {
      status: "error";
      errorMessage: string;
    }
  | {
      status: "cancelled";
    };

export function createJsonParseSuccessResponse(
  requestId: number,
  parsed: unknown
): JsonParseWorkerResponse {
  return {
    requestId,
    status: "success",
    parsed,
  };
}

export function createJsonParseErrorResponse(
  requestId: number,
  error: unknown
): JsonParseWorkerResponse {
  return {
    requestId,
    status: "error",
    errorMessage: getJsonParseErrorMessage(error),
  };
}

export function getJsonParseTaskResult(
  response: JsonParseWorkerResponse
): JsonParseTaskResult {
  if (response.status === "success") {
    return {
      status: "success",
      parsed: response.parsed,
    };
  }

  return {
    status: "error",
    errorMessage: response.errorMessage,
  };
}
