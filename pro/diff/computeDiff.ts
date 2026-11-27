// Review prototype only; not wired into the production viewer.
export type DiffChange = {
  path: (string | number)[];
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
};
export type DiffResult = {
  changes: DiffChange[];
  summary: { added: number; removed: number; changed: number; total: number };
};
export const MAX_REPORTED_CHANGES = 1000;
export function computeJsonDiff(a: unknown, b: unknown): DiffResult {
  const result: DiffResult = {
    changes: [],
    summary: { added: 0, removed: 0, changed: 0, total: 0 },
  };
  function record(change: DiffChange) {
    result.summary[change.type]++;
    result.summary.total++;
    if (result.changes.length < MAX_REPORTED_CHANGES)
      result.changes.push(change);
  }
  function visit(left: unknown, right: unknown, path: DiffChange["path"]) {
    if (left === right) return;
    if (
      left !== null &&
      right !== null &&
      typeof left === "object" &&
      typeof right === "object" &&
      Array.isArray(left) === Array.isArray(right)
    ) {
      const l = left as Record<string, unknown>,
        r = right as Record<string, unknown>;
      const keys = Array.from(new Set([...Object.keys(l), ...Object.keys(r)]));
      for (const key of keys) {
        const next = [...path, Array.isArray(left) ? Number(key) : key];
        if (!Object.hasOwn(l, key))
          record({ path: next, type: "added", newValue: r[key] });
        else if (!Object.hasOwn(r, key))
          record({ path: next, type: "removed", oldValue: l[key] });
        else visit(l[key], r[key], next);
      }
    } else record({ path, type: "changed", oldValue: left, newValue: right });
  }
  visit(a, b, []);
  return result;
}

// Preserve A's values and removed entries; insert only additions from B.
export function buildReviewTree(a: unknown, changes: DiffChange[]): unknown {
  const tree = JSON.parse(JSON.stringify(a));
  for (const change of changes) {
    if (change.type !== "added") continue;
    let parent = tree;
    for (const key of change.path.slice(0, -1)) parent = parent[key];
    Object.defineProperty(parent, change.path[change.path.length - 1], {
      value: change.newValue,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return tree;
}
