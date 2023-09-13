"use client";

import React from "react";

import { projectsData } from "@/lib/data";

import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import Project from "./Project";
import { Button } from "../ui/Button";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      ref={ref}
      id="projects"
      className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white"
    >
      <Button className="absolute right-2 top-2 bg-gray-800 px-10 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400">
        Edit
      </Button>
      <SectionHeading>My projects</SectionHeading>
      <div className="mb-8">
        {projectsData.map((project, index) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
