"use client";
import { sampleJson } from "../assets/sample";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useState, useEffect, useRef } from "react";
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
  const [allowTabFocusExit, setAllowTabFocusExit] = useState(false);
  const TEXT_AREA_ELEMENT_ID = "json-viewer-editor-textarea";
  const TEXT_AREA_HELP_ID = "json-viewer-editor-help";
  const textareaElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!textareaElementRef.current) {
      textareaElementRef.current = document?.getElementById(TEXT_AREA_ELEMENT_ID);
    }

    const textareaElement = textareaElementRef.current;
    if (textareaElement) {
      textareaElement.setAttribute("aria-label", "JSON editor");
      textareaElement.setAttribute("aria-describedby", TEXT_AREA_HELP_ID);
      textareaElement.setAttribute("spellcheck", "false");
    }
  });

  useEffect(() => {
    const textareaElement = textareaElementRef.current;
    if (!textareaElement) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAllowTabFocusExit(true);
      } else if (allowTabFocusExit && e.key !== "Tab") {
        setAllowTabFocusExit(false);
      }
    };

    const onBlur = () => {
      setAllowTabFocusExit(false);
    };

    textareaElement.addEventListener("keydown", onKeyDown);
    textareaElement.addEventListener("blur", onBlur);

    return () => {
      textareaElement.removeEventListener("keydown", onKeyDown);
      textareaElement.removeEventListener("blur", onBlur);
    };
  }, [allowTabFocusExit]);

  const updateLineNumbers = () => {
    const textareaElement = textareaElementRef.current;
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
    if (textareaElementRef.current) {
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
        label: "Example",
        onClick: () => updateText(JSON.stringify(sampleJson)),
        icon: <DescriptionOutlinedIcon />,
        ping: isDefaultText,
      },
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
    ];
    return <JsonViewerToolBar options={options} />;
  }

  return (
    <div className="JsonViewerEditor flex h-full w-full flex-col dark:bg-zinc-900 dark:text-blue-100">
      {renderToolBar()}
      <div className="flex h-[calc(100%-3.5rem)] w-full flex-row overflow-y-auto py-2 pl-1 pr-2 font-mono text-[1.1rem] md:h-[calc(100%-2rem)] md:text-[1.05rem]">
        <div className="select-none px-1 text-end font-bold text-powderBlue-400 dark:text-zinc-500 [&>*]:select-text">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <Editor
          textareaId={TEXT_AREA_ELEMENT_ID}
          className="editor h-fit grow resize-none overflow-hidden whitespace-pre-wrap bg-transparent px-1 [&>textarea]:outline-none"
          value={currentText}
          onValueChange={(code) => updateText(code)}
          highlight={(code) => highlight(code, languages.js)}
          onClick={clearDefaultText}
          ignoreTabKey={allowTabFocusExit}
        />
      </div>
      <div id={TEXT_AREA_HELP_ID} className="sr-only" aria-live="polite">
        In the editor, Tab inserts indentation. Press Escape, then Tab, to move focus outside the editor.
      </div>
    </div>
  );
}

export default JsonViewerEditor;
