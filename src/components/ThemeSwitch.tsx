"use client";

import { useTheme } from "next-themes";
import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <motion.button
      className="fixed bottom-6 right-6 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 shadow-2xl backdrop-blur-[0.5rem] transition-all hover:scale-[1.15] hover:cursor-pointer active:scale-105 dark:border-white dark:bg-gray-950"
      onClick={toggleTheme}
      initial={{ opacity: 0, x: +200, scale: 0.1 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.5 } }}
      whileHover={{
        scale: 1.15,
      }}
      whileTap={{
        scale: 1.05,
      }}
    >
      <Sun className="rotate-0 scale-90 transition-all hover:text-slate-900 dark:-rotate-90 dark:scale-0 dark:text-slate-200 dark:hover:text-white" />
      <Moon className="rotate-80 absolute scale-0 transition-all hover:text-slate-900 dark:rotate-0 dark:scale-90 dark:text-slate-200 dark:hover:text-white" />
    </motion.button>
  );
}
