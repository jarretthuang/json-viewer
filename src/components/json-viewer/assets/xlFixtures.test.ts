import {
  createDeepObjectJson,
  createLargeArrayJson,
  createLargeArrayJsonAtLeast,
  createMixedLargeJson,
  createWideObjectJson,
} from "./xlFixtures";

describe("xlFixtures", () => {
  test("generates valid wide object JSON", () => {
    const parsed = JSON.parse(createWideObjectJson(100));

    expect(parsed.key_0).toBe(0);
    expect(parsed.key_99).toBe(99);
    expect(Object.keys(parsed)).toHaveLength(100);
  });

  test("generates valid large array JSON", () => {
    const parsed = JSON.parse(createLargeArrayJson(25));

    expect(parsed).toHaveLength(25);
    expect(parsed[1]).toEqual({ id: 1, active: false, label: "Item 1" });
  });

  test("generates large array JSON above a requested source length", () => {
    const text = createLargeArrayJsonAtLeast(10_000);
    const parsed = JSON.parse(text);

    expect(text.length).toBeGreaterThanOrEqual(10_000);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test("generates valid deep object JSON", () => {
    const parsed = JSON.parse(createDeepObjectJson(3));

    expect(parsed).toEqual({
      level_2: {
        level_1: {
          level_0: 0,
        },
      },
    });
  });

  test("generates valid mixed large JSON", () => {
    const parsed = JSON.parse(createMixedLargeJson(5));

    expect(parsed.sections).toHaveLength(5);
    expect(parsed.sections[0].values).toHaveLength(20);
  });
});
