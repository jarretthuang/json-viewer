import {
  buildUrlWithQueryParam,
  buildUrlWithoutQueryParam,
  decodeJsonQueryParam,
  encodeJsonQueryParam,
} from "./jsonUrlUtils";

describe("jsonUrlUtils", () => {
  test("encodeJsonQueryParam encodes text and decodeJsonQueryParam restores it", () => {
    const source = '{"hello":"world"}';
    const encoded = encodeJsonQueryParam(source);

    expect(encoded).toBeDefined();
    expect(decodeJsonQueryParam(encoded ?? null)).toBe(source);
  });

  test("encodeJsonQueryParam returns undefined for empty text", () => {
    expect(encodeJsonQueryParam("")).toBeUndefined();
  });

  test("encodeJsonQueryParam returns undefined when encoded text exceeds max length", () => {
    expect(encodeJsonQueryParam("a", 0)).toBeUndefined();
  });

  test("buildUrlWithQueryParam inserts query param", () => {
    const url = buildUrlWithQueryParam("https://example.com/path?x=1", "json", "abc");
    expect(url).toBe("https://example.com/path?x=1&json=abc");
  });

  test("buildUrlWithoutQueryParam removes query param", () => {
    const url = buildUrlWithoutQueryParam("https://example.com/path?x=1&json=abc", "json");
    expect(url).toBe("https://example.com/path?x=1");
  });
});
