"use client";
import { motion } from "framer-motion";
import Link from "next/link";

type NameCharacter = {
  readonly character: string;
  readonly delay: number;
  readonly emphasized?: boolean;
  readonly initialVisible?: boolean;
  readonly marginLeft?: number;
};

const nameCharacters: readonly NameCharacter[] = [
  { character: "N", delay: 0, emphasized: true, initialVisible: true },
  ...Array.from("iklas", (character, index) => ({
    character,
    delay: 1.05 + index * 0.05,
  })),
  { character: "F", delay: 1, emphasized: true, initialVisible: true, marginLeft: 16 },
  ...Array.from("ulle", (character, index) => ({
    character,
    delay: 1.05 + index * 0.05,
  })),
];

export default function NameAnimation() {
  return (
    <>
      <Link aria-label="Niklas Fulle – Startseite" href="/#home">
        <motion.div
          className="fixed left-6 top-6 z-10 hidden h-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all hover:cursor-pointer dark:border-[0.2rem] dark:border-white dark:bg-gray-900 lg:flex"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          {nameCharacters.map((item, index) => (
            <motion.span
              className={item.emphasized ? "text-lg font-extrabold" : undefined}
              initial={
                item.initialVisible
                  ? { marginLeft: 0 }
                  : { opacity: 0, scale: 0, visibility: "hidden", display: "none" }
              }
              animate={{
                opacity: 1,
                scale: 1,
                visibility: "visible",
                display: "inline",
                marginLeft: item.marginLeft ?? 0,
                transition: { delay: item.delay, ease: "easeIn" },
              }}
              key={`${item.character}-${index}`}
            >
              {item.character}
            </motion.span>
          ))}
        </motion.div>
      </Link>
      <motion.div
        className="fixed left-6 top-6 z-10 hidden h-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all hover:cursor-pointer dark:border-[0.2rem] dark:border-white dark:bg-gray-900 md:flex lg:hidden"
        initial={{ opacity: 0, scale: 1 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        <Link href="/">
          <span className="text-lg font-extrabold">N</span>
          <span className="text-lg font-extrabold">F</span>
        </Link>
      </motion.div>
    </>
  );
}
