"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useCookieConsent } from "@/context/cookie-consent-context";

type Theme = "light" | "dark";

type ThemeContextValue = {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export function ThemeContextProvider({ children }: { readonly children: ReactNode }) {
  const { functionalStorageAllowed } = useCookieConsent();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let nextTheme: Theme = "light";

    if (!functionalStorageAllowed) {
      applyTheme("light");
    } else {
      const storedTheme = localStorage.getItem("theme");
      nextTheme = storedTheme === "dark" ? "dark" : "light";
      applyTheme(nextTheme);
    }

    const syncThemeState = window.setTimeout(() => setThemeState(nextTheme), 0);
    return () => window.clearTimeout(syncThemeState);
  }, [functionalStorageAllowed]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);

      if (functionalStorageAllowed) {
        localStorage.setItem("theme", nextTheme);
      }
    },
    [functionalStorageAllowed]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
}
