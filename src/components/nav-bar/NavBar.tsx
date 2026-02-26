import _ from "lodash";
import Copyright from "../copyright/Copyright";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./NavBar.css";
import { jsonViewerAppDescription } from "@/models/appDescriptions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import { WithNotification } from "../notification/Notification";
import { copyTextToClipboard } from "@/utils/handleCopy";

export default function NavBar({ createNotification }: WithNotification) {
  const [expanded, expand] = useState(false);
  const [onShare, setOnShare] = useState<number | undefined>(undefined);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!onShare) return;
    const currentUrl = window.location.href + window.location.search;
    if (!currentUrl) return;
    if (Boolean(navigator?.share)) {
      navigator.share({ url: currentUrl });
    } else {
      copyTextToClipboard(currentUrl, createNotification, "A shareable URL");
    }
  }, [onShare, createNotification]);

  useEffect(() => {
    if (!expanded) return;
    overlayRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") expand(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expanded]);

  const renderExpandedContent = () => (
    <div className="content" style={{ alignItems: "center", overflow: "hidden" }}>
      <span className="title" style={{ width: "min-content", whiteSpace: "nowrap" }}>
        JSON Viewer
      </span>
      <div className="inner-content" style={{ overflow: "auto", paddingLeft: "2.5rem", paddingRight: "2.5rem" }}>
        <ReactMarkdown>{jsonViewerAppDescription}</ReactMarkdown>
      </div>
    </div>
  );

  function renderHeaderIcons() {
    return (
      <>
        <button type="button" className="nav-icon-button" aria-label="Go back" onClick={() => window.history.back()}>
          <ArrowBackIcon className="nav-icon" style={{ height: "85%" }} />
        </button>
        <button type="button" className="nav-icon-button" aria-label="Go forward" onClick={() => window.history.forward()}>
          <ArrowForwardIcon className="nav-icon" style={{ height: "85%" }} />
        </button>
        <button type="button" className="nav-icon-button" aria-label="Share URL" onClick={() => setOnShare(Date.now())}>
          <ShareIcon className="nav-icon" style={{ height: "75%" }} />
        </button>
        <button
          type="button"
          className="nav-icon-button"
          aria-label="More options"
          aria-expanded={expanded}
          aria-controls="navbar-expanded-panel"
          onClick={() => expand(!expanded)}
        >
          <MoreHorizIcon className="nav-icon" style={{ height: "100%" }} />
        </button>
      </>
    );
  }

  return (
    <>
      <nav className="NavBar" style={{ height: "3.5rem" }} data-expanded={expanded}>
        <ul style={{ display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
          <li className="jh-logo" style={{ padding: "0.5rem" }}>
            <a href="https://jhuang.ca" target="_blank" rel="noreferrer" aria-label="Open JH Labs homepage">
              <Image
                src="/logoBW.png"
                alt="JH"
                style={{ borderRadius: "9999px", objectFit: "contain", opacity: 0.5, filter: "invert(1)" }}
                width={40}
                height={40}
              />
            </a>
            <a href="/" style={{ display: "flex" }} aria-label="Go to JSON Viewer home">
              <span style={{ padding: "0.25rem", fontSize: "1.875rem", fontWeight: 700, opacity: 0.5 }}>
                jsonviewer.io
              </span>
            </a>
          </li>
          <li style={{ display: "flex", height: "100%", justifyContent: "flex-end", padding: "0.25rem" }}>{renderHeaderIcons()}</li>
        </ul>
      </nav>
      {expanded && (
        <div
          id="navbar-expanded-panel"
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="JSON viewer information"
          className="expanded-content"
          style={{ position: "absolute", left: 0, top: 0, zIndex: 10, display: "flex", height: "100svh", width: "100dvw", flexDirection: "column", overflow: "hidden" }}
        >
          <div style={{ display: "flex", width: "100%", justifyContent: "flex-end", paddingRight: "1.25rem", paddingTop: "1.25rem" }}>
            <button type="button" className="nav-close-button" aria-label="Close information panel" onClick={() => expand(!expanded)}>
              <CloseIcon style={{ opacity: 0.5 }} />
            </button>
          </div>
          {renderExpandedContent()}
          <Copyright />
        </div>
      )}
    </>
  );
}
