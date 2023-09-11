"use client";
import React, { FC } from "react";
import { motion } from "framer-motion";
import { User2 } from "lucide-react";
import Link from "next/link";

interface Props {
  session?: any;
}

export const UserButton: FC<Props> = ({ session }) => {
  console.log(session);
  return (
    <motion.div
      className="fixed right-6 top-6 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all duration-200 ease-in dark:border-black/40 dark:bg-gray-950"
      initial={{ opacity: 0, x: +200 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
      whileHover={{
        scale: 1.15,
      }}
      whileTap={{
        scale: 1.05,
      }}
    >
      <Link href="/login">
        <User2 className="h-7 w-7 hover:text-slate-900 dark:rotate-0 dark:scale-90 dark:text-slate-200 dark:hover:text-white" />
      </Link>
    </motion.div>
  );
};
