"use client";
import { sampleJson } from "../assets/sample";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { useState, useEffect } from "react";
import _ from "lodash";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "./prism-theme.css";

export type JsonViewerEditorProps = {
  currentText: string;
  isDefaultText: boolean;
  updateText: (s: string) => void;
  handleCopy: (s: string) => void;
  parseJson: (text: string) => any;
};

function JsonViewerEditor({
  currentText,
  isDefaultText,
  updateText,
  handleCopy,
  parseJson,
}: JsonViewerEditorProps) {
  const [lines, setLines] = useState<number[]>([]);
  const TEXT_AREA_ELEMENT_ID = "json-viewer-editor-textarea";
  let textareaElement: HTMLElement | null = null;

  useEffect(() => {
    if (!textareaElement) {
      textareaElement = document?.getElementById(TEXT_AREA_ELEMENT_ID);
    }
  });

  const updateLineNumbers = () => {
    if (textareaElement) {
      const height: number = textareaElement.offsetHeight ?? 0;
      const lineHeight: number =
        _.toNumber(
          getComputedStyle(textareaElement)?.lineHeight?.slice(0, -2)
        ) ?? 1;
      const numberOfLines: number = Math.ceil(height / lineHeight);
      const lines = Array.from(
        { length: numberOfLines },
        (_, index) => index + 1
      );
      setLines(lines);
    }
  };

  useEffect(() => {
    if (textareaElement) {
      updateLineNumbers();
    }
    window.addEventListener("resize", updateLineNumbers);
    return () => {
      window.removeEventListener("resize", updateLineNumbers);
    };
  }, [currentText]);

  const clearDefaultText = () => {
    if (isDefaultText) {
      updateText("");
    }
  };

  const formatJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null, 2);
      updateText(formattedJsonString);
    }
  };

  const minimizeJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null);
      updateText(formattedJsonString);
    }
  };

  function renderToolBar() {
    const options = [
      {
        label: "Copy",
        onClick: () => handleCopy(currentText),
        icon: <ContentCopyIcon />,
      },
      {
        label: "Paste",
        onClick: () =>
          navigator.clipboard.readText().then((text) => updateText(text)),
        icon: <ContentPasteIcon />,
      },
      {
        label: "Format",
        onClick: () => formatJson(currentText),
        icon: <FormatAlignRightIcon />,
      },
      {
        label: "Minimize",
        onClick: () => minimizeJson(currentText),
        icon: <MinimizeIcon />,
      },
      {
        label: "Clear",
        onClick: () => updateText(""),
        icon: <CleaningServicesIcon />,
      },
      {
        label: "Example",
        onClick: () => updateText(JSON.stringify(sampleJson)),
        icon: <TextSnippetIcon />,
      },
    ];
    return <JsonViewerToolBar options={options} />;
  }

  return (
    <div className="JsonViewerEditor h-full w-full dark:bg-zinc-900 dark:text-blue-100">
      {renderToolBar()}
      <div className="flex h-[calc(100%-3rem)] w-full flex-row overflow-y-auto p-2 font-mono text-[1rem] md:h-[calc(100%-1.5rem)] md:text-[2vmin]">
        <div className="line-numbers px-1 font-bold text-powderBlue-400 dark:text-zinc-500">
          {lines.map((line) => (
            <div key={line} className="line-number">
              {line}
            </div>
          ))}
        </div>
        <Editor
          textareaId={TEXT_AREA_ELEMENT_ID}
          className="editor h-fit grow resize-none overflow-hidden whitespace-pre-wrap bg-transparent px-1 [&>textarea]:outline-none"
          value={currentText}
          onValueChange={(code) => updateText(code)}
          highlight={(code) => highlight(code, languages.js)}
          onClick={clearDefaultText}
        />
      </div>
    </div>
  );
}

export default JsonViewerEditor;
