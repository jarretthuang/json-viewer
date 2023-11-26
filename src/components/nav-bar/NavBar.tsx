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
      <div className="content">
        <div className="inner-content">
          <span className="title">JSON Viewer</span>
          <ReactMarkdown>{jsonViewerAppDescription}</ReactMarkdown>
        </div>
      </div>
    );
  };

  function renderHeaderIcons() {
    if (expanded) {
      return (
        <CloseIcon
          className="h-full p-0 opacity-50 hover:opacity-60 md:p-0.5"
          onClick={() => expand(!expanded)}
        />
      );
    } else {
      return (
        <>
          <ArrowBackIcon
            className="h-5/6 p-0.5 opacity-50 hover:opacity-60"
            onClick={() => window.history.back()}
          />
          <ArrowForwardIcon
            className="h-5/6 p-0.5 opacity-50 hover:opacity-60"
            onClick={() => window.history.forward()}
          />
          <MoreHorizIcon
            className="h-full p-0 opacity-50 hover:opacity-60"
            onClick={() => expand(!expanded)}
          />
        </>
      );
    }
  }

  return (
    <nav className="NavBar group" data-expanded={expanded}>
      <ul>
        <li className="jh-logo opacity-50 hover:opacity-60">
          <Image
            src="/logoBW.png"
            alt="JH"
            className="object-contain"
            width={36}
            height={36}
          />
          <span className="p-1 text-[20px] font-bold">jsonviewer.io</span>
        </li>
        <li className="handle group-data-[expanded=true]:mt-4">
          {renderHeaderIcons()}
        </li>
        <li className="expanded-content">
          {renderContent()}
          <Copyright />
        </li>
      </ul>
    </nav>
  );
}
