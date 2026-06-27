import {
  createJsonParseErrorResponse,
  createJsonParseSuccessResponse,
  getJsonParseTaskResult,
} from "./jsonParseWorkerMessages";

describe("jsonParseWorkerMessages", () => {
  test("creates success responses and task results", () => {
    const response = createJsonParseSuccessResponse(7, { a: 1 });

    expect(response).toEqual({
      requestId: 7,
      status: "success",
      parsed: { a: 1 },
    });
    expect(getJsonParseTaskResult(response)).toEqual({
      status: "success",
      parsed: { a: 1 },
    });
  });

  test("creates error responses and task results", () => {
    const response = createJsonParseErrorResponse(8, new Error("bad json"));

    expect(response).toEqual({
      requestId: 8,
      status: "error",
      errorMessage: "bad json",
    });
    expect(getJsonParseTaskResult(response)).toEqual({
      status: "error",
      errorMessage: "bad json",
    });
  });
});
