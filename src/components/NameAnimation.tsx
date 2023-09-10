"use client";
import React from "react";
import { motion } from "framer-motion";

export default function NameAnimation() {
  return (
    <motion.div
      className="fixed left-6 top-6 flex h-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-2xl backdrop-blur-[0.5rem] transition-all  dark:border-white dark:bg-gray-950"
      initial={{ opacity: 0, scale: 1 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
    >
      <span>
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
            transition: { delay: 1.05 },
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
            transition: { delay: 1.1 },
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
            transition: { delay: 1.15 },
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
            transition: { delay: 1.2 },
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
            transition: { delay: 1.25 },
          }}
        >
          s
        </motion.span>
        <motion.span
          className="text-lg font-extrabold "
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
            transition: { delay: 1.05 },
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
            transition: { delay: 1.1 },
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
            transition: { delay: 1.15 },
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
            transition: { delay: 1.2 },
          }}
        >
          e
        </motion.span>
      </span>
    </motion.div>
  );
}
