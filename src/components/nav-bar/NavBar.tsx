"use client";
import _ from "lodash";
import Copyright from "../copyright/Copyright";
import { NavBarParams } from "./NavBarParams";
import "./assets/css/NavBar.css";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

function NavBar(props: NavBarParams) {
  const [expanded, expand] = useState(false);
  const expandedClass = expanded ? "expanded" : "";
  const darkThemeClass = props.isDarkTheme ? "dark-theme" : "";
  const allClassName = ["NavBar", expandedClass, darkThemeClass].join(" ");

  const hexPercent75 = "BF";
  const hexPercent85 = "D9";
  const getColourOrTransparent = (
    colour: string | undefined,
    opacity: string
  ) => {
    return _.isUndefined(colour) ? "transparent" : colour + opacity;
  };

  const backgroundColour = expanded
    ? getColourOrTransparent(props.backgroundColour, hexPercent85)
    : getColourOrTransparent(props.currentApp?.themeColour, hexPercent75);

  const contentPending = () => {
    return (
      <div className="content">
        <span className="title">Coming soon!</span>
      </div>
    );
  };

  const renderContent = () => {
    const metadata = props.currentApp?.metadata;
    if (_.isUndefined(metadata)) {
      return contentPending();
    } else {
      return (
        <div className="content">
          <div className="inner-content">
            <span className="title">{metadata.displayName}</span>
            <ReactMarkdown>
              {props.currentApp?.metadata?.description ?? ""}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
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
      className={allClassName}
      style={{
        backgroundColor: backgroundColour,
      }}
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

export default NavBar;
