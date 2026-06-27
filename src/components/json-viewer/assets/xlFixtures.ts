export function createWideObjectJson(fieldCount: number): string {
  const entries = Array.from({ length: fieldCount }, (_, index) => [
    `key_${index}`,
    index,
  ]);

  return JSON.stringify(Object.fromEntries(entries));
}

export function createLargeArrayJson(itemCount: number): string {
  return JSON.stringify(
    Array.from({ length: itemCount }, (_, index) => ({
      id: index,
      active: index % 2 === 0,
      label: `Item ${index}`,
    }))
  );
}

export function createDeepObjectJson(depth: number): string {
  let text = "0";

  for (let index = 0; index < depth; index += 1) {
    text = `{"level_${index}":${text}}`;
  }

  return text;
}

export function createMixedLargeJson(sectionCount: number): string {
  return JSON.stringify({
    generatedAt: "2026-01-01T00:00:00.000Z",
    sections: Array.from({ length: sectionCount }, (_, sectionIndex) => ({
      id: `section_${sectionIndex}`,
      metadata: {
        rank: sectionIndex,
        flags: {
          archived: false,
          searchable: true,
        },
      },
      values: Array.from({ length: 20 }, (_, valueIndex) => ({
        id: `${sectionIndex}_${valueIndex}`,
        value: valueIndex,
      })),
    })),
  });
}
