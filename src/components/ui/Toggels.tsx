"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DE, US } from "country-flag-icons/react/3x2";

export default function Toggels() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("de");

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const toggleLanguage = () => {
    if (language === "de") {
      setLanguage("en");
    } else {
      setLanguage("de");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-center justify-center gap-y-4">
      <motion.button
        aria-label="Toggle Language"
        className=" flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
        onClick={toggleLanguage}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { delay: 0.5 },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        {language === "de" ? (
          <DE title="Deutschland" className="h-7 w-7" />
        ) : (
          <US title="United States" className="h-7 w-7" />
        )}
      </motion.button>
      <motion.button
        aria-label="Toggle Theme"
        className=" flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
        onClick={toggleTheme}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { delay: 0.5 },
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
