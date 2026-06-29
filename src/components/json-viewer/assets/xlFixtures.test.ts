import {
  XL_EXAMPLE_JSON_TEXT_LENGTH,
  createDeepObjectJson,
  createLargeArrayJson,
  createLargeArrayJsonAtLeast,
  createMixedLargeJson,
  createXLExampleJson,
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
    expect(text.length).toBeLessThan(10_100);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test("generates a valid content-rich XL example around 2 MB", () => {
    const text = createXLExampleJson();
    const parsed = JSON.parse(text);

    expect(text.length).toBeGreaterThanOrEqual(XL_EXAMPLE_JSON_TEXT_LENGTH);
    expect(text.length).toBeLessThan(XL_EXAMPLE_JSON_TEXT_LENGTH + 3_000);
    expect(parsed.name).toBe("JSON Viewer XL example");
    expect(parsed.summary.recordCount).toBe(parsed.records.length);
    expect(parsed.summary.categories).toContain("security");
    expect(parsed.records.length).toBeGreaterThan(900);
    expect(parsed.records[0]).toMatchObject({
      id: "record-00000",
      title: "Core Platform analytics snapshot 0",
      category: "analytics",
      status: "active",
      active: true,
      owner: {
        team: "Core Platform",
        contact: "owner-0@example.com",
      },
      location: {
        region: "ap-southeast-2",
        availabilityZones: [
          "ap-southeast-2a",
          "ap-southeast-2b",
          "ap-southeast-2c",
        ],
      },
      metrics: {
        score: 0,
        rank: 0,
        latencyMs: 80,
      },
      schedule: {
        nextReviewAt: null,
      },
      flags: {
        usesWorkerParsing: true,
        canShareByUrl: false,
      },
    });
    expect(parsed.records[0].tags).toEqual(
      expect.arrayContaining(["json-viewer", "xl-example", "analytics"])
    );
    expect(parsed.records[0].notes).toHaveLength(2);
    expect(parsed.records[0].relatedItems).toHaveLength(3);
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
