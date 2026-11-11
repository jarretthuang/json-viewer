// Review prototype: pure structural comparison, not wired into the product.
export type DiffChange = {
  path: (string | number)[];
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
};
export type DiffResult = {
  changes: DiffChange[];
  summary: Record<DiffChange["type"] | "total", number>;
};
export const MAX_REPORTED_CHANGES = 500;

export function computeJsonDiff(a: unknown, b: unknown): DiffResult {
  const result: DiffResult = {
    changes: [],
    summary: { added: 0, removed: 0, changed: 0, total: 0 },
  };
  let visited = 0;
  function report(change: DiffChange) {
    result.summary[change.type]++;
    result.summary.total++;
    if (result.changes.length < MAX_REPORTED_CHANGES)
      result.changes.push(change);
  }
  function visit(
    oldValue: unknown,
    newValue: unknown,
    path: (string | number)[]
  ) {
    if (++visited > 200000 || path.length > 50)
      throw new Error(
        "These documents are too large or deeply nested to compare interactively. Try a smaller section."
      );
    if (oldValue === newValue) return;
    if (
      oldValue !== null &&
      newValue !== null &&
      typeof oldValue === "object" &&
      typeof newValue === "object" &&
      Array.isArray(oldValue) === Array.isArray(newValue)
    ) {
      const left = oldValue as Record<string, unknown>;
      const right = newValue as Record<string, unknown>;
      for (const key of Object.keys(left)) {
        const childPath = [
          ...path,
          Array.isArray(oldValue) ? Number(key) : key,
        ];
        if (!Object.prototype.hasOwnProperty.call(right, key))
          report({ path: childPath, type: "removed", oldValue: left[key] });
        else visit(left[key], right[key], childPath);
      }
      for (const key of Object.keys(right)) {
        if (!Object.prototype.hasOwnProperty.call(left, key))
          report({
            path: [...path, Array.isArray(newValue) ? Number(key) : key],
            type: "added",
            newValue: right[key],
          });
      }
      return;
    }
    report({ path, type: "changed", oldValue, newValue });
  }
  visit(a, b, []);
  return result;
}
