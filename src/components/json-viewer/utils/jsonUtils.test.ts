import {
  getJsonParseErrorMessage,
  parseJsonText,
  parseJsonTextWithError,
  stringifyJson,
} from "./jsonUtils";

describe("jsonUtils", () => {
  test("parseJsonText returns parsed object for valid JSON", () => {
    expect(parseJsonText('{"a":1}')).toEqual({ a: 1 });
  });

  test("parseJsonText returns undefined for invalid JSON", () => {
    expect(parseJsonText('{"a":')).toBeUndefined();
  });

  test("parseJsonTextWithError returns parsed value with empty error", () => {
    expect(parseJsonTextWithError("123")).toEqual({ parsed: 123, errorMessage: "" });
  });

  test("parseJsonTextWithError returns error message for invalid JSON", () => {
    const result = parseJsonTextWithError('{"a":');
    expect(result.parsed).toBeUndefined();
    expect(result.errorMessage).toContain("JSON");
  });

  test("stringifyJson formats output with 2-space indentation", () => {
    expect(stringifyJson({ a: 1, b: { c: 2 } })).toBe(`{
  "a": 1,
  "b": {
    "c": 2
  }
}`);
  });

  test("getJsonParseErrorMessage handles different error shapes", () => {
    expect(getJsonParseErrorMessage("oops")).toBe("OOPS");
    expect(getJsonParseErrorMessage(new Error("bad json"))).toBe("bad json");
    expect(getJsonParseErrorMessage({})).toBe("");
  });
});
