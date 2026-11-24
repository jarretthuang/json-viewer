"use client";
import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/nav-bar/NavBar";
import JsonViewerEditor from "@/components/json-viewer/json-viewer-editor/JsonViewerEditor";
import JsonViewerTree from "@/components/json-viewer/json-viewer-tree/JsonViewerTree";
import { createJsonParseTask } from "@/components/json-viewer/utils/jsonParseWorkerClient";
import { parseJsonTextWithError } from "@/components/json-viewer/utils/jsonUtils";
import { ProGate } from "../../../../pro/licensing/ProGate";
import {
  buildReviewTree,
  computeJsonDiff,
  type DiffResult,
} from "../../../../pro/diff/computeDiff";
import "@/components/json-viewer/JsonViewer.css";
import "./compare.css";

const sampleA = {
  name: "JSON Viewer",
  version: 2,
  legacyMode: true,
  settings: { theme: "light", autosave: true },
  tags: ["json", "viewer", "editor"],
  team: { owner: "Jarrett", region: "Vancouver" },
};
const sampleB = {
  name: "JSON Viewer",
  version: 3,
  settings: { theme: "system", autosave: true },
  tags: ["json", "compare", "editor", "pro"],
  team: { owner: "Jarrett", region: "Vancouver" },
  compare: true,
};
const pretty = (value: unknown) => JSON.stringify(value, null, 2);
// Prototype bound: decline interactive comparison above 2 MB combined.
const MAX_COMPARE_TEXT = 2_000_000;
export default function ComparePreview() {
  const [a, setA] = useState(pretty(sampleA));
  const [b, setB] = useState(pretty(sampleB));
  const [compare, setCompare] = useState(false);
  const [free, setFree] = useState(false);
  const [view, setView] = useState<"edit" | "view">("edit");
  const [result, setResult] = useState<{
    a?: unknown;
    diff?: DiffResult;
    note?: string;
  }>({ a: sampleA });
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState(-1);
  const enabled = compare && !free;
  useEffect(() => {
    let alive = true;
    const tasks: ReturnType<typeof createJsonParseTask>[] = [];
    setPending(true);
    setSelected(-1);
    const timer = window.setTimeout(async () => {
      const primary = createJsonParseTask(a);
      tasks.push(primary);
      const secondary =
        enabled && a.length + b.length <= MAX_COMPARE_TEXT
          ? createJsonParseTask(b)
          : undefined;
      if (secondary) tasks.push(secondary);
      const [left, right] = await Promise.all([
        primary.promise,
        secondary?.promise,
      ]);
      if (!alive) return;
      if (left.status !== "success")
        setResult({
          note: "Primary document is invalid. Fix its JSON in Edit.",
        });
      else if (!enabled) setResult({ a: left.parsed });
      else if (!secondary)
        setResult({
          a: left.parsed,
          note: "Too large to compare interactively in this prototype (2 MB combined limit).",
        });
      else if (right?.status !== "success")
        setResult({
          a: left.parsed,
          note: b.trim()
            ? "Secondary document is invalid. Showing primary document only."
            : "Add a secondary document in Edit to compare. Showing primary document only.",
        });
      else {
        try {
          setResult({
            a: left.parsed,
            diff: computeJsonDiff(left.parsed, right.parsed),
          });
        } catch {
          setResult({
            a: left.parsed,
            note: "Too deeply nested to compare interactively. Showing primary document only.",
          });
        }
      }
      setPending(false);
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      tasks.forEach((task) => task.cancel());
    };
  }, [a, b, enabled]);
  const diff = enabled && !pending ? result.diff : undefined;
  const tree = useMemo(
    () => (diff ? buildReviewTree(result.a, diff.changes) : result.a),
    [result.a, diff]
  );
  const decorations = useMemo(() => {
    if (!diff) return undefined;
    const marks: Record<string, string> = {};
    for (const change of diff.changes) {
      for (let i = 0; i < change.path.length; i++)
        marks[JSON.stringify(change.path.slice(0, i))] ??= "ancestor";
      marks[JSON.stringify(change.path)] = change.type;
    }
    return marks;
  }, [diff]);
  const current = diff?.changes[selected];
  const step = (direction: number) => {
    if (!diff?.changes.length) return;
    setSelected((index) =>
      index < 0
        ? direction > 0
          ? 0
          : diff.changes.length - 1
        : (index + direction + diff.changes.length) % diff.changes.length
    );
  };
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };
  return (
    <main className="compare-preview flex h-full flex-col bg-powderBlue-50 dark:bg-neutral-950">
      <NavBar prototypePro actionVisibility={{ share: false }} />
      <aside className="prototype-controls flex items-center justify-between gap-2 px-3 py-2 text-xs text-powderBlue-600 dark:text-slate-200">
        <span>Prototype · review only</span>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
          />
          Preview as free user
        </label>
      </aside>
      <section className="JsonViewer flex min-h-0 flex-1 flex-col px-2 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-5 pb-3 pt-1">
          <div className="view-switcher">
            <div
              className="buttons gap-4"
              role="tablist"
              aria-label="JSON viewer mode"
            >
              {(["view", "edit"] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={view === tab}
                  className="button view-switcher-button"
                  data-selected={view === tab}
                  onClick={() => setView(tab)}
                >
                  {tab === "view" ? "View" : "Edit"}
                </button>
              ))}
            </div>
          </div>
          <button
            className="compare-switch"
            role="switch"
            aria-checked={compare}
            onClick={() => setCompare((value) => !value)}
          >
            <span className="switch-track">
              <span />
            </span>
            Compare <small>PRO</small>
          </button>
        </div>
        {compare && free ? (
          <div className="m-auto max-w-xl p-4">
            <ProGate previewLocked>{null}</ProGate>
          </div>
        ) : (
          <>
            <div
              hidden={view !== "edit"}
              className={`editor-panes ${enabled ? "dual" : ""}`}
            >
              {[
                { text: a, update: setA, label: "A · Primary document" },
                ...(enabled
                  ? [{ text: b, update: setB, label: "B · Secondary document" }]
                  : []),
              ].map((pane) => (
                <section
                  key={pane.label}
                  aria-label={pane.label}
                  className="editor-pane"
                >
                  {enabled && <h2>{pane.label}</h2>}
                  <div className="min-h-0 flex-1">
                    <JsonViewerEditor
                      currentText={pane.text}
                      updateText={pane.update}
                      isActive={view === "edit"}
                      isDefaultText={false}
                      handleCopy={copy}
                      parseJson={(text) => parseJsonTextWithError(text).parsed}
                    />
                  </div>
                </section>
              ))}
            </div>
            {view === "view" && (
              <div className="tree-pane flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl shadow-subtle">
                {enabled && (
                  <div className="diff-summary" aria-live="polite">
                    <div>
                      {pending ? (
                        "Updating comparison…"
                      ) : diff ? (
                        diff.summary.total ? (
                          <>
                            <span className="added">
                              {diff.summary.added} added
                            </span>
                            <span className="removed">
                              {diff.summary.removed} removed
                            </span>
                            <span className="changed">
                              {diff.summary.changed} changed
                            </span>
                            <span>{diff.summary.total} total</span>
                          </>
                        ) : (
                          "No differences"
                        )
                      ) : (
                        result.note
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!diff?.changes.length}
                        onClick={() => step(-1)}
                      >
                        Prev
                      </button>
                      <span>
                        {current
                          ? `${selected + 1} / ${diff?.changes.length}`
                          : "—"}
                      </span>
                      <button
                        disabled={!diff?.changes.length}
                        onClick={() => step(1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                {diff && (
                  <p className="diff-hint">
                    Arrays compare by position · Values shown from A; additions
                    from B.{" "}
                    {diff.summary.total > diff.changes.length &&
                      `Showing first ${diff.changes.length} of ${diff.summary.total} changes.`}
                    {current && (
                      <>
                        {" "}
                        Selected: {JSON.stringify(current.path)}
                        {current.type === "changed" && (
                          <>
                            {" "}
                            · {JSON.stringify(current.oldValue)} →{" "}
                            {JSON.stringify(current.newValue)}
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}
                <div className="min-h-0 flex-1">
                  {pending ? (
                    <p className="p-4 text-sm">Parsing JSON…</p>
                  ) : result.a !== undefined ? (
                    <JsonViewerTree
                      json={tree}
                      handleCopy={copy}
                      decorations={decorations}
                      revealPath={current?.path}
                      onJsonUpdate={
                        enabled
                          ? undefined
                          : (json: unknown) => setA(pretty(json))
                      }
                    />
                  ) : (
                    <p className="p-4 text-sm">{result.note}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
