"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { getNextThemeMode } from "./themeModeUtils";

export default function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const tooltip =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      className="nav-icon-button"
      aria-label={`Theme: ${tooltip}. Click to change theme.`}
      title={tooltip}
      onClick={() => setTheme(getNextThemeMode(theme))}
    >
      {resolvedTheme === "dark" ? (
        <DarkModeIcon className="nav-icon" style={{ height: "75%" }} />
      ) : (
        <LightModeIcon className="nav-icon" style={{ height: "75%" }} />
      )}
      {theme === "system" && <span className="theme-auto-indicator">A</span>}
    </button>
  );
}
