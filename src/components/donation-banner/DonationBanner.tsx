"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import "./DonationBanner.css";

const dismissalKey = "json-viewer:donation-banner-dismissed";
const dismissalDurationMs = 30 * 24 * 60 * 60 * 1000;

// Run before the banner is parsed so saved dismissals never flash or shift layout.
const restoreDismissal = `try{const expiresAt=Number(localStorage.getItem(${JSON.stringify(
  dismissalKey
)}));if(Number.isFinite(expiresAt)&&expiresAt>Date.now()){document.documentElement.setAttribute("data-donation-dismissed","true")}}catch{}`;

export default function DonationBanner() {
  const dismiss = () => {
    document.documentElement.setAttribute("data-donation-dismissed", "true");
    try {
      localStorage.setItem(
        dismissalKey,
        String(Date.now() + dismissalDurationMs)
      );
    } catch {
      // Dismiss for this visit even when browser storage is unavailable.
    }
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: restoreDismissal }} />
      <aside className="donation-banner" aria-label="Support JSON Viewer">
        <div className="donation-banner-content">
          <div className="donation-banner-message">
            <InfoOutlinedIcon
              aria-hidden="true"
              style={{ fontSize: 20 }}
            />
            <p>
              JSON Viewer is free. Your donations help keep it free and online.
            </p>
          </div>
          <a
            href="https://www.buymeacoffee.com/jarretthuang"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LocalCafeOutlinedIcon
              aria-hidden="true"
              style={{ fontSize: 14 }}
            />
            Buy me a coffee
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss donation banner"
        >
          <span className="donation-banner-dismiss-circle">
            <CloseIcon aria-hidden="true" style={{ fontSize: 18 }} />
          </span>
        </button>
      </aside>
    </>
  );
}
