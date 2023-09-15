"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

type ProjectProps = {
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string;
};

export default function ProjectEdit({
  title,
  description,
  image,
  url,
  tags,
}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);

  const tagsSplit = tags.split(",");

  return (
    <div
      ref={ref}
      className="group mb-3 rounded-lg shadow-md last:mb-0 sm:mb-8"
    >
      <section className="relative min-w-[42rem] overflow-hidden rounded-lg border border-black/5 bg-gray-100 transition dark:bg-white/10 dark:text-white  sm:h-[22rem] sm:pr-8 sm:group-even:pl-8">
        <div className="flex h-full flex-col justify-between px-5 pb-5 pt-4 sm:max-w-[50%] sm:pl-10 sm:pr-2 sm:pt-10 sm:group-even:ml-[18rem]"></div>
      </section>
    </div>
  );
}
