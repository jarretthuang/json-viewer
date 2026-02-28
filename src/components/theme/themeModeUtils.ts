export type ThemeMode = "light" | "dark" | "system";

export function getNextThemeMode(currentTheme?: string): ThemeMode {
  if (currentTheme === "light") {
    return "dark";
  }
  if (currentTheme === "dark") {
    return "system";
  }
  return "light";
}
