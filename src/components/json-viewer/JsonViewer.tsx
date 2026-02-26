"use client";
import { useState } from "react";

import { ReactNotificationOptions } from "react-notifications-component";
import JsonViewerTree from "./json-viewer-tree/JsonViewerTree";
import JsonViewerEditor from "./json-viewer-editor/JsonViewerEditor";
import { useSearchParams } from "next/navigation";
import "./JsonViewer.css";
import { WithNotification } from "../notification/Notification";
import { copyTextToClipboard } from "@/utils/handleCopy";
import {
  parseJsonTextWithError,
  stringifyJson,
} from "./utils/jsonUtils";
import {
  buildUrlWithQueryParam,
  buildUrlWithoutQueryParam,
  decodeJsonQueryParam,
  encodeJsonQueryParam,
  JSON_QUERY_PARAM,
  MAX_QUERY_PARAM_LENGTH,
} from "./utils/jsonUrlUtils";

function JsonViewer({ createNotification }: WithNotification) {
  type ViewType = "view" | "edit";

  const DEFAULT_TEXT: string = "Paste your JSON text here!";

  const [currentView, switchView] = useState<ViewType>("edit");

  const initialQueryParams = useSearchParams();
  const initialJsonQueryParam = initialQueryParams.get(JSON_QUERY_PARAM);
  const initialText = decodeJsonQueryParam(initialJsonQueryParam) ?? DEFAULT_TEXT;

  const [currentText, updateText] = useState(initialText);
  const [jsonObject, updateJsonObject] = useState<unknown>(undefined);
  const [liveMessage, setLiveMessage] = useState("");

  const isDefaultText = currentText === DEFAULT_TEXT;
  const textSize = currentText.length;

  const announce = (message: string) => {
    setLiveMessage("");
    window.requestAnimationFrame(() => {
      setLiveMessage(message);
    });
  };

  const parseJson = (text: string, notify: boolean = true) => {
    const { parsed, errorMessage } = parseJsonTextWithError(text);

    if (parsed !== undefined) {
      return parsed;
    }

    if (notify) {
      const notification: ReactNotificationOptions = {
        title: "Invalid JSON",
        type: "info",
        container: "top-center",
        message: errorMessage,
      };
      createNotification(notification);
      announce("Invalid JSON. Please fix syntax errors.");
    }

    return undefined;
  };

  const handleCopy = (text: string) => {
    copyTextToClipboard(text, createNotification);
    announce("Copied to clipboard.");
  };

  const renderView = (viewType: ViewType) => {
    const isInEditView = viewType === "edit";
    return (
      <>
        <div style={{ position: "relative", flex: 1, overflow: "hidden", borderRadius: "0.75rem", boxShadow: "0px 0px 6px rgb(0 0 0 / 30%)" }}>
          <div style={{ position: "absolute", height: "100%", width: "100%" }} hidden={!isInEditView}>
            <JsonViewerEditor
              currentText={currentText}
              isDefaultText={isDefaultText}
              updateText={handleUpdateText}
              handleCopy={handleCopy}
              parseJson={parseJson}
            />
          </div>
          <div style={{ position: "absolute", height: "100%", width: "100%" }} hidden={isInEditView}>
            <JsonViewerTree
              json={jsonObject}
              handleCopy={handleCopy}
              onJsonUpdate={handleJsonUpdate}
            ></JsonViewerTree>
          </div>
        </div>
      </>
    );
  };

  const openTreeView = () => {
    const parsedJson = parseJson(currentText);
    if (parsedJson) {
      updateJsonObject(parsedJson);
      switchView("view");
      announce("Switched to view mode.");
    }
  };

  const handleJsonUpdate = (newJson: any) => {
    updateJsonObject(newJson);
    const newText = stringifyJson(newJson);
    updateText(newText);
    updateJsonUrlParam(newText);
    announce("JSON updated.");
  };

  function handleUpdateText(s: string): void {
    updateText(s);
    updateJsonUrlParam(s);
  }

  function updateJsonUrlParam(text: string): void {
    const encodedText = encodeJsonQueryParam(text, MAX_QUERY_PARAM_LENGTH);
    const newUrl = encodedText
      ? buildUrlWithQueryParam(window.location.href, JSON_QUERY_PARAM, encodedText)
      : buildUrlWithoutQueryParam(window.location.href, JSON_QUERY_PARAM);

    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  return (
    <div className="JsonViewer" style={{ display: "flex", width: "100%", flex: 1, flexDirection: "column", backgroundColor: "#fdfeff", paddingLeft: "0.5rem", paddingRight: "0.5rem", paddingBottom: "0.5rem" }}>
      <div className="view-switcher" style={{ display: "flex", height: "3.5rem", width: "100%" }}>
        <div className="buttons" style={{ position: "relative", width: "100%", justifyContent: "center" }} role="tablist" aria-label="JSON viewer mode">
          <button
            type="button"
            role="tab"
            aria-selected={currentView === "view"}
            className="button view-switcher-button"
            data-selected={currentView === "view"}
            onClick={openTreeView}
          >
            View
          </button>
          <b style={{ width: "1rem" }}></b>
          <button
            type="button"
            role="tab"
            aria-selected={currentView === "edit"}
            className="button view-switcher-button"
            data-selected={currentView === "edit"}
            onClick={() => {
              switchView("edit");
              announce("Switched to edit mode.");
            }}
          >
            Edit
          </button>
          {!isDefaultText && (
            <div style={{ visibility: "hidden", position: "absolute", bottom: 0, right: 0, whiteSpace: "nowrap", fontSize: "1rem", fontWeight: 400, color: "#18464c", opacity: 0.5 }}>
              {textSize.toLocaleString()}
              <span style={{ userSelect: "none" }}> characters</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }} aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      {renderView(currentView)}
    </div>
  );
}

export default JsonViewer;
