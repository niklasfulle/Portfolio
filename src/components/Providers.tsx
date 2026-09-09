"use client";
import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import ActiveSectionContextProvider from "@/context/active-section-context";
import CookieConsentProvider, {
  useCookieConsent,
} from "@/context/cookie-consent-context";
import LanguageContextProvider from "@/context/language-context";

function ConsentAwareThemeProvider({ children }: { readonly children: ReactNode }) {
  const { functionalStorageAllowed } = useCookieConsent();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={functionalStorageAllowed}
      forcedTheme={functionalStorageAllowed ? undefined : "light"}
    >
      <LanguageContextProvider>
        <ActiveSectionContextProvider>{children}</ActiveSectionContextProvider>
      </LanguageContextProvider>
    </ThemeProvider>
  );
}

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <CookieConsentProvider>
      <ConsentAwareThemeProvider>{children}</ConsentAwareThemeProvider>
    </CookieConsentProvider>
  );
};

export default Providers;
