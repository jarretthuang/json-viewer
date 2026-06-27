"use client";
import { sampleJson } from "../assets/sample";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { OnChange, OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="p-3 text-sm">Loading editor...</div>,
});

export type JsonViewerEditorProps = {
  currentText: string;
  isDefaultText: boolean;
  updateText: (s: string) => void;
  handleCopy: (s: string) => void;
  parseJson: (text: string) => any;
};

export const JSON_EDITOR_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions =
  {
    automaticLayout: true,
    ariaLabel: "JSON editor",
    codeLens: false,
    contextmenu: true,
    folding: false,
    fontSize: 16,
    formatOnPaste: false,
    formatOnType: false,
    glyphMargin: false,
    hideCursorInOverviewRuler: true,
    lineDecorationsWidth: 8,
    lineNumbersMinChars: 4,
    minimap: { enabled: false },
    overviewRulerBorder: false,
    renderLineHighlight: "line",
    renderValidationDecorations: "editable",
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: true,
      horizontalScrollbarSize: 10,
      verticalScrollbarSize: 10,
    },
    tabSize: 2,
    wordWrap: "off",
    wrappingIndent: "none",
  };

export const JSON_VIEWER_LIGHT_MONACO_THEME = "json-viewer-light";
export const JSON_VIEWER_DARK_MONACO_THEME = "json-viewer-dark";

type MonacoThemeApi = {
  editor: {
    defineTheme: (
      themeName: string,
      themeData: Monaco.editor.IStandaloneThemeData
    ) => void;
    setTheme: (themeName: string) => void;
  };
};

export function getMonacoTheme(resolvedTheme?: string):
  | typeof JSON_VIEWER_LIGHT_MONACO_THEME
  | typeof JSON_VIEWER_DARK_MONACO_THEME {
  return resolvedTheme === "dark"
    ? JSON_VIEWER_DARK_MONACO_THEME
    : JSON_VIEWER_LIGHT_MONACO_THEME;
}

export function defineJsonViewerMonacoThemes(
  monacoInstance: MonacoThemeApi
): void {
  monacoInstance.editor.defineTheme(JSON_VIEWER_LIGHT_MONACO_THEME, {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#fdfeff",
      "editorGutter.background": "#fdfeff",
      "editorLineNumber.foreground": "#318e99",
      "editorLineNumber.activeForeground": "#18464c",
      "editor.lineHighlightBackground": "#b0e0e61f",
      "editor.selectionBackground": "#63c2cd4d",
      "editor.inactiveSelectionBackground": "#63c2cd26",
    },
  });

  monacoInstance.editor.defineTheme(JSON_VIEWER_DARK_MONACO_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#18181b",
      "editorGutter.background": "#18181b",
      "editorLineNumber.foreground": "#71717a",
      "editorLineNumber.activeForeground": "#fafafa",
      "editor.lineHighlightBackground": "#ffffff0a",
      "editor.selectionBackground": "#63c2cd4d",
      "editor.inactiveSelectionBackground": "#63c2cd26",
    },
  });
}

function JsonViewerEditor({
  currentText,
  isDefaultText,
  updateText,
  handleCopy,
  parseJson,
}: JsonViewerEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<MonacoThemeApi | null>(null);
  const latestTextRef = useRef(currentText);
  const isDefaultTextRef = useRef(isDefaultText);
  const { resolvedTheme } = useTheme();
  const [isMonacoReady, setIsMonacoReady] = useState(
    process.env.NODE_ENV === "test"
  );

  useEffect(() => {
    latestTextRef.current = currentText;
    isDefaultTextRef.current = isDefaultText;

    const editor = editorRef.current;
    const model = editor?.getModel();
    if (model && model.getValue() !== currentText) {
      model.setValue(currentText);
    }
  }, [currentText, isDefaultText]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    let isMounted = true;

    Promise.all([import("@monaco-editor/react"), import("monaco-editor")]).then(
      ([monacoReact, monacoInstance]) => {
        monacoReact.loader.config({ monaco: monacoInstance });
        defineJsonViewerMonacoThemes(monacoInstance);
        if (isMounted) {
          setIsMonacoReady(true);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(getMonacoTheme(resolvedTheme));
  }, [resolvedTheme]);

  const getEditorText = () =>
    editorRef.current?.getValue() ?? latestTextRef.current;

  const clearDefaultText = () => {
    if (isDefaultTextRef.current) {
      latestTextRef.current = "";
      updateText("");
    }
  };

  const formatJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null, 2);
      latestTextRef.current = formattedJsonString;
      updateText(formattedJsonString);
    }
  };

  const minimizeJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null);
      latestTextRef.current = formattedJsonString;
      updateText(formattedJsonString);
    }
  };

  const handleEditorChange: OnChange = (value) => {
    const nextText = value ?? "";
    latestTextRef.current = nextText;
    updateText(nextText);
  };

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    defineJsonViewerMonacoThemes(monacoInstance);
    monacoInstance.editor.setTheme(getMonacoTheme(resolvedTheme));

    const jsonLanguage = monacoInstance.languages.json as unknown as {
      jsonDefaults?: {
        setDiagnosticsOptions: (options: {
          allowComments: boolean;
          enableSchemaRequest: boolean;
          validate: boolean;
        }) => void;
      };
    };

    jsonLanguage.jsonDefaults?.setDiagnosticsOptions({
      allowComments: true,
      enableSchemaRequest: false,
      validate: true,
    });

    editor.onDidFocusEditorText(clearDefaultText);
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
        onClick: () => handleCopy(getEditorText()),
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
        onClick: () => formatJson(getEditorText()),
        icon: <FormatAlignRightIcon />,
      },
      {
        label: "Minimize",
        onClick: () => minimizeJson(getEditorText()),
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
      <div className="h-[calc(100%-3rem)] w-full overflow-hidden overscroll-x-contain md:h-[calc(100%-1.5rem)]">
        {isMonacoReady ? (
          <MonacoEditor
            height="100%"
            language="json"
            loading="Loading editor..."
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={JSON_EDITOR_OPTIONS}
            theme={getMonacoTheme(resolvedTheme)}
            value={currentText}
          />
        ) : (
          <div className="p-3 text-sm">Loading editor...</div>
        )}
      </div>
      <div id="json-viewer-editor-help" className="sr-only" aria-live="polite">
        In the editor, Tab inserts indentation. Press Escape, then Tab, to move focus outside the editor.
      </div>
    </div>
  );
}

export default JsonViewerEditor;
