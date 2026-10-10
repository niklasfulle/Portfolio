"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let nextTheme: Theme = "light";

    if (functionalStorageAllowed) {
      const storedTheme = localStorage.getItem("theme");
      nextTheme = storedTheme === "dark" ? "dark" : "light";
    }
    applyTheme(nextTheme);

    const syncThemeState = globalThis.setTimeout(() => setTheme(nextTheme), 0);
    return () => globalThis.clearTimeout(syncThemeState);
  }, [functionalStorageAllowed]);

  const updateTheme = useCallback(
    (nextTheme: Theme) => {
      setTheme(nextTheme);
      applyTheme(nextTheme);

      if (functionalStorageAllowed) {
        localStorage.setItem("theme", nextTheme);
      }
    },
    [functionalStorageAllowed]
  );

  const value = useMemo(() => ({ theme, setTheme: updateTheme }), [theme, updateTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
}
