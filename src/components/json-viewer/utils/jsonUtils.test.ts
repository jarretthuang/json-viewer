import {
  getJsonParseErrorMessage,
  parseJsonText,
  parseJsonTextWithError,
  stringifyJson,
  removeJsonItemAtPath,
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

  test("removeJsonItemAtPath removes a value or container by path", () => {
    const input = {
      list: ["a", "b", "c"],
      nested: { values: [{ id: 1 }, { id: 2 }], keep: true },
    };

    expect(removeJsonItemAtPath(input, ["list", 1])).toEqual({
      list: ["a", "c"],
      nested: { values: [{ id: 1 }, { id: 2 }], keep: true },
    });

    expect(removeJsonItemAtPath(input, ["nested", "values", 0])).toEqual({
      list: ["a", "b", "c"],
      nested: { values: [{ id: 2 }], keep: true },
    });

    expect(removeJsonItemAtPath(input, ["nested", "keep"])).toEqual({
      list: ["a", "b", "c"],
      nested: { values: [{ id: 1 }, { id: 2 }] },
    });

    expect(removeJsonItemAtPath(input, ["nested", "values"])).toEqual({
      list: ["a", "b", "c"],
      nested: { keep: true },
    });

    // Ensure original input is unchanged.
    expect(input.list).toEqual(["a", "b", "c"]);
  });

  test("removeJsonItemAtPath no-ops for invalid paths", () => {
    const input = { list: ["a", "b"] };

    expect(removeJsonItemAtPath(input, ["list", 3])).toEqual(input);
    expect(removeJsonItemAtPath(input, ["list", "1"])).toEqual(input);
    expect(removeJsonItemAtPath(input, ["missing", 0])).toEqual(input);
  });
});
