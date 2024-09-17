"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DE, US } from "country-flag-icons/react/3x2";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { CgMenuGridR } from "react-icons/cg";
import { IoClose } from "react-icons/io5";

export default function MobileMenu() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [MobileMenu, setMobileMenu] = useState(false);
  const [language, setLanguage] = useState(search ?? "de");

  const toggleMobileMenu = () => {
    setMobileMenu(!MobileMenu);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const toggleLanguage = () => {
    let url = window.location.href;
    if (url != undefined) {
      let newUrl = "";
      let urlSplit: string[] = url.split("?");
      let hook = "";
      if (urlSplit.length == 2) {
        let urlSplit2 = urlSplit[1].split("#");
        newUrl = urlSplit[0];
        hook = urlSplit2[1];
        if (hook == undefined) {
          hook = "";
        } else {
          hook = "#" + hook;
        }
      } else if (urlSplit.length == 1) {
        let urlSplit2 = url.split("#");
        newUrl = urlSplit2[0];
        hook = urlSplit2[1];
        if (hook == undefined) {
          hook = "";
        } else {
          hook = "#" + hook;
        }
      }

      if (language === "de") {
        setLanguage("en");
        window.location.href = newUrl + "?language=en" + hook;
      } else {
        setLanguage("de");
        window.location.href = newUrl + "?language=de" + hook;
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-3 flex flex-col items-center justify-center gap-y-4 md:hidden">
        <motion.button
          aria-label="Toggle Theme"
          className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
          onClick={toggleMobileMenu}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { delay: 0.5, duration: 0.5 },
          }}
        >
          {MobileMenu ? (
            <IoClose className="absolute block h-8 w-8 text-black dark:text-white" />
          ) : (
            <CgMenuGridR className="absolute block h-7 w-7 text-black dark:text-white" />
          )}
        </motion.button>
      </div>
      {MobileMenu && (
        <div className="fixed bottom-[16.5rem] right-3 flex flex-col items-center justify-center gap-y-4 md:hidden">
          <motion.button
            aria-label="Toggle Theme"
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.5 },
            }}
          >
            <Link
              href="https://github.com/niklasfulle"
              target="_blank"
              aria-label="Github Link"
            >
              <FaGithub className="h-7 w-7 dark:text-white" />
            </Link>
          </motion.button>
        </div>
      )}
      {MobileMenu && (
        <div className="fixed bottom-[12.75rem] right-3 flex flex-col items-center justify-center gap-y-4 md:hidden">
          <motion.button
            aria-label="Toggle Theme"
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.4 },
            }}
          >
            <Link
              href="https://www.linkedin.com/in/niklas-fulle-61b422232/"
              target="_blank"
              aria-label="LinkedIn Link"
            >
              <FaLinkedin className="h-7 w-7 dark:text-white" />
            </Link>
          </motion.button>
        </div>
      )}
      {MobileMenu && (
        <div className="fixed bottom-[9rem] right-3 flex flex-col items-center justify-center gap-y-4 md:hidden">
          <motion.button
            aria-label="Toggle Theme"
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
            onClick={toggleLanguage}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.3 },
            }}
          >
            {language === "de" ? (
              <DE title="Deutschland" className="absolute h-7 w-7" />
            ) : (
              <US title="United States" className="absolute h-7 w-7" />
            )}
          </motion.button>
        </div>
      )}
      {MobileMenu && (
        <div className="fixed bottom-[5.25rem] right-3 flex flex-col items-center justify-center gap-y-4 md:hidden">
          <motion.button
            aria-label="Toggle Theme"
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white px-6 text-black shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
            onClick={toggleTheme}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.2 },
            }}
          >
            <Sun className="absolute rotate-0 scale-0 transition-all hover:text-slate-900 dark:scale-90 dark:text-white" />
            <Moon className="rotate-80 absolute scale-90 transition-all hover:text-slate-900 dark:scale-0 dark:text-white" />
          </motion.button>
        </div>
      )}
    </>
  );
}
