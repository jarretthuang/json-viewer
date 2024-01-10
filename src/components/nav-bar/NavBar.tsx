import _ from "lodash";
import Copyright from "../copyright/Copyright";
import "./assets/css/NavBar.css";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  }, [onShare]);

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
        <ArrowBackIcon
          className="mx-2 opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => window.history.back()}
          style={{ height: "85%" }}
        />
        <ArrowForwardIcon
          className="mx-2 opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => window.history.forward()}
          style={{ height: "85%" }}
        />
        <ShareIcon
          className="mx-2 opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => {
            setOnShare(Date.now());
          }}
          style={{ height: "75%" }}
        />
        <MoreHorizIcon
          className="mx-2 opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => expand(!expanded)}
          style={{ height: "100%" }}
        />
      </>
    );
  }

  return (
    <>
      <nav className="NavBar group h-12 md:h-6" data-expanded={expanded}>
        <ul className="flex h-full w-full items-center justify-between">
          <li className="jh-logo p-2">
            <a href="https://labs.jhuang.ca" target="_blank">
              <Image
                src="/logoBW.png"
                alt="JH"
                className="rounded-full object-contain opacity-50 invert hover:opacity-60 dark:invert-0"
                width={40}
                height={40}
              />
            </a>
            <a href="/" className="flex">
              <span className="p-1 text-[25px] font-bold opacity-50 hover:opacity-60">
                jsonviewer.io
              </span>
            </a>
          </li>
          <li className="flex h-full justify-end p-1">{renderHeaderIcons()}</li>
        </ul>
      </nav>
      {expanded && (
        <div className="expanded-content absolute left-0 top-0 z-10 flex h-[100svh] w-[100dvw] flex-col overflow-hidden">
          <div className="flex w-full justify-end pr-5 pt-5">
            <CloseIcon
              className="cursor-pointer opacity-50 hover:opacity-60 md:p-0.5"
              onClick={() => expand(!expanded)}
            />
          </div>
          {renderExpandedContent()}
          <Copyright />
        </div>
      )}
    </>
  );
}
