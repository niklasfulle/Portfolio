"use client";
import React, { useRef } from "react";
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

export default function Project({
  title,
  description,
  image,
  url,
  tags,
}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  const tagsSplit = tags.split(",");

  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className="group mb-3 rounded-lg shadow-md last:mb-0 sm:mb-8"
    >
      <section className="relative w-[42rem] overflow-hidden rounded-lg border border-black/5 bg-gray-100 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:h-[22rem] sm:pr-8 sm:group-even:pl-8">
        <div className="flex h-full flex-col justify-between px-5 pb-5 pt-4 sm:max-w-[50%] sm:pl-6 sm:pr-2 sm:pt-8 sm:group-even:ml-[18rem]">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="my-2 leading-relaxed text-gray-700 dark:text-white/70">
              {description}
            </p>

            <ul className=" flex flex-wrap gap-2 sm:mt-auto">
              {tagsSplit.map((tag, index) => (
                <li
                  className="rounded-full bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white dark:text-white/70"
                  key={index}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={url}
            target="_blank"
            className="flex w-fit flex-row items-center justify-center rounded-md bg-[#010409] px-3 py-2 text-[0.7rem] uppercase tracking-wider text-white hover:cursor-pointer hover:bg-[#010409]/[0.8] dark:text-white/70"
          >
            <FaGithub className="mr-2 h-4 w-4" />
            Github
          </Link>
        </div>

        <Image
          src={image}
          alt="Project I worked on"
          width="500"
          height="500"
          quality="95"
          priority
          className="absolute -right-40 top-6 hidden w-[28.25rem] rounded-lg shadow-2xl transition
        group-even:-left-40 
        group-even:right-[initial]
        group-hover:-translate-x-3
        group-hover:translate-y-3
        group-hover:-rotate-2

        group-hover:scale-[1.04]
        group-even:group-hover:translate-x-3
        group-even:group-hover:translate-y-3

        group-even:group-hover:rotate-2 sm:block"
        />
      </section>
    </motion.div>
  );
}
