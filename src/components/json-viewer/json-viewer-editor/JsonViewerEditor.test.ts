import {
  JSON_EDITOR_OPTIONS,
  JSON_VIEWER_DARK_MONACO_THEME,
  JSON_VIEWER_LIGHT_MONACO_THEME,
  configureMonacoTabFocusEscape,
  defineJsonViewerMonacoThemes,
  getMonacoTheme,
  resetMonacoHorizontalScroll,
} from "./JsonViewerEditor";

describe("JsonViewerEditor options", () => {
  test("uses performance-focused Monaco defaults", () => {
    expect(JSON_EDITOR_OPTIONS.automaticLayout).toBe(true);
    expect(JSON_EDITOR_OPTIONS.minimap).toEqual({ enabled: false });
    expect(JSON_EDITOR_OPTIONS.wordWrap).toBe("off");
    expect(JSON_EDITOR_OPTIONS.folding).toBe(false);
    expect(JSON_EDITOR_OPTIONS.fontSize).toBe(16);
    expect(JSON_EDITOR_OPTIONS.formatOnPaste).toBe(false);
    expect(JSON_EDITOR_OPTIONS.lineDecorationsWidth).toBe(14);
    expect(JSON_EDITOR_OPTIONS.lineNumbersMinChars).toBe(4);
    expect(JSON_EDITOR_OPTIONS.tabFocusMode).toBe(false);
    expect(JSON_EDITOR_OPTIONS.ariaLabel).toBe("JSON editor");
    expect(JSON_EDITOR_OPTIONS.scrollbar).toEqual(
      expect.objectContaining({
        alwaysConsumeMouseWheel: true,
        horizontalHasArrows: false,
        horizontalScrollbarSize: 8,
        useShadows: false,
        verticalHasArrows: false,
        verticalScrollbarSize: 8,
      })
    );
  });

  test("maps the app theme to a Monaco theme", () => {
    expect(getMonacoTheme("dark")).toBe(JSON_VIEWER_DARK_MONACO_THEME);
    expect(getMonacoTheme("light")).toBe(JSON_VIEWER_LIGHT_MONACO_THEME);
    expect(getMonacoTheme(undefined)).toBe(JSON_VIEWER_LIGHT_MONACO_THEME);
  });

  test("defines Monaco themes with app surface backgrounds", () => {
    const defineTheme = jest.fn();

    defineJsonViewerMonacoThemes({
      editor: { defineTheme },
    } as any);

    expect(defineTheme).toHaveBeenCalledWith(
      JSON_VIEWER_LIGHT_MONACO_THEME,
      expect.objectContaining({
        base: "vs",
        colors: expect.objectContaining({
          "editor.background": "#fdfeff",
          "editorGutter.background": "#fdfeff",
        }),
      })
    );
    expect(defineTheme).toHaveBeenCalledWith(
      JSON_VIEWER_DARK_MONACO_THEME,
      expect.objectContaining({
        base: "vs-dark",
        colors: expect.objectContaining({
          "editor.background": "#18181b",
          "editorGutter.background": "#18181b",
        }),
      })
    );
  });

  test("temporarily lets Tab move focus after Escape", () => {
    const keyHandlers: Array<(event: { browserEvent: { key: string } }) => void> =
      [];
    const blurHandlers: Array<() => void> = [];
    const editor = {
      onDidBlurEditorText: jest.fn((handler) => {
        blurHandlers.push(handler);
      }),
      onKeyDown: jest.fn((handler) => {
        keyHandlers.push(handler);
      }),
      updateOptions: jest.fn(),
    };

    configureMonacoTabFocusEscape(editor as any);

    expect(editor.updateOptions).toHaveBeenCalledWith({ tabFocusMode: false });

    keyHandlers[0]({ browserEvent: { key: "Escape" } });
    expect(editor.updateOptions).toHaveBeenLastCalledWith({
      tabFocusMode: true,
    });

    blurHandlers[0]();
    expect(editor.updateOptions).toHaveBeenLastCalledWith({
      tabFocusMode: false,
    });
  });

  test("cancels Escape Tab focus mode on non-Tab input", () => {
    const keyHandlers: Array<(event: { browserEvent: { key: string } }) => void> =
      [];
    const editor = {
      onDidBlurEditorText: jest.fn(),
      onKeyDown: jest.fn((handler) => {
        keyHandlers.push(handler);
      }),
      updateOptions: jest.fn(),
    };

    configureMonacoTabFocusEscape(editor as any);

    keyHandlers[0]({ browserEvent: { key: "Escape" } });
    keyHandlers[0]({ browserEvent: { key: "a" } });

    expect(editor.updateOptions).toHaveBeenLastCalledWith({
      tabFocusMode: false,
    });
  });

  test("resets Monaco horizontal scroll immediately and after layout settles", () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = jest.fn((callback) => {
      callback(0);
      return 1;
    });
    const editor = {
      setScrollLeft: jest.fn(),
    };

    resetMonacoHorizontalScroll(editor as any);

    expect(editor.setScrollLeft).toHaveBeenCalledTimes(2);
    expect(editor.setScrollLeft).toHaveBeenNthCalledWith(1, 0);
    expect(editor.setScrollLeft).toHaveBeenNthCalledWith(2, 0);

    window.requestAnimationFrame = originalRequestAnimationFrame;
  });
});
