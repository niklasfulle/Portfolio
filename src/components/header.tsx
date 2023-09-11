"use client";
import React from "react";
import { motion } from "framer-motion";
import { links } from "@/lib/data";
import Link from "next/link";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

  return (
    <header className="relative">
      <div className="absolute right-1/2 top-[-15rem] -z-20 h-[41.25rem] w-[31.25rem] translate-x-[-35%] rounded-full bg-[#64cfbd] blur-[16rem] dark:bg-[#3c663d] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[-23rem] -z-10 h-[31.25rem] w-[31.25rem] translate-x-[-50%] rounded-full bg-[#bb5d5d] blur-[16rem] dark:bg-[#906394] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[-11rem] -z-20 h-[41.25rem] w-[31.25rem] translate-x-[35%] rounded-full bg-[#5bb0ff] blur-[16rem] dark:bg-[#758fc0] sm:w-[68.75rem]"></div>
      <motion.div
        className="fixed left-1/2 top-0 z-10 h-[5rem] w-full rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/[0.1] backdrop-blur-[0.5rem] dark:border-black/40 dark:bg-gray-950 dark:bg-opacity-75 sm:top-6 sm:h-[3.25rem] sm:w-[36rem] sm:rounded-full"
        initial={{ y: -100, x: "-50%", opacity: 0, scale: 0.5 }}
        animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
      ></motion.div>

      <nav className="fixed left-1/2 top-[0.15rem] z-10 flex h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-500 sm:w-[initial] sm:flex-nowrap sm:gap-5">
          {links.map((link) => (
            <motion.li
              className="relative flex h-3/4 items-center justify-center"
              key={link.hash}
              initial={{ y: -100, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
            >
              <Link
                className={clsx(
                  "flex w-full items-center justify-center rounded-full px-3 py-3 transition hover:text-gray-950 hover:underline dark:text-white dark:hover:text-gray-300",
                  {
                    "text-gray-950 dark:text-white":
                      activeSection === link.name,
                  }
                )}
                href={link.hash}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                {link.name}

                {link.name === activeSection && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-gray-200 dark:bg-gray-700"
                    layoutId="activeSection"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  ></motion.span>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
