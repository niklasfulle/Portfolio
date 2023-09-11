"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Socials() {
  return (
    <div className="fixed right-6 top-[40%] flex flex-col items-center justify-center gap-y-4">
      <motion.div
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all duration-200 ease-in dark:border-black/40 dark:bg-gray-950"
        initial={{ opacity: 0, x: +200 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.3,
          },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        <Link href="/">
          <FaGithub className="h-7 w-7" />
        </Link>
      </motion.div>
      <motion.div
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all duration-200 ease-in dark:border-black/40 dark:bg-gray-950"
        initial={{ opacity: 0, x: +200 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.3,
          },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        <Link href="/">
          <FaLinkedin className="h-7 w-7" />
        </Link>
      </motion.div>
    </div>
  );
}
