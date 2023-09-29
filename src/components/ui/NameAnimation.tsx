"use client";
import React from "react";

import Link from "next/link";

export default function NameAnimation() {
  return (
    <>
      <div className="fixed left-6 top-6 z-10 hidden h-[3.25rem]  items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all hover:cursor-pointer dark:border-[0.2rem] dark:border-white dark:bg-gray-900 lg:flex">
        <Link href="/">
          <span className="text-lg font-extrabold">N</span>
          <span>i</span>
          <span>k</span>
          <span>l</span>
          <span>a</span>
          <span>s</span>
          <span className="text-lg font-extrabold ">F</span>
          <span>u</span>
          <span>l</span>
          <span>l</span>
          <span>e</span>
        </Link>
      </div>
      <div className="fixed left-6 top-6 z-10 hidden h-[3.25rem]  items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 px-6 shadow-md transition-all hover:cursor-pointer dark:border-[0.2rem] dark:border-white dark:bg-gray-900 md:flex lg:hidden">
        <Link href="/">
          <span className="text-lg font-extrabold">N</span>
          <span className="text-lg font-extrabold ">F</span>
        </Link>
      </div>
    </>
  );
}
