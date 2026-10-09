import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;
  theme: ResolvedTheme; // Backwards-compatibility
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem("pakizzle-theme") || localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved as ThemeMode;
      }
    } catch (e) {}
    // Default to System as per Part 7 specifications
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Listen to system color-scheme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const resolvedTheme: ResolvedTheme = themeMode === "system" ? systemTheme : themeMode;

  // Apply theme to DOM and meta tags
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    // Set mobile browser bar / theme-color meta tag
    // (#FAF3E6 for brand cream light mode, #000000 for true black dark mode)
    let meta = document.getElementById("theme-color-meta") as HTMLMetaElement | null;
    if (!meta) {
      meta = document.querySelector('meta[name="theme-color"]');
    }
    if (meta) {
      meta.setAttribute("content", resolvedTheme === "dark" ? "#000000" : "#FAF3E6");
    }

    try {
      localStorage.setItem("pakizzle-theme", themeMode);
      localStorage.setItem("theme", resolvedTheme);
    } catch (e) {}
  }, [themeMode, resolvedTheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("pakizzle-theme", mode);
    } catch (e) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        resolvedTheme,
        theme: resolvedTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
