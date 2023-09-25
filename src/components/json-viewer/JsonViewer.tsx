"use client";
import { Fragment, useState } from "react";
import "./assets/css/json-viewer-mobile.css";
import Notification from "../notification/Notification";
import { ReactNotificationOptions } from "react-notifications-component";
import JsonViewerTree from "./json-viewer-tree/JsonViewerTree";
import Head from "next/head";
import JsonViewerEditor from "./json-viewer-editor/JsonViewerEditor";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { useSearchParams } from "next/navigation";
import "./JsonViewer.css";

function JsonViewer(props: any) {
  type ViewType = "view" | "edit";

  // constants
  const JSON_QUERY_PARAM: string = "json";
  const DEFAULT_TEXT: string = "Paste your JSON text here!";
  const MAX_QUERY_PARAM_LENGTH: number = 20000;

  const [currentView, switchView] = useState<ViewType>("edit");
  const getSelectedClass = (view: ViewType) =>
    currentView === view ? "selected " : "";

  const initialQueryParams = useSearchParams();
  const initialJsonQueryParam = initialQueryParams.get(JSON_QUERY_PARAM);
  const initialText = decodeUrlParam(initialJsonQueryParam) ?? DEFAULT_TEXT;

  const [currentText, updateText] = useState(initialText);
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
          isDefaultText={currentText === DEFAULT_TEXT}
          updateText={handleUpdateText}
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

  function handleUpdateText(s: string): void {
    updateText(s);
    updateJsonUrlParam(s);
  }

  function updateJsonUrlParam(text: string): void {
    if (!text) {
      removeUrlParameter(JSON_QUERY_PARAM); // remove query param if text is empty
    } else {
      const encodedText: string = compressToEncodedURIComponent(text);
      if (encodedText.length <= MAX_QUERY_PARAM_LENGTH) {
        //TODO: validate raw test instead of parsed text?
        insertUrlParam(JSON_QUERY_PARAM, encodedText);
      } else {
        removeUrlParameter(JSON_QUERY_PARAM);
      }
    }
  }

  function insertUrlParam(key: string, value: string): void {
    if (window.history.pushState) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(key, value);
      const newUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        searchParams.toString();
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }

  function decodeUrlParam(param: string | null): string | undefined {
    return param ? decompressFromEncodedURIComponent(param) : undefined;
  }

  function removeUrlParameter(paramKey: string) {
    const url = window.location.href;
    const urlObject = new URL(url);
    urlObject.searchParams.delete(paramKey);
    const newUrl = urlObject.href;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  return (
    <div className="JsonViewer">
      <Head>
        <title>JSON Viewer - JH Labs</title>
        <meta name="theme-color" content="#fdfeff" />
      </Head>
      <div className="view-switcher">
        <div className="buttons">
          <div
            className="button view-switcher-button"
            data-selected={currentView === "view"}
            onClick={openTreeView}
          >
            View
          </div>
          <b></b>
          <div
            className="button view-switcher-button"
            data-selected={currentView === "edit"}
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
