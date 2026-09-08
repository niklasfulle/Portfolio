"use client";
import { motion } from "framer-motion";
import { links } from "@/lib/data";
import Link from "next/link";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useLanguage } from "@/context/language-context";
import type { SectionName } from "@/lib/types";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function createLink(linkHash: string) {
  return linkHash;
}

const navigationLabels: Record<SectionName, { de: string; en: string }> = {
  Home: { de: "Startseite", en: "Home" },
  About: { de: "Über mich", en: "About" },
  Projects: { de: "Projekte", en: "Projects" },
  Skills: { de: "Fähigkeiten", en: "Skills" },
  Experience: { de: "Erfahrung", en: "Experience" },
  Contact: { de: "Kontakt", en: "Contact" },
};

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const { language } = useLanguage();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  return (
    <header className="relative">
      <motion.div
        className="fixed left-1/2 top-0 z-20 min-h-20 w-[calc(100%-1rem)] max-w-2xl rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/10 backdrop-blur-sm dark:border-black/40 dark:bg-gray-900 dark:bg-opacity-75 sm:top-6 sm:h-13 sm:min-h-0 sm:w-[calc(100%-2rem)] sm:rounded-full"
        initial={{ y: -100, x: "-50%", opacity: 0, scale: 0.5 }}
        animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
      ></motion.div>

      <nav className="fixed left-1/2 top-[0.15rem] z-20 flex min-h-12 w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 items-center justify-center px-1.5 py-1 sm:top-[1.7rem] sm:w-[calc(100%-2rem)] sm:px-1.5 sm:py-0">
        <ul className="grid w-full max-w-full grid-cols-3 items-center gap-0.5 text-[0.82rem] font-medium text-gray-500 sm:flex sm:flex-nowrap sm:justify-center sm:gap-1 sm:text-[0.84rem] md:gap-1.5 md:text-[0.9rem]">
          {links.map((link) => {
            const isActive = isHydrated && activeSection === link.name;

            return (
              <motion.li
                className="relative flex min-w-0 items-center justify-center sm:h-3/4 sm:flex-1"
                key={link.hash}
                initial={{ y: -100, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
              >
              <Link
                aria-current={isActive ? "location" : undefined}
                className={clsx(
                  "relative flex min-w-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-2 transition-colors hover:text-gray-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-white dark:hover:text-gray-300 sm:min-w-21 sm:px-3 sm:py-2 md:px-4",
                  {
                    "text-gray-950 dark:text-white": isActive,
                  }
                )}
                href={createLink(link.hash)}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                {navigationLabels[link.name][language]}

                {isActive && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-gray-300 dark:bg-gray-700"
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
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
