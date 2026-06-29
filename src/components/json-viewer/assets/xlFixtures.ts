export const XL_EXAMPLE_JSON_TEXT_LENGTH = 2_000_000;

const XL_EXAMPLE_CATEGORIES = [
  "analytics",
  "billing",
  "customer-success",
  "infrastructure",
  "security",
  "support",
] as const;

const XL_EXAMPLE_REGIONS = [
  "ap-southeast-2",
  "eu-central-1",
  "us-east-1",
  "us-west-2",
] as const;

const XL_EXAMPLE_TEAMS = [
  "Core Platform",
  "Data Experience",
  "Growth Systems",
  "Reliability",
  "Trust and Safety",
] as const;

const XL_EXAMPLE_STATUSES = [
  "active",
  "paused",
  "pending-review",
  "scheduled",
] as const;

const XL_EXAMPLE_NOTES = [
  "Imported from the nightly customer activity rollup.",
  "Contains synthetic metrics for testing nested JSON exploration.",
  "Includes optional fields to exercise null and boolean rendering.",
  "Generated locally for large-file editor and tree-view validation.",
] as const;

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

function createIsoDate(index: number, offsetDays = 0): string {
  return new Date(
    Date.UTC(
      2026,
      (index + offsetDays) % 12,
      ((index + offsetDays) % 28) + 1,
      index % 24,
      (index * 7) % 60,
      (index * 13) % 60
    )
  ).toISOString();
}

function createContentRichXLRecord(index: number) {
  const category = pick(XL_EXAMPLE_CATEGORIES, index);
  const region = pick(XL_EXAMPLE_REGIONS, index * 3);
  const team = pick(XL_EXAMPLE_TEAMS, index * 2);
  const status = pick(XL_EXAMPLE_STATUSES, index);

  return {
    id: `record-${String(index).padStart(5, "0")}`,
    title: `${team} ${category} snapshot ${index}`,
    text:
      "This generated record gives the XL JSON example realistic nested content for testing formatting, minifying, search, upload, and tree exploration.",
    category,
    status,
    active: status === "active" || index % 5 === 0,
    priority: index % 9 === 0 ? "high" : index % 3 === 0 ? "medium" : "low",
    owner: {
      team,
      contact: `owner-${index % 50}@example.com`,
      escalationPath: [
        `triage-${index % 7}`,
        `service-owner-${index % 11}`,
        `director-${index % 5}`,
      ],
    },
    location: {
      region,
      availabilityZones: [`${region}a`, `${region}b`, `${region}c`],
      warehouse: `wh-${String(index % 40).padStart(2, "0")}`,
    },
    metrics: {
      score: index * 7,
      rank: index % 100,
      percentile: Number(((index % 997) / 10).toFixed(1)),
      latencyMs: 80 + (index % 350),
      errorRate: Number(((index % 23) / 1000).toFixed(3)),
      monthlyCostUsd: Number((125 + (index % 500) * 3.17).toFixed(2)),
    },
    schedule: {
      createdAt: createIsoDate(index),
      updatedAt: createIsoDate(index, 3),
      nextReviewAt: index % 6 === 0 ? null : createIsoDate(index, 17),
    },
    flags: {
      requiresReview: index % 6 === 0,
      customerVisible: index % 4 !== 0,
      usesWorkerParsing: true,
      canShareByUrl: false,
    },
    tags: [
      "json-viewer",
      "xl-example",
      category,
      region,
      status,
      index % 2 === 0 ? "even-record" : "odd-record",
    ],
    notes: [pick(XL_EXAMPLE_NOTES, index), pick(XL_EXAMPLE_NOTES, index + 1)],
    relatedItems: Array.from({ length: 3 }, (_, relatedIndex) => ({
      id: `related-${index}-${relatedIndex}`,
      weight: relatedIndex + 1,
      href: `https://example.com/json-viewer/${category}/${index}/${relatedIndex}`,
    })),
  };
}

function createContentRichXLExampleJson(itemCount: number): string {
  const records = Array.from({ length: itemCount }, (_, index) =>
    createContentRichXLRecord(index)
  );

  return JSON.stringify(
    {
      generatedAt: "2026-06-29T00:00:00.000Z",
      name: "JSON Viewer XL example",
      description:
        "A deterministic, content-rich JSON document for testing large payload editing, validation, formatting, minifying, upload, and tree exploration.",
      summary: {
        recordCount: records.length,
        categories: XL_EXAMPLE_CATEGORIES,
        regions: XL_EXAMPLE_REGIONS,
        teams: XL_EXAMPLE_TEAMS,
      },
      records,
    },
    null,
    2
  );
}

function createContentRichXLExampleJsonAtLeast(minLength: number): string {
  let lowItemCount = 1;
  let highItemCount = Math.max(1, Math.ceil(minLength / 900));
  let text = createContentRichXLExampleJson(highItemCount);

  while (text.length < minLength) {
    lowItemCount = highItemCount + 1;
    highItemCount = Math.ceil(highItemCount * 1.25);
    text = createContentRichXLExampleJson(highItemCount);
  }

  while (lowItemCount < highItemCount) {
    const midpoint = Math.floor((lowItemCount + highItemCount) / 2);
    const midpointText = createContentRichXLExampleJson(midpoint);

    if (midpointText.length >= minLength) {
      highItemCount = midpoint;
      text = midpointText;
    } else {
      lowItemCount = midpoint + 1;
    }
  }

  return text;
}

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
  xlExampleJson ??= createContentRichXLExampleJsonAtLeast(
    XL_EXAMPLE_JSON_TEXT_LENGTH
  );
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
