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
import ModeToggle from "@/components/theme/ModeToggle";

type NavBarActionVisibility = {
  back?: boolean;
  forward?: boolean;
  share?: boolean;
  themeToggle?: boolean;
  moreOptions?: boolean;
};

type NavBarProps = Partial<WithNotification> & {
  showActions?: boolean;
  actionVisibility?: NavBarActionVisibility;
};

export default function NavBar({
  createNotification,
  showActions = true,
  actionVisibility,
}: NavBarProps) {
  const [expanded, expand] = useState(false);
  const [onShare, setOnShare] = useState<number | undefined>(undefined);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const isActionVisible = (key: keyof NavBarActionVisibility) => {
    if (!showActions) {
      return false;
    }

    return actionVisibility?.[key] ?? true;
  };

  const showAnyAction =
    isActionVisible("back") ||
    isActionVisible("forward") ||
    isActionVisible("share") ||
    isActionVisible("themeToggle") ||
    isActionVisible("moreOptions");

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
    } else if (createNotification) {
      copyTextToClipboard(currentUrl, createNotification, "A shareable URL");
    } else {
      navigator.clipboard.writeText(currentUrl);
    }
  }, [onShare, createNotification]);

  useEffect(() => {
    if (!isActionVisible("moreOptions") || !expanded) {
      return;
    }

    overlayRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        expand(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [expanded, showActions, actionVisibility]);

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
        {isActionVisible("back") && (
          <button
            type="button"
            className="nav-icon-button nav-mobile-hidden"
            aria-label="Go back"
            onClick={() => window.history.back()}
          >
            <ArrowBackIcon className="nav-icon" style={{ height: "85%" }} />
          </button>
        )}
        {isActionVisible("forward") && (
          <button
            type="button"
            className="nav-icon-button nav-mobile-hidden"
            aria-label="Go forward"
            onClick={() => window.history.forward()}
          >
            <ArrowForwardIcon className="nav-icon" style={{ height: "85%" }} />
          </button>
        )}
        {isActionVisible("share") && (
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
        )}
        {isActionVisible("themeToggle") && <ModeToggle />}
        {isActionVisible("moreOptions") && (
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
        )}
      </>
    );
  }

  return (
    <>
      <nav className="NavBar group h-12 md:h-6" data-expanded={expanded}>
        <ul className="flex h-full w-full items-center justify-between">
          <li className="jh-logo p-2">
            <a
              href="https://jhuang.ca"
              target="_blank"
              rel="noreferrer"
              aria-label="Open JH Labs homepage"
            >
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
          {showAnyAction && (
            <li className="flex h-full justify-end p-1">{renderHeaderIcons()}</li>
          )}
        </ul>
      </nav>
      {isActionVisible("moreOptions") && expanded && (
        <div
          id="navbar-expanded-panel"
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="JSON viewer information"
          className="expanded-content absolute left-0 top-0 z-10 flex h-[100svh] w-[100dvw] flex-col overflow-hidden"
        >
          <div className="flex w-full justify-end pr-5 pt-5">
            <button
              type="button"
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
