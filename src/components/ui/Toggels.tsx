"use client";
import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DE as GermanFlag, US as UnitedStatesFlag } from "country-flag-icons/react/3x2";
import { useLanguage } from "@/context/language-context";
import { useCookieConsent } from "@/context/cookie-consent-context";

export default function Toggels() {
  const { setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { functionalStorageAllowed, openPreferences } = useCookieConsent();

  const toggleTheme = () => {
    if (!functionalStorageAllowed) {
      openPreferences();
      return;
    }

    const isDark = globalThis.document.documentElement.classList.contains("dark");

    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-center justify-center gap-y-4">
        <motion.button
          aria-label={language === "de" ? "Sprache wechseln" : "Change language"}
        className="hidden h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900 md:flex"
        onClick={toggleLanguage}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { delay: 0.5, duration: 0.5 },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        {language === "de" ? (
          <GermanFlag title="Deutschland" className="h-7 w-7" />
        ) : (
          <UnitedStatesFlag title="United States" className="h-7 w-7" />
        )}
      </motion.button>
      <motion.button
        aria-label={
          functionalStorageAllowed
            ? language === "de"
              ? "Darstellung wechseln"
              : "Change theme"
            : language === "de"
              ? "Cookie-Einstellungen öffnen"
              : "Open cookie preferences"
        }
        className="hidden h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900 md:flex"
        onClick={toggleTheme}
        title={
          functionalStorageAllowed
            ? undefined
            : language === "de"
              ? "Cookie-Einstellungen öffnen"
              : "Open cookie preferences"
        }
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { delay: 0.5, duration: 0.5 },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        <Sun className="absolute rotate-0 scale-0 transition-all hover:text-slate-900 dark:scale-90 dark:text-white" />
        <Moon className="rotate-80 absolute scale-90 transition-all hover:text-slate-900 dark:scale-0 dark:text-white" />
      </motion.button>
    </div>
  );
}
