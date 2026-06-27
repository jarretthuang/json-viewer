import {
  JSON_EDITOR_OPTIONS,
  JSON_VIEWER_DARK_MONACO_THEME,
  JSON_VIEWER_LIGHT_MONACO_THEME,
  defineJsonViewerMonacoThemes,
  getMonacoTheme,
} from "./JsonViewerEditor";

describe("JsonViewerEditor options", () => {
  test("uses performance-focused Monaco defaults", () => {
    expect(JSON_EDITOR_OPTIONS.automaticLayout).toBe(true);
    expect(JSON_EDITOR_OPTIONS.minimap).toEqual({ enabled: false });
    expect(JSON_EDITOR_OPTIONS.wordWrap).toBe("off");
    expect(JSON_EDITOR_OPTIONS.folding).toBe(false);
    expect(JSON_EDITOR_OPTIONS.fontSize).toBe(16);
    expect(JSON_EDITOR_OPTIONS.formatOnPaste).toBe(false);
    expect(JSON_EDITOR_OPTIONS.ariaLabel).toBe("JSON editor");
    expect(JSON_EDITOR_OPTIONS.scrollbar).toEqual(
      expect.objectContaining({ alwaysConsumeMouseWheel: true })
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
});
