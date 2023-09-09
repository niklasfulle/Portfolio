"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, User } from "lucide-react";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Socials() {
  return (
    <div className="fixed right-6 top-[40%] flex flex-col items-center justify-center gap-y-3">
      <motion.div
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 shadow-2xl backdrop-blur-[0.5rem] transition-all hover:scale-[1.15] hover:cursor-pointer active:scale-105 dark:border-white dark:bg-gray-950"
        initial={{ opacity: 0, x: +200, scale: 0.1 }}
        animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.3 } }}
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
        className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 shadow-2xl backdrop-blur-[0.5rem] transition-all hover:scale-[1.15] hover:cursor-pointer active:scale-105 dark:border-white dark:bg-gray-950"
        initial={{ opacity: 0, x: +200, scale: 0.1 }}
        animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.3 } }}
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
