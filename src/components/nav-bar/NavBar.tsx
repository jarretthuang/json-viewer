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
import InfoIcon from "@mui/icons-material/Info";
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

  function renderHeaderIcon() {
    if (expanded) {
      return <CloseIcon className="handle-symbol h-[30px]" />;
    } else {
      return <MoreHorizIcon className="handle-symbol h-[35px]" />;
    }
  }

  return (
    <nav className="NavBar group" data-expanded={expanded}>
      <ul>
        <li className="jh-logo">
          <Image
            src="/logoBW.png"
            alt="JH"
            className="object-contain"
            width={36}
            height={36}
          />
          <span className="p-1 text-[20px] font-bold">jsonviewer.io</span>
        </li>
        <li
          className="handle group-data-[expanded=true]:mt-4"
          onClick={() => expand(!expanded)}
        >
          {renderHeaderIcon()}
        </li>
        <li className="expanded-content">
          {renderContent()}
          <Copyright />
        </li>
      </ul>
    </nav>
  );
}
