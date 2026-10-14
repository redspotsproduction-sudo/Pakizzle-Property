import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

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
    // Default to System as per specifications
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Sync user themePreference from Firestore on sign in
  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          try {
            const userSnap = await getDoc(doc(db, "users", currentUser.uid));
            if (userSnap.exists()) {
              const pref = userSnap.data()?.themePreference;
              if (pref === "light" || pref === "dark" || pref === "system") {
                setThemeModeState(pref);
                try {
                  localStorage.setItem("pakizzle-theme", pref);
                } catch (e) {}
              }
            }
          } catch (e) {
            // Silently fallback to current state
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {}
  }, []);

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
    root.setAttribute("data-theme", resolvedTheme);
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

  const triggerThemeTransition = useCallback(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 250);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    triggerThemeTransition();
    setThemeModeState(mode);
    try {
      localStorage.setItem("pakizzle-theme", mode);
    } catch (e) {}

    // Persist to signed-in user profile in Firestore
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        setDoc(doc(db, "users", currentUser.uid), {
          themePreference: mode,
          updatedAt: new Date().toISOString()
        }, { merge: true })
          .then(() => {
            console.log("[ThemeContext] Successfully saved themePreference to Firestore:", mode);
          })
          .catch((err) => {
            console.error("[ThemeContext] Error saving themePreference to Firestore:", err);
          });
      }
    } catch (e) {
      console.error("[ThemeContext] Unexpected error updating user theme preference:", e);
    }
  }, [triggerThemeTransition]);

  const toggleTheme = useCallback(() => {
    triggerThemeTransition();
    setThemeModeState((prev) => {
      const next = prev === "light" ? "dark" : prev === "dark" ? "system" : "light";
      try {
        localStorage.setItem("pakizzle-theme", next);
      } catch (e) {}
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          setDoc(doc(db, "users", currentUser.uid), {
            themePreference: next,
            updatedAt: new Date().toISOString()
          }, { merge: true })
            .then(() => {
              console.log("[ThemeContext] Successfully saved themePreference to Firestore on toggle:", next);
            })
            .catch((err) => {
              console.error("[ThemeContext] Error saving themePreference to Firestore on toggle:", err);
            });
        }
      } catch (e) {
        console.error("[ThemeContext] Unexpected error updating user theme preference on toggle:", e);
      }
      return next;
    });
  }, [triggerThemeTransition]);

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
