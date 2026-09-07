"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";

export type Language = "de" | "en";

type LanguageContextType = {
  readonly language: Language;
  readonly toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function normalizeLanguage(value: string | null): Language {
  return value === "en" ? "en" : "de";
}

export default function LanguageContextProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const routeLanguage = normalizeLanguage(searchParams.get("language"));
  const [language, setLanguage] = useState<Language>(routeLanguage);

  const toggleLanguage = useCallback(() => {
    const nextLanguage = language === "de" ? "en" : "de";
    const nextUrl = new URL(globalThis.location.href);

    setLanguage(nextLanguage);
    nextUrl.searchParams.set("language", nextLanguage);
    globalThis.history.replaceState(
      globalThis.history.state,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );
  }, [language]);

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
