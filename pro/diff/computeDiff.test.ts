import {
  buildReviewTree,
  computeJsonDiff,
  MAX_REPORTED_CHANGES,
} from "./computeDiff";

test("compares parsed values, ignoring key order and numeric formatting", () => {
  expect(
    computeJsonDiff(
      JSON.parse('{"a":1,"b":[]}'),
      JSON.parse('{"b":[],"a":1.0}')
    ).summary.total
  ).toBe(0);
});
test("reports deepest changes, additions, removals and type replacements", () => {
  expect(
    computeJsonDiff(
      { nested: { x: 1 }, gone: false, type: null },
      { nested: { x: 2 }, fresh: {}, type: {} }
    ).changes
  ).toEqual([
    { path: ["nested", "x"], type: "changed", oldValue: 1, newValue: 2 },
    { path: ["gone"], type: "removed", oldValue: false },
    { path: ["type"], type: "changed", oldValue: null, newValue: {} },
    { path: ["fresh"], type: "added", newValue: {} },
  ]);
});
test("arrays are positional and root replacements are single changes", () => {
  expect(computeJsonDiff([1, 2], [0, 1, 2]).summary).toEqual({
    added: 1,
    removed: 0,
    changed: 2,
    total: 3,
  });
  expect(computeJsonDiff([], {}).changes[0].path).toEqual([]);
  expect(computeJsonDiff(null, false).summary.changed).toBe(1);
  expect(computeJsonDiff({}, {}).summary.total).toBe(0);
});
test("retains A and removed ghosts, inserting only B additions safely", () => {
  const a = JSON.parse('{"x":1,"gone":true}');
  const b = JSON.parse('{"x":2,"__proto__":{"polluted":true}}');
  const tree = buildReviewTree(a, computeJsonDiff(a, b).changes);
  expect(tree).toEqual(
    JSON.parse('{"x":1,"gone":true,"__proto__":{"polluted":true}}')
  );
  expect(a).toEqual({ x: 1, gone: true });
  expect(({} as Record<string, unknown>).polluted).toBeUndefined();
});
test("caps stored changes while retaining complete counts", () => {
  const result = computeJsonDiff(
    [],
    Array.from({ length: MAX_REPORTED_CHANGES + 5 }, () => 1)
  );
  expect(result.changes).toHaveLength(MAX_REPORTED_CHANGES);
  expect(result.summary.total).toBe(MAX_REPORTED_CHANGES + 5);
});
