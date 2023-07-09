"use client";
import { Fragment, useState } from "react";
import "./assets/css/json-viewer.css";
import Notification from "../notification/Notification";
import { ReactNotificationOptions } from "react-notifications-component";
import JsonViewerTree from "./JsonViewerTree";
import Head from "next/head";
import JsonViewerEditor from "./JsonViewerEditor";

function JsonViewer(props: any) {
  type ViewType = "view" | "edit";
  const [currentView, switchView] = useState<ViewType>("edit");
  const getSelectedClass = (view: ViewType) =>
    currentView === view ? "selected " : "";
  const defaultText = "Paste your JSON text here!";
  const [currentText, updateText] = useState(defaultText);
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);
  const [jsonObject, updateJsonObject] = useState(undefined);

  const parseJson = (text: string, notify: boolean = true) => {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.log(e);
      if (notify) {
        let error: string;
        if (typeof e === "string") {
          error = e.toUpperCase(); // works, `e` narrowed to string
        } else if (e instanceof Error) {
          error = e.message; // works, `e` narrowed to Error
        } else {
          error = "";
        }
        const notification: ReactNotificationOptions = {
          title: "Invalid JSON",
          type: "info",
          container: "top-center",
          message: error,
        };
        createNotification(notification);
      }
      return undefined;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    const notification: ReactNotificationOptions = {
      title: "Copied to clipboard",
      type: "success",
      container: "top-center",
      message: "Content has been successfully copied into your clipboard!",
    };
    createNotification(notification);
  };

  const renderEditView = (hide: boolean) => {
    return (
      <div className="json-viewer-container" hidden={hide}>
        <JsonViewerEditor
          currentText={currentText}
          isDefaultText={currentText == defaultText}
          updateText={updateText}
          handleCopy={handleCopy}
          parseJson={parseJson}
        />
      </div>
    );
  };

  const renderTreeView = (hide: boolean) => {
    return (
      <div className="json-viewer-container" hidden={hide}>
        <div className="readonly-view">
          <JsonViewerTree
            json={jsonObject}
            handleCopy={handleCopy}
          ></JsonViewerTree>
        </div>
      </div>
    );
  };

  const renderView = (viewType: ViewType) => {
    const isInEditView = viewType === "edit";
    return (
      <Fragment>
        {renderEditView(!isInEditView)}
        {renderTreeView(isInEditView)}
      </Fragment>
    );
  };

  const openTreeView = () => {
    const parsedJson = parseJson(currentText);
    if (parsedJson) {
      updateJsonObject(parsedJson);
      switchView("view");
    }
  };

  return (
    <div className="JsonViewer">
      <Head>
        <title>JSON Viewer - JH Labs</title>
        <meta name="theme-color" content="#fdfeff" />
      </Head>
      <div className="view-switcher">
        <div className="buttons">
          <div
            className={
              "button view-switcher-button " + getSelectedClass("view")
            }
            onClick={openTreeView}
          >
            View
          </div>
          <b></b>
          <div
            className={
              "button view-switcher-button " + getSelectedClass("edit")
            }
            onClick={() => switchView("edit")}
          >
            Edit
          </div>
        </div>
      </div>
      {renderView(currentView)}
      <Notification notification={notification}></Notification>
    </div>
  );
}

export default JsonViewer;
