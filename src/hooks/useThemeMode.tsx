/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "my-tanks-theme-mode";

/**
 * Hook for managing theme mode with system preference detection
 */
export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeMode) || "system";
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Persist theme mode to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Calculate actual theme (resolve 'system')
  const isDark = useMemo(() => {
    if (themeMode === "system") return systemPrefersDark;
    return themeMode === "dark";
  }, [themeMode, systemPrefersDark]);

  // Apply dark class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  return {
    themeMode,
    setThemeMode,
    isDark,
    toggleTheme,
  };
}

/**
 * Theme Provider component that wraps the app
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useThemeMode();
  return <>{children}</>;
}
