"use client";
import React from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/ui/Button";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <section className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white">
      <Button className="absolute right-2 top-2 bg-gray-800 px-10 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400">
        Edit
      </Button>
      <div
        ref={ref}
        className="max-w-[45rem] scroll-mt-28 text-center leading-8"
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
      </div>
    </section>
  );
}
