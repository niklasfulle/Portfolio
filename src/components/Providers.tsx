"use client";
import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import ActiveSectionContextProvider from "@/context/active-section-context";
import LanguageContextProvider from "@/context/language-context";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageContextProvider>
        <ActiveSectionContextProvider>{children}</ActiveSectionContextProvider>
      </LanguageContextProvider>
    </ThemeProvider>
  );
};

export default Providers;
