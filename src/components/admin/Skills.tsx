"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "../ui/Button";

interface Props {
  skills?: any;
  learn?: any;
}

const Skills: FC<Props> = ({ skills, learn }) => {
  const [edit, setEdit] = useState(false);
  const { ref } = useSectionInView("Skills");

  return (
    <section
      id="skills"
      ref={ref}
      className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white"
    >
      {!edit && (
        <Button
          className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => setEdit(true)}
        >
          Edit
        </Button>
      )}
      {edit && (
        <>
          <Button
            className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
            onClick={() => setEdit(false)}
          >
            Close
          </Button>
        </>
      )}
      <SectionHeading>My skills</SectionHeading>
      <ul className="mb-16 flex max-w-[53rem] flex-wrap justify-center gap-3 text-lg text-gray-800">
        {skills.map((skill: any, index: any) => (
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
        {learn.map((learn: any, index: any) => (
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
