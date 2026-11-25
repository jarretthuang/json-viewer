"use client";

import CloseIcon from "@mui/icons-material/Close";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import "./DonationBanner.css";

const dismissalKey = "json-viewer:donation-banner-dismissed";

// Run before the banner is parsed so saved dismissals never flash or shift layout.
const restoreDismissal = `try{if(localStorage.getItem(${JSON.stringify(
  dismissalKey
)})==="true"){document.documentElement.setAttribute("data-donation-dismissed","true")}}catch{}`;

export default function DonationBanner() {
  const dismiss = () => {
    document.documentElement.setAttribute("data-donation-dismissed", "true");
    try {
      localStorage.setItem(dismissalKey, "true");
    } catch {
      // Dismiss for this visit even when browser storage is unavailable.
    }
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: restoreDismissal }} />
      <aside className="donation-banner" aria-label="Support JSON Viewer">
        <div className="donation-banner-content">
          <p>
            JSON Viewer is free. Your donations help keep it free and online.
          </p>
          <a
            href="https://www.buymeacoffee.com/jarretthuang"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LocalCafeOutlinedIcon
              aria-hidden="true"
              style={{ fontSize: 16 }}
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
          <CloseIcon aria-hidden="true" style={{ fontSize: 18 }} />
        </button>
      </aside>
    </>
  );
}
