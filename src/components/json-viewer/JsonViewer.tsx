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
        <div className="relative flex-1 overflow-hidden rounded-xl shadow-subtle dark:shadow-subtleWhite">
          <div className="absolute h-full w-full" hidden={!isInEditView}>
            <JsonViewerEditor
              currentText={currentText}
              isDefaultText={isDefaultText}
              updateText={handleUpdateText}
              handleCopy={handleCopy}
              parseJson={parseJson}
            />
          </div>
          <div className="absolute h-full w-full" hidden={isInEditView}>
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
    <div className="JsonViewer flex w-full flex-1 flex-col bg-powderBlue-50 px-2 pb-2 dark:bg-neutral-950">
      <div className="view-switcher flex h-14 w-full md:h-8">
        <div className="buttons relative w-full justify-center" role="tablist" aria-label="JSON viewer mode">
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
          <b className="w-4"></b>
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
            <div className="invisible absolute bottom-0 right-0 whitespace-nowrap text-base font-normal text-powderBlue-600 opacity-50 dark:text-slate-200 md:visible md:text-xs">
              {textSize.toLocaleString()}
              <span className="select-none"> characters</span>
            </div>
          )}
        </div>
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      {renderView(currentView)}
    </div>
  );
}

export default JsonViewer;
