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
      className="fixed bottom-6 right-6 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-black/40 dark:bg-gray-950"
      onClick={toggleTheme}
      initial={{ opacity: 0, x: +200 }}
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
  );
}
