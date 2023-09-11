"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "./SectionHeading";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <section className="h-fit min-h-screen max-w-[45rem]">
      <div className="absolute right-1/2 top-[50rem] -z-20 h-[31.25rem] w-[21.25rem] translate-x-[-35%] rounded-full bg-[#866cb8] blur-[16rem] dark:bg-[#7d9463] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[50rem] -z-10 h-[11.25rem] w-[21.25rem] translate-x-[-50%] rounded-full bg-[#3ec750] blur-[16rem] dark:bg-[#947563] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[55rem] -z-20 h-[31.25rem] w-[21.25rem] translate-x-[35%] rounded-full bg-[#f1bbbb] blur-[16rem] dark:bg-[#946367] sm:w-[68.75rem]"></div>
      <motion.div
        ref={ref}
        className=" scroll-mt-28 text-center leading-8"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.175 }}
        id="about"
      >
        <SectionHeading>About me</SectionHeading>
        <p className="mb-3">
          After graduating with a degree in{" "}
          <span className="font-medium">Accounting</span>, I decided to pursue
          my passion for programming. I enrolled in a coding bootcamp and
          learned{" "}
          <span className="font-medium">full-stack web development</span>.{" "}
          <span className="italic">My favorite part of programming</span> is the
          problem-solving aspect. I <span className="underline">love</span> the
          feeling of finally figuring out a solution to a problem. My core stack
          is{" "}
          <span className="font-medium">
            React, Next.js, Node.js, and MongoDB
          </span>
          . I am also familiar with TypeScript and Prisma. I am always looking
          to learn new technologies. I am currently looking for a{" "}
          <span className="font-medium">full-time position</span> as a software
          developer.
        </p>

        <p>
          <span className="italic">When I&apos;m not coding</span>, I enjoy
          playing video games, watching movies, and playing with my dog. I also
          enjoy <span className="font-medium">learning new things</span>. I am
          currently learning about{" "}
          <span className="font-medium">history and philosophy</span>. I&apos;m
          also learning how to play the guitar.
        </p>
      </motion.div>
    </section>
  );
}
