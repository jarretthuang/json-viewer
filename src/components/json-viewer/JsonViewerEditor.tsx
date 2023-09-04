"use client";
import { sampleJson } from "./assets/sample";
import "./assets/css/json-viewer-editor.css";
import "./JsonViewerEditor.css";

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

  return (
    <div className="JsonViewerEditor">
      <div className="tool-bar">
        <div
          className="tool-bar-button"
          onClick={() => handleCopy(currentText)}
        >
          Copy
        </div>
        <div
          className="tool-bar-button"
          onClick={() =>
            navigator.clipboard.readText().then((text) => updateText(text))
          }
        >
          Paste
        </div>
        <div
          className="tool-bar-button"
          onClick={() => formatJson(currentText)}
        >
          Format
        </div>
        <div
          className="tool-bar-button"
          onClick={() => minimizeJson(currentText)}
        >
          Minimize
        </div>
        <div className="tool-bar-button" onClick={() => updateText("")}>
          Clear
        </div>
        <div
          className="tool-bar-button"
          onClick={() => updateText(JSON.stringify(sampleJson))}
        >
          Example
        </div>
      </div>
      <textarea
        className="main-textarea"
        value={currentText}
        onClick={clearDefaultText}
        onChange={(e) => updateText(e.target.value)}
      ></textarea>
    </div>
  );
}

export default JsonViewerEditor;
