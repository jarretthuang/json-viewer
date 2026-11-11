// MOCK FOR REVIEW ONLY: isolated Compare-tab prototype; not a shipping feature.
"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "@/components/nav-bar/NavBar";
import JsonViewerEditor from "@/components/json-viewer/json-viewer-editor/JsonViewerEditor";
import JsonViewerTree from "@/components/json-viewer/json-viewer-tree/JsonViewerTree";
import JsonViewerTreeErrorBoundary from "@/components/json-viewer/json-viewer-tree/JsonViewerTreeErrorBoundary";
import Notification from "@/components/notification/Notification";
import type { ReactNotificationOptions } from "react-notifications-component";
import { createJsonParseTask } from "@/components/json-viewer/utils/jsonParseWorkerClient";
import { parseJsonTextWithError } from "@/components/json-viewer/utils/jsonUtils";
import { copyTextToClipboard } from "@/utils/handleCopy";
import { ProUpgradePanel } from "../../../../pro/licensing/ProGate";
import {
  computeJsonDiff,
  type DiffResult,
  type DiffChange,
} from "../../../../pro/diff/computeDiff";
import "@/components/json-viewer/JsonViewer.css";
import "./prototype.css";

const sampleA = {
  name: "Atlas API",
  version: 1,
  legacy: true,
  settings: { region: "us-west", retries: 3 },
  endpoints: ["/users", "/orders"],
  enabled: true,
};
const sampleB = {
  name: "Atlas API",
  version: 2,
  settings: { region: "eu-west", retries: 3 },
  endpoints: ["/users", "/payments", "/health"],
  enabled: true,
  owner: "Platform",
};
const keyOf = (path: (string | number)[]) => JSON.stringify(path);
const pathLabel = (path: (string | number)[]) =>
  "$" +
  path
    .map((part) =>
      typeof part === "number" ? `[${part}]` : `[${JSON.stringify(part)}]`
    )
    .join("");
const display = (value: unknown) =>
  value === undefined ? "∅" : JSON.stringify(value).slice(0, 140);

// Preserve A values, including removals; only graft B's added entries into the display.
function withAdditions(a: unknown, changes: DiffChange[]): unknown {
  const tree = structuredClone(a);
  for (const change of changes) {
    if (change.type !== "added" || !change.path.length) continue;
    let parent = tree as Record<string | number, unknown>;
    for (const part of change.path.slice(0, -1))
      parent = parent[part] as Record<string | number, unknown>;
    Object.defineProperty(parent, change.path[change.path.length - 1], {
      value: change.newValue,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return tree;
}

export default function ComparePrototype() {
  const [mode, setMode] = useState("Compare");
  const [free, setFree] = useState(false);
  const [a, setA] = useState(JSON.stringify(sampleA, null, 2));
  const [b, setB] = useState(JSON.stringify(sampleB, null, 2));
  const [notification, notify] = useState<ReactNotificationOptions>();
  const [result, setResult] = useState<DiffResult>();
  const [tree, setTree] = useState<unknown>(sampleA);
  const [viewTree, setViewTree] = useState<unknown>(sampleA);
  const [selected, select] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const tasks = useRef<ReturnType<typeof createJsonParseTask>[]>([]);
  const generation = useRef(0);
  const cancel = () => {
    generation.current++;
    tasks.current.forEach((task) => task.cancel());
    tasks.current = [];
    setBusy(false);
  };
  useEffect(
    () => () => {
      tasks.current.forEach((task) => task.cancel());
    },
    []
  );
  const parse = (text: string) => {
    const parsed = parseJsonTextWithError(text);
    if (parsed.errorMessage)
      notify({
        title: "Invalid JSON",
        type: "info",
        container: "top-center",
        message: parsed.errorMessage,
      });
    return parsed.parsed;
  };
  const copy = (text: string) => copyTextToClipboard(text, notify);
  const update = (side: "A" | "B", text: string) => {
    cancel();
    (side === "A" ? setA : setB)(text);
    setResult(undefined);
    setMessage("");
  };
  async function run() {
    cancel();
    const revision = generation.current;
    setResult(undefined);
    setMessage("");
    if (a.length + b.length > 4000000) {
      setMessage(
        "These documents are too large to compare interactively in this prototype. Try a smaller section."
      );
      return;
    }
    setBusy(true);
    try {
      tasks.current = [createJsonParseTask(a), createJsonParseTask(b)];
      const parsed = await Promise.all(
        tasks.current.map((task) => task.promise)
      );
      if (revision !== generation.current) return;
      for (const item of parsed) {
        if (item.status === "error") {
          notify({
            title: "Invalid JSON",
            type: "info",
            container: "top-center",
            message: item.errorMessage,
          });
          setMessage("Invalid JSON. Fix both inputs before comparing.");
          return;
        }
      }
      if (parsed[0].status !== "success" || parsed[1].status !== "success")
        return;
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (revision !== generation.current) return;
      const diff = computeJsonDiff(parsed[0].parsed, parsed[1].parsed);
      setTree(withAdditions(parsed[0].parsed, diff.changes));
      setResult(diff);
      select(0);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to compare these documents."
      );
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }
  const active = result?.changes[selected];
  const decorations = new Map(
    result?.changes.map((change) => [keyOf(change.path), change.type])
  );
  const ancestors = new Set(
    result?.changes.flatMap((change) =>
      change.path.map((_, index) => keyOf(change.path.slice(0, index)))
    )
  );
  const editor = (side: "A" | "B") => (
    <JsonViewerEditor
      currentText={side === "A" ? a : b}
      updateText={(text) => update(side, text)}
      isActive={!free}
      isDefaultText={false}
      handleCopy={copy}
      parseJson={parse}
      inputOnly={side === "B"}
    />
  );

  return (
    <main className="compare-prototype min-h-full bg-powderBlue-50 dark:bg-neutral-950">
      <NavBar actionVisibility={{ share: false }} />
      <div className="prototype-review">
        <span>PROTOTYPE · Review only</span>
        <label>
          <input
            type="checkbox"
            checked={free}
            onChange={(event) => {
              cancel();
              setFree(event.target.checked);
            }}
          />{" "}
          Preview free user
        </label>
      </div>
      <div className="JsonViewer px-2 pb-2">
        <div className="view-switcher flex h-14 md:h-8">
          <div
            className="buttons gap-3"
            role="tablist"
            aria-label="JSON viewer mode"
          >
            {["View", "Edit", "Compare"].map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={mode === tab}
                data-selected={mode === tab}
                className="button view-switcher-button"
                onClick={() => {
                  cancel();
                  if (tab === "View") {
                    const value = parse(a);
                    if (value === undefined) return;
                    setViewTree(value);
                  }
                  setMode(tab);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {mode === "Compare" ? (
          free ? (
            <div className="prototype-gate">
              <ProUpgradePanel />
            </div>
          ) : (
            <>
              <div className="compare-heading">
                <div>
                  <h1>
                    Compare JSON <span className="prototype-pill">PRO</span>
                  </h1>
                  <p>See what changed. Formatting and key order are ignored.</p>
                </div>
                <button className="compare-run" disabled={busy} onClick={run}>
                  {busy ? "Comparing…" : "Compare"}
                </button>
              </div>
              <div className="compare-inputs">
                {(["A", "B"] as const).map((side) => (
                  <section
                    key={side}
                    className="compare-pane"
                    aria-label={`Document ${side}`}
                  >
                    <h2>
                      <b>{side}</b>{" "}
                      {side === "A" ? "Current document" : "Compare with"}
                    </h2>
                    <div className="compare-editor">{editor(side)}</div>
                  </section>
                ))}
              </div>
              <p className="compare-note">
                Arrays compare by position. Your current document A stays intact
                when you leave Compare.
              </p>
              <div role="status" aria-live="polite">
                {message || (busy ? "Parsing and comparing documents…" : "")}
              </div>
              {result && (
                <section aria-label="Comparison results">
                  <div className="compare-summary" aria-live="polite">
                    <strong>
                      {result.summary.total
                        ? `${result.summary.total} changes`
                        : "No differences"}
                    </strong>
                    <span className="count-added">
                      + {result.summary.added} added
                    </span>
                    <span className="count-removed">
                      − {result.summary.removed} removed
                    </span>
                    <span className="count-changed">
                      ~ {result.summary.changed} changed
                    </span>
                    <div className="compare-step">
                      <button
                        disabled={!active || selected === 0}
                        onClick={() => select(selected - 1)}
                      >
                        ← Prev
                      </button>
                      <span>
                        {active
                          ? `${selected + 1} / ${result.changes.length}`
                          : "0 / 0"}
                      </span>
                      <button
                        disabled={
                          !active || selected === result.changes.length - 1
                        }
                        onClick={() => select(selected + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                  {result.summary.total > result.changes.length && (
                    <p className="compare-note">
                      Showing first {result.changes.length} of{" "}
                      {result.summary.total} changes. Tree markers cover these
                      reported changes.
                    </p>
                  )}
                  <div className="compare-results">
                    <div className="compare-list" aria-label="Changes">
                      {result.changes.map((change, index) => (
                        <button
                          key={keyOf(change.path)}
                          aria-pressed={index === selected}
                          onClick={() => select(index)}
                        >
                          <span>
                            <code>{pathLabel(change.path)}</code>
                            <b className={`count-${change.type}`}>
                              {change.type}
                            </b>
                          </span>
                          <code className="change-values">
                            {display(change.oldValue)} →{" "}
                            {display(change.newValue)}
                          </code>
                        </button>
                      ))}
                      {!active && (
                        <p>
                          Both documents have the same structure and values.
                        </p>
                      )}
                    </div>
                    <section
                      className="compare-tree"
                      aria-label="Document A with diff highlights"
                    >
                      <h2>
                        Document A{" "}
                        <small>
                          with added entries from B · removed entries retain A
                          values
                        </small>
                      </h2>
                      <JsonViewerTreeErrorBoundary>
                        <JsonViewerTree
                          json={tree}
                          handleCopy={copy}
                          revealPath={active?.path}
                          decoratePath={(path: (string | number)[]) => ({
                            "data-diff":
                              decorations.get(keyOf(path)) ??
                              (ancestors.has(keyOf(path))
                                ? "ancestor"
                                : undefined),
                            "data-diff-selected":
                              keyOf(path) === keyOf(active?.path ?? ["__none"]),
                          })}
                        />
                      </JsonViewerTreeErrorBoundary>
                    </section>
                  </div>
                </section>
              )}
            </>
          )
        ) : (
          <div className="prototype-normal">
            {mode === "Edit" ? (
              editor("A")
            ) : (
              <JsonViewerTree
                json={viewTree}
                handleCopy={copy}
                onJsonUpdate={(value: unknown) => {
                  setViewTree(value);
                  update("A", JSON.stringify(value, null, 2));
                }}
              />
            )}
          </div>
        )}
      </div>
      <Notification notification={notification} />
    </main>
  );
}
