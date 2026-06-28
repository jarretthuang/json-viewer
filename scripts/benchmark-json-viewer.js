const { chromium } = require("@playwright/test");

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_RUNS = 10;
const DEFAULT_PAYLOAD_MB = [1, 5, 10];

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BENCHMARK_BASE_URL || DEFAULT_BASE_URL,
    runs: Number(process.env.BENCHMARK_RUNS || DEFAULT_RUNS),
    payloadMb: DEFAULT_PAYLOAD_MB,
  };

  for (const arg of argv) {
    if (arg.startsWith("--base-url=")) {
      options.baseUrl = arg.slice("--base-url=".length);
    } else if (arg.startsWith("--runs=")) {
      options.runs = Number(arg.slice("--runs=".length));
    } else if (arg.startsWith("--payloads=")) {
      options.payloadMb = arg
        .slice("--payloads=".length)
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);
    }
  }

  if (!Number.isFinite(options.runs) || options.runs <= 0) {
    throw new Error("Benchmark runs must be a positive number.");
  }

  if (options.payloadMb.length === 0) {
    throw new Error("At least one positive payload size is required.");
  }

  return options;
}

function createPayload(targetBytes) {
  const records = [];
  let text = "";

  for (let index = 0; text.length < targetBytes; index += 1) {
    records.push({
      id: index,
      active: index % 2 === 0,
      label: `Benchmark item ${index}`,
      score: index * 7,
      tags: ["json", "viewer", "benchmark"],
    });

    if (index % 1000 === 0) {
      text = JSON.stringify({ records });
    }
  }

  return JSON.stringify({ records });
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function formatDuration(ms) {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }

  return `${Math.round(ms)} ms`;
}

async function waitForText(page, expected, timeout = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const bodyText = await page.locator("body").innerText();
    if (bodyText.includes(expected)) {
      return;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`Timed out waiting for text: ${expected}`);
}

async function clickTreeLabel(tree, label) {
  const labelElement = tree.getByText(label, { exact: true }).first();
  await labelElement.waitFor({ state: "visible", timeout: 60_000 });
  await labelElement
    .locator('xpath=ancestor::*[contains(@class, "MuiTreeItem-content")][1]')
    .click();
}

async function runBenchmarkTrial(context, baseUrl, text) {
  const page = await context.newPage();

  await page.goto(baseUrl);
  await page.locator(".monaco-editor").first().waitFor({ state: "visible" });
  await page.evaluate(
    async (payload) => navigator.clipboard.writeText(payload),
    text,
  );

  const pasteStartedAt = performance.now();
  await page.getByRole("button", { name: /^paste$/i }).click();
  await waitForText(page, `${text.length.toLocaleString()} characters`);
  const pasteMs = performance.now() - pasteStartedAt;

  const viewStartedAt = performance.now();
  await page.getByRole("tab", { name: /^view$/i }).click();
  const tree = page.getByLabel(/json viewer tree/i);
  await tree.waitFor({ state: "visible", timeout: 60_000 });
  const viewReadyMs = performance.now() - viewStartedAt;

  const expandRootStartedAt = performance.now();
  await clickTreeLabel(tree, "JSON");
  await tree
    .getByText("records", { exact: true })
    .waitFor({ state: "visible", timeout: 60_000 });
  const expandRootMs = performance.now() - expandRootStartedAt;

  const expandArrayStartedAt = performance.now();
  await clickTreeLabel(tree, "records");
  await tree
    .getByText("[0...99]", { exact: true })
    .waitFor({ state: "visible", timeout: 60_000 });
  const expandArrayMs = performance.now() - expandArrayStartedAt;

  await page.close();

  return {
    pasteMs: Math.round(pasteMs),
    viewReadyMs: Math.round(viewReadyMs),
    expandRootMs: Math.round(expandRootMs),
    expandArrayMs: Math.round(expandArrayMs),
  };
}

async function runBenchmark({ baseUrl, payloadMb, runs }) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const summaries = [];

  try {
    for (const sizeMb of payloadMb) {
      const text = createPayload(sizeMb * 1024 * 1024);
      const trials = [];

      for (let run = 1; run <= runs; run += 1) {
        process.stdout.write(
          `Running ${sizeMb} MB payload (${run}/${runs})...\n`,
        );
        trials.push(await runBenchmarkTrial(context, baseUrl, text));
      }

      summaries.push({
        payload: `${(text.length / 1024 / 1024).toFixed(2)} MB`,
        characters: text.length,
        loadIntoEditor: median(trials.map((trial) => trial.pasteMs)),
        parseAndViewReady: median(trials.map((trial) => trial.viewReadyMs)),
        expandRoot: median(trials.map((trial) => trial.expandRootMs)),
        renderArrayChunks: median(trials.map((trial) => trial.expandArrayMs)),
      });
    }
  } finally {
    await browser.close();
  }

  return summaries;
}

function printSummary(summaries) {
  const rows = summaries.map((summary) => ({
    Payload: summary.payload,
    Characters: summary.characters.toLocaleString(),
    "Load into editor": formatDuration(summary.loadIntoEditor),
    "Parse + view ready": formatDuration(summary.parseAndViewReady),
    "Expand root": formatDuration(summary.expandRoot),
    "Render array chunks": formatDuration(summary.renderArrayChunks),
  }));

  console.log("");
  console.table(rows);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log(`Benchmark target: ${options.baseUrl}`);
  console.log(`Runs per payload: ${options.runs}`);
  console.log(`Payloads: ${options.payloadMb.join(", ")} MB`);
  console.log("");

  const summaries = await runBenchmark(options);
  printSummary(summaries);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
