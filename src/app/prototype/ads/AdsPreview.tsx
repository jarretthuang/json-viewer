"use client";

import { Suspense, useState } from "react";
import type { ReactNotificationOptions } from "react-notifications-component";
import NavBar from "@/components/nav-bar/NavBar";
import JsonViewer from "@/components/json-viewer/JsonViewer";
import Copyright from "@/components/copyright/Copyright";
import Notification from "@/components/notification/Notification";
import "./ads.css";

type Placement = "below" | "rail" | "top" | "sticky";
const placements: { value: Placement; label: string }[] = [
  { value: "below", label: "A · Below editor" },
  { value: "rail", label: "B · Right rail" },
  { value: "top", label: "C · Slim top" },
  { value: "sticky", label: "D · Bottom sticky" },
];
const creatives = [
  {
    name: "PebbleDB",
    glyph: "{p}",
    text: "A fictional database for your next side project. Branch your data, try a query, keep building. Nothing to sign up for.",
  },
  {
    name: "Tracekite",
    glyph: "↗",
    text: "Imaginary monitoring for real developer daydreams. Find the slow query before your coffee gets cold.",
  },
  {
    name: "Patchwork CI",
    glyph: "✓",
    text: "Pretend pipelines. Perfectly green builds. A fictional dev tool that leaves more time for the work you enjoy.",
  },
];

function MockAd({
  placement,
  creative,
  onDismiss,
}: {
  placement: Placement;
  creative: number;
  onDismiss: () => void;
}) {
  const ad = creatives[creative];
  return (
    <aside
      className={`ads-unit ads-unit-${placement}`}
      aria-label="Advertisement"
    >
      <div className="ads-creative" aria-hidden="true">
        {ad.glyph}
      </div>
      <div className="ads-copy">
        <div className="ads-caption">Sponsored · Mock</div>
        <p>
          <strong>{ad.name}</strong> <span>{ad.text}</span>
        </p>
      </div>
      {(placement === "top" || placement === "sticky") && (
        <button
          className="ads-dismiss"
          type="button"
          aria-label="Dismiss mock advertisement"
          onClick={onDismiss}
        >
          ×
        </button>
      )}
    </aside>
  );
}

export default function AdsPreview() {
  const [placement, setPlacement] = useState<Placement>("below");
  const [proUser, setProUser] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [creative, setCreative] = useState(0);
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >();

  const ad =
    !proUser && !dismissed ? (
      <MockAd
        placement={placement}
        creative={creative}
        onDismiss={() => setDismissed(true)}
      />
    ) : null;

  return (
    <main
      className="ads-prototype"
      data-placement={placement}
      data-pro={proUser}
    >
      <div className="ads-navbar">
        <NavBar
          createNotification={createNotification}
          actionVisibility={{ back: false, forward: false, share: false }}
        />
        {/* Visual mock only: does not read or alter licensing state. */}
        <span className="ads-pro-pill">PRO</span>
      </div>
      <div
        className="ads-switcher"
        role="group"
        aria-label="Prototype controls"
      >
        <span className="ads-prototype-label">Prototype</span>
        <label>
          <span className="sr-only">Ad placement</span>
          <select
            aria-label="Ad placement"
            value={placement}
            onChange={(event) => {
              setPlacement(event.target.value as Placement);
              setDismissed(false);
            }}
          >
            {placements.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="ads-pro-toggle">
          <input
            type="checkbox"
            checked={proUser}
            onChange={(event) => setProUser(event.target.checked)}
          />
          Pro user (ads hidden)
        </label>
        <button
          type="button"
          onClick={() => {
            setCreative((creative + 1) % creatives.length);
            setDismissed(false);
          }}
        >
          Next mock
        </button>
      </div>
      {placement === "top" && !proUser && (
        <div className="ads-top-slot">{ad}</div>
      )}
      <div className="ads-workspace">
        <div className="ads-editor">
          <Suspense fallback={null}>
            <JsonViewer createNotification={createNotification} />
          </Suspense>
        </div>
        {placement === "rail" && !proUser && (
          <div className="ads-rail-slot">{ad}</div>
        )}
      </div>
      {placement === "below" && !proUser && (
        <div className="ads-below-slot">{ad}</div>
      )}
      <Copyright />
      {placement === "sticky" && !proUser && (
        <div className="ads-sticky-reserve">
          <div className="ads-sticky-slot">{ad}</div>
        </div>
      )}
      <Notification notification={notification} />
    </main>
  );
}
