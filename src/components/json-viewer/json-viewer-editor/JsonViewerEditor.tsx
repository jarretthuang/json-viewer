"use client";
import { sampleJson } from "../assets/sample";
import { createXLExampleJson } from "../assets/xlFixtures";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import LoadingOverlay from "@/components/loading-overlay/LoadingOverlay";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { OnChange, OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import "./JsonViewerEditor.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => null,
});

export type JsonViewerEditorProps = {
  currentText: string;
  isDefaultText: boolean;
  updateText: (s: string) => void;
  handleCopy: (s: string) => void;
  parseJson: (text: string) => any;
};

function LoadingEditorOverlay() {
  return <LoadingOverlay label="Loading editor" />;
}

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
    lineDecorationsWidth: 14,
    lineNumbersMinChars: 4,
    minimap: { enabled: false },
    overviewRulerBorder: false,
    renderLineHighlight: "line",
    renderValidationDecorations: "editable",
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: true,
      horizontalHasArrows: false,
      horizontalScrollbarSize: 8,
      useShadows: false,
      verticalHasArrows: false,
      verticalScrollbarSize: 8,
    },
    tabSize: 2,
    tabFocusMode: false,
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

export function getMonacoTheme(
  resolvedTheme?: string
):
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

type MonacoTabFocusEditor = Pick<
  Monaco.editor.IStandaloneCodeEditor,
  "getDomNode" | "onDidBlurEditorText" | "onKeyDown" | "updateOptions"
>;

type MonacoHorizontalScrollEditor = Pick<
  Partial<Monaco.editor.IStandaloneCodeEditor>,
  "setScrollLeft"
>;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[contenteditable='true']",
  "[tabindex]",
].join(",");

function isFocusableElement(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (
    element.hidden ||
    element.closest("[hidden]") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.tabIndex < 0
  ) {
    return false;
  }

  if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    if (element.disabled) {
      return false;
    }
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return style?.display !== "none" && style?.visibility !== "hidden";
}

function getFocusableElements(document: Document): HTMLElement[] {
  return Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    isFocusableElement
  );
}

function focusOutsideEditor(
  editorRoot: HTMLElement,
  shouldFocusPrevious: boolean
) {
  const document = editorRoot.ownerDocument;
  const focusableElements = getFocusableElements(document).filter(
    (element) => !editorRoot.contains(element)
  );

  const target = shouldFocusPrevious
    ? [...focusableElements]
        .reverse()
        .find((element) =>
          Boolean(
            editorRoot.compareDocumentPosition(element) &
              Node.DOCUMENT_POSITION_PRECEDING
          )
        ) ?? focusableElements[focusableElements.length - 1]
    : focusableElements.find((element) =>
        Boolean(
          editorRoot.compareDocumentPosition(element) &
            Node.DOCUMENT_POSITION_FOLLOWING
        )
      ) ?? focusableElements[0];

  target?.focus();
}

export function configureMonacoTabFocusEscape(
  editor: MonacoTabFocusEditor
): void {
  let isWaitingForTabExit = false;

  editor.updateOptions({ tabFocusMode: false });

  editor.onKeyDown((event) => {
    const key = event.browserEvent.key;

    if (key === "Escape") {
      isWaitingForTabExit = true;
      editor.updateOptions({ tabFocusMode: true });
      return;
    }

    if (isWaitingForTabExit && key === "Tab") {
      isWaitingForTabExit = false;
      editor.updateOptions({ tabFocusMode: false });
      event.browserEvent.preventDefault();
      event.browserEvent.stopPropagation();

      const editorRoot = editor.getDomNode();
      if (editorRoot) {
        focusOutsideEditor(editorRoot, event.browserEvent.shiftKey);
      }
      return;
    }

    if (isWaitingForTabExit && key !== "Tab") {
      isWaitingForTabExit = false;
      editor.updateOptions({ tabFocusMode: false });
    }
  });

  editor.onDidBlurEditorText(() => {
    if (!isWaitingForTabExit) {
      return;
    }

    isWaitingForTabExit = false;
    editor.updateOptions({ tabFocusMode: false });
  });
}

export function resetMonacoHorizontalScroll(
  editor: MonacoHorizontalScrollEditor | null
): void {
  if (!editor || typeof editor.setScrollLeft !== "function") {
    return;
  }

  const setScrollLeft = editor.setScrollLeft.bind(editor);

  setScrollLeft(0);

  if (
    typeof window === "undefined" ||
    typeof window.requestAnimationFrame !== "function"
  ) {
    return;
  }

  window.requestAnimationFrame(() => {
    setScrollLeft(0);
  });
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Selected file could not be read as text."));
    });

    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Selected file could not be read."));
    });

    reader.readAsText(file);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadRequestId = useRef(0);
  const latestTextRef = useRef(currentText);
  const isDefaultTextRef = useRef(isDefaultText);
  const { resolvedTheme } = useTheme();
  const [isMonacoReady, setIsMonacoReady] = useState(
    process.env.NODE_ENV === "test"
  );
  const [isEditorMounted, setIsEditorMounted] = useState(
    process.env.NODE_ENV === "test"
  );
  const [isUploadingJsonFile, setIsUploadingJsonFile] = useState(false);

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

  const updateEditorText = (text: string) => {
    activeUploadRequestId.current += 1;
    setIsUploadingJsonFile(false);
    latestTextRef.current = text;
    updateText(text);
  };

  const clearDefaultText = () => {
    if (isDefaultTextRef.current) {
      updateEditorText("");
    }
  };

  const formatJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null, 2);
      updateEditorText(formattedJsonString);
      resetMonacoHorizontalScroll(editorRef.current);
    }
  };

  const minimizeJson = (text: string) => {
    const parsedJson = parseJson(text);
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null);
      updateEditorText(formattedJsonString);
    }
  };

  const handleEditorChange: OnChange = (value) => {
    const nextText = value ?? "";
    updateEditorText(nextText);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const uploadRequestId = activeUploadRequestId.current + 1;
    activeUploadRequestId.current = uploadRequestId;
    setIsUploadingJsonFile(true);

    try {
      const fileText = await readTextFile(file);

      if (activeUploadRequestId.current !== uploadRequestId) {
        return;
      }

      latestTextRef.current = fileText;
      updateText(fileText);
      resetMonacoHorizontalScroll(editorRef.current);
    } catch {
      // Keep the current editor contents if the browser cannot read the file.
    } finally {
      if (activeUploadRequestId.current === uploadRequestId) {
        setIsUploadingJsonFile(false);
      }

      input.value = "";
    }
  };

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setIsEditorMounted(true);
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

    configureMonacoTabFocusEscape(editor);
    editor.onDidFocusEditorText(clearDefaultText);
  };

  function renderToolBar() {
    const options = [
      {
        label: "Upload",
        onClick: handleUploadClick,
        icon: <FileUploadOutlinedIcon />,
        title: "Upload a JSON file",
      },
      {
        label: "XL example",
        onClick: () => updateEditorText(createXLExampleJson()),
        icon: <DescriptionOutlinedIcon />,
        ping: isDefaultText,
        title: "Load a 2 MB JSON example",
      },
      {
        label: "Example",
        onClick: () => updateEditorText(JSON.stringify(sampleJson)),
        icon: <DataObjectOutlinedIcon />,
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
        onClick: () => updateEditorText(""),
        icon: <CleaningServicesIcon />,
      },
      {
        label: "Copy",
        onClick: () => handleCopy(getEditorText()),
        icon: <ContentCopyIcon />,
      },
      {
        label: "Paste",
        onClick: () =>
          navigator.clipboard.readText().then((text) => updateEditorText(text)),
        icon: <ContentPasteIcon />,
      },
    ];
    return <JsonViewerToolBar options={options} />;
  }

  return (
    <div className="JsonViewerEditor relative flex h-full w-full flex-col dark:bg-zinc-900 dark:text-blue-100">
      {renderToolBar()}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Upload JSON file"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileUpload}
      />
      <div className="h-[calc(100%-3rem)] w-full overflow-visible overscroll-x-contain md:h-[calc(100%-1.5rem)]">
        {isMonacoReady ? (
          <MonacoEditor
            height="100%"
            language="json"
            loading={null}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={JSON_EDITOR_OPTIONS}
            theme={getMonacoTheme(resolvedTheme)}
            value={currentText}
          />
        ) : null}
      </div>
      <div id="json-viewer-editor-help" className="sr-only" aria-live="polite">
        In the editor, Tab inserts indentation. Press Escape, then Tab, to move
        focus outside the editor.
      </div>
      {isUploadingJsonFile && <LoadingOverlay label="Loading JSON file" />}
      {(!isMonacoReady || !isEditorMounted) && <LoadingEditorOverlay />}
    </div>
  );
}

export default JsonViewerEditor;
