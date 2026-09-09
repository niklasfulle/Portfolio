"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Language = "de" | "en";

type LanguageContextType = {
  readonly language: Language;
  readonly toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export default function LanguageContextProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("de");

  useEffect(() => {
    const currentUrl = new URL(globalThis.location.href);

    if (!currentUrl.searchParams.has("language")) {
      return;
    }

    currentUrl.searchParams.delete("language");
    globalThis.history.replaceState(
      globalThis.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    );
  }, []);

  useEffect(() => {
    globalThis.document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) =>
      currentLanguage === "de" ? "en" : "de"
    );
  }, []);

  const contextValue = useMemo(
    () => ({ language, toggleLanguage }),
    [language, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageContextProvider");
  }

  return context;
}
