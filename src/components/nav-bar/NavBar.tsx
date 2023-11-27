"use client";
import _ from "lodash";
import Copyright from "../copyright/Copyright";
import { NavBarParams } from "./NavBarParams";
import "./assets/css/NavBar.css";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./NavBar.css";
import { jsonViewerAppDescription } from "@/model/appDescriptions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";

export default function NavBar(props: NavBarParams) {
  const [expanded, expand] = useState(false);

  const renderContent = () => {
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
          className="mx-2 p-[0.1rem] opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => window.history.back()}
          style={{ height: "85%" }}
        />
        <ArrowForwardIcon
          className="mx-2 p-[0.1rem] opacity-50 hover:opacity-60 md:mx-1"
          onClick={() => window.history.forward()}
          style={{ height: "85%" }}
        />
        <MoreHorizIcon
          className="mx-2 p-[0.1rem] opacity-50 hover:opacity-60 md:mx-1"
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
          <li className="jh-logo p-2 opacity-50 hover:opacity-60">
            <Image
              src="/logoBW.png"
              alt="JH"
              className="object-contain"
              width={36}
              height={36}
            />
            <span className="p-1 text-[25px] font-bold">jsonviewer.io</span>
          </li>
          <li className="flex h-full justify-end p-1">{renderHeaderIcons()}</li>
        </ul>
      </nav>
      {expanded && (
        <div className="expanded-content absolute z-10 flex h-[100dvh] w-[100dvw] flex-col overflow-hidden">
          <div className="flex w-full justify-end pr-5 pt-5">
            <CloseIcon
              className="cursor-pointer opacity-50 hover:opacity-60 md:p-0.5"
              onClick={() => expand(!expanded)}
            />
          </div>
          {renderContent()}
          <Copyright />
        </div>
      )}
    </>
  );
}
