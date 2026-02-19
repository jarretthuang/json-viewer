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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!onShare) {
      return;
    }
    const currentUrl = window.location.href + window.location.search;
    if (!currentUrl) {
      return;
    }
    if (Boolean(navigator?.share)) {
      navigator.share({ url: currentUrl });
    } else {
      copyTextToClipboard(currentUrl, createNotification, "A shareable URL");
    }
  }, [onShare, createNotification]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        expand(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [expanded]);

  const renderExpandedContent = () => {
    return (
      <div className="content items-center overflow-hidden">
        <span className="title w-min whitespace-nowrap">JSON Viewer</span>
        <div className="inner-content overflow-auto px-10">
          <ReactMarkdown>{jsonViewerAppDescription}</ReactMarkdown>
        </div>
      </div>
    );
  };

  function renderHeaderIcons() {
    return (
      <>
        <button
          type="button"
          className="nav-icon-button"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <ArrowBackIcon className="nav-icon" style={{ height: "85%" }} />
        </button>
        <button
          type="button"
          className="nav-icon-button"
          aria-label="Go forward"
          onClick={() => window.history.forward()}
        >
          <ArrowForwardIcon className="nav-icon" style={{ height: "85%" }} />
        </button>
        <button
          type="button"
          className="nav-icon-button"
          aria-label="Share URL"
          onClick={() => {
            setOnShare(Date.now());
          }}
        >
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
      <nav className="NavBar group h-12 md:h-6" data-expanded={expanded}>
        <ul className="flex h-full w-full items-center justify-between">
          <li className="jh-logo p-2">
            <a href="https://jhuang.ca" target="_blank" rel="noreferrer" aria-label="Open JH Labs homepage">
              <Image
                src="/logoBW.png"
                alt="JH"
                className="rounded-full object-contain opacity-50 invert hover:opacity-60 dark:invert-0"
                width={40}
                height={40}
              />
            </a>
            <a href="/" className="flex" aria-label="Go to JSON Viewer home">
              <span className="p-1 text-[25px] font-bold opacity-50 hover:opacity-60">
                jsonviewer.io
              </span>
            </a>
          </li>
          <li className="flex h-full justify-end p-1">{renderHeaderIcons()}</li>
        </ul>
      </nav>
      {expanded && (
        <div
          id="navbar-expanded-panel"
          role="dialog"
          aria-modal="true"
          aria-label="JSON viewer information"
          className="expanded-content absolute left-0 top-0 z-10 flex h-[100svh] w-[100dvw] flex-col overflow-hidden"
        >
          <div className="flex w-full justify-end pr-5 pt-5">
            <button
              type="button"
              ref={closeButtonRef}
              className="nav-close-button"
              aria-label="Close information panel"
              onClick={() => expand(!expanded)}
            >
              <CloseIcon className="opacity-50 hover:opacity-60 md:p-0.5" />
            </button>
          </div>
          {renderExpandedContent()}
          <Copyright />
        </div>
      )}
    </>
  );
}
