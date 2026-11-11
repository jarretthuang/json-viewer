import { computeJsonDiff, MAX_REPORTED_CHANGES } from "./computeDiff";

describe("prototype structural diff", () => {
  it("ignores key order, formatting and parsed number spelling", () => {
    expect(
      computeJsonDiff(JSON.parse('{"x":1.0,"y":[]}'), { y: [], x: 1 }).summary
        .total
    ).toBe(0);
  });
  it("reports deepest paths and preserves values", () => {
    expect(
      computeJsonDiff(
        { nested: { x: 1 }, removed: false },
        { nested: { x: 2 }, added: null }
      ).changes
    ).toEqual([
      { path: ["nested", "x"], type: "changed", oldValue: 1, newValue: 2 },
      { path: ["removed"], type: "removed", oldValue: false },
      { path: ["added"], type: "added", newValue: null },
    ]);
  });
  it.each([
    [null, {}],
    [[], {}],
    ["1", 1],
    [{}, []],
  ])("reports type changes at root: %p → %p", (a, b) => {
    expect(computeJsonDiff(a, b).changes).toEqual([
      { path: [], type: "changed", oldValue: a, newValue: b },
    ]);
  });
  it("compares arrays positionally, including shifted and removed entries", () => {
    expect(computeJsonDiff(["a", "b"], ["x", "a", "b"]).summary).toEqual({
      added: 1,
      removed: 0,
      changed: 2,
      total: 3,
    });
    expect(computeJsonDiff([1, 2], [1]).changes).toEqual([
      { path: [1], type: "removed", oldValue: 2 },
    ]);
  });
  it("handles empty containers and unusual object keys", () => {
    expect(computeJsonDiff({}, {}).summary.total).toBe(0);
    expect(computeJsonDiff([], []).summary.total).toBe(0);
    expect(
      computeJsonDiff({}, JSON.parse('{"__proto__":1,"a.b":2}')).summary.added
    ).toBe(2);
  });
  it("caps the rendered changes while counting all changes", () => {
    const result = computeJsonDiff(Array(700).fill(0), Array(700).fill(1));
    expect(result.changes).toHaveLength(MAX_REPORTED_CHANGES);
    expect(result.summary.total).toBe(700);
  });
  it("rejects excessively deep documents", () => {
    let a: unknown = 1;
    let b: unknown = 2;
    for (let i = 0; i < 52; i++) {
      a = { child: a };
      b = { child: b };
    }
    expect(() => computeJsonDiff(a, b)).toThrow("too large or deeply nested");
  });
});
