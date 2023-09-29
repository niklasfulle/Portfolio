"use client";
import React, { FC } from "react";

import SectionHeading from "@/components/SectionHeading";

interface SkillsProps {
  skills: String[];
  learn: String[];
}

const Skills: FC<SkillsProps> = ({ skills, learn }) => {
  //const { ref } = useSectionInView("Skills");

  return (
    <section
      id="skills"
      //ref={ref}
      className="h-fit min-h-screen max-w-[53rem] scroll-mt-28 text-center"
    >
      <SectionHeading>My skills</SectionHeading>
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {skills.map((skill: String, index: number) => (
          <li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={index}
          >
            {skill}
          </li>
        ))}
      </ul>
      <SectionHeading>I want to learn</SectionHeading>
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {learn.map((learn: String, index: number) => (
          <li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={index}
          >
            {learn}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
