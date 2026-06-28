export const XL_EXAMPLE_JSON_TEXT_LENGTH = 2_000_000;

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

export function createLargeArrayJsonAtLeast(minLength: number): string {
  let lowItemCount = 1;
  let highItemCount = Math.max(1, Math.ceil(minLength / 50));
  let text = createLargeArrayJson(highItemCount);

  while (text.length < minLength) {
    lowItemCount = highItemCount + 1;
    highItemCount = Math.ceil(highItemCount * 1.25);
    text = createLargeArrayJson(highItemCount);
  }

  while (lowItemCount < highItemCount) {
    const midpoint = Math.floor((lowItemCount + highItemCount) / 2);
    const midpointText = createLargeArrayJson(midpoint);

    if (midpointText.length >= minLength) {
      highItemCount = midpoint;
      text = midpointText;
    } else {
      lowItemCount = midpoint + 1;
    }
  }

  return text;
}

let xlExampleJson: string | undefined;

export function createXLExampleJson(): string {
  xlExampleJson ??= createLargeArrayJsonAtLeast(XL_EXAMPLE_JSON_TEXT_LENGTH);
  return xlExampleJson;
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
