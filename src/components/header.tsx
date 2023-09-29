"use client";
import React from "react";
import { links } from "@/lib/data";
import Link from "next/link";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";

export default function Header() {
  const { activeSection } = useActiveSectionContext();

  return (
    <header className="relative">
      <div className="fixed left-1/2 top-0 z-20 h-[5rem] w-full translate-x-[-50%] rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/[0.1] backdrop-blur-[0.5rem] dark:border-black/40 dark:bg-gray-900 dark:bg-opacity-75 sm:top-6 sm:h-[3.25rem] sm:w-[36rem] sm:rounded-full"></div>

      <nav className="fixed left-1/2 top-[0.15rem] z-20 flex h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-500 sm:w-[initial] sm:flex-nowrap sm:gap-5">
          {links.map((link) => (
            <li
              className="relative flex h-3/4 items-center justify-center"
              key={link.hash}
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
                  //setActiveSection(link.name);
                  //setTimeOfLastClick(Date.now());
                }}
              >
                {link.name}

                {link.name === activeSection && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
