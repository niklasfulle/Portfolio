"use client";
import { ReactNode } from "react";
import ActiveSectionContextProvider from "@/context/active-section-context";
import CookieConsentProvider from "@/context/cookie-consent-context";
import LanguageContextProvider from "@/context/language-context";
import { ThemeContextProvider } from "@/context/theme-context";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <CookieConsentProvider>
      <ThemeContextProvider>
        <LanguageContextProvider>
          <ActiveSectionContextProvider>{children}</ActiveSectionContextProvider>
        </LanguageContextProvider>
      </ThemeContextProvider>
    </CookieConsentProvider>
  );
}

export default Providers;
