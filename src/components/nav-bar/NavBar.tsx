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

  const handleLogoClicked = () => {
    if (props.goHome) {
      props.goHome();
    } else {
      window.location.assign("https://labs.jhuang.ca");
    }
  };

  return (
    <nav
      className="NavBar"
      data-expanded={expanded}
    >
      <ul>
        <li className="jh-logo" onClick={handleLogoClicked}>
          <Image
            src="/logoBW.png"
            alt="JH"
            className="object-contain"
            width={36}
            height={36}
          />
        </li>
        <li className="handle" onClick={() => expand(!expanded)}>
          <span className="handle-symbol">+</span>
        </li>
        <li className="expanded-content">
          {renderContent()}
          <Copyright />
        </li>
      </ul>
    </nav>
  );
}
