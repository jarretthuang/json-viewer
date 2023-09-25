"use client";
import { sampleJson } from "../assets/sample";
import "./../assets/css/json-viewer-editor.css";
import "./JsonViewerEditor.css";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";

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
    <div className="JsonViewerEditor">
      {renderToolBar()}
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
