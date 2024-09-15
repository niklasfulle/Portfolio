"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Socials() {
  return (
    <div className="fixed right-6 top-[40%] z-10 flex flex-col items-center justify-center gap-y-4">
      <motion.div
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.3,
            duration: 0.5,
          },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        <Link
          href="https://github.com/niklasfulle"
          target="_blank"
          aria-label="Github Link"
        >
          <FaGithub className="h-7 w-7" />
        </Link>
      </motion.div>
      <motion.div
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all duration-200 ease-in dark:border-[0.2rem] dark:border-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.3,
            duration: 0.5,
          },
        }}
        whileHover={{
          scale: 1.15,
        }}
        whileTap={{
          scale: 1.05,
        }}
      >
        <Link
          href="https://www.linkedin.com/in/niklas-fulle-61b422232/"
          target="_blank"
          aria-label="LinkedIn Link"
        >
          <FaLinkedin className="h-7 w-7" />
        </Link>
      </motion.div>
    </div>
  );
}
