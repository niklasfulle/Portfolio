"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function createLink(language: string) {
  return "/?language=" + language;
}

export default function NameAnimation() {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");

  return (
    <>
      <Link href={createLink(language)}>
        <motion.div
          className="fixed left-6 top-6 z-10 hidden h-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all hover:cursor-pointer dark:border-[0.2rem] dark:border-white dark:bg-gray-900 lg:flex"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          <motion.span className="text-lg font-extrabold">N</motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.05, ease: "easeIn" },
            }}
          >
            i
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.1, ease: "easeIn" },
            }}
          >
            k
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.15, ease: "easeIn" },
            }}
          >
            l
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.2, ease: "easeIn" },
            }}
          >
            a
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.25, ease: "easeIn" },
            }}
          >
            s
          </motion.span>
          <motion.span
            className="text-lg font-extrabold"
            initial={{ marginLeft: 0 }}
            animate={{ marginLeft: 16, transition: { delay: 1 } }}
          >
            F
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.05, ease: "easeIn" },
            }}
          >
            u
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.1, ease: "easeIn" },
            }}
          >
            l
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.15, ease: "easeIn" },
            }}
          >
            l
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              scale: 0,
              visibility: "hidden",
              display: "none",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              visibility: "visible",
              display: "inline",
              transition: { delay: 1.2, ease: "easeIn" },
            }}
          >
            e
          </motion.span>
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
