"use client";

import React, { FC, useState } from "react";

import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import Project from "./Project";
import { Button } from "../ui/Button";
import ProjectEdit from "./ProjectEdit";
import ProjectNew from "./ProjectNew";

interface ProjectsProps {
  projects?: any;
}
const Projects: FC<ProjectsProps> = ({ projects }) => {
  const [edit, setEdit] = useState(false);
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      ref={ref}
      id="projects"
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
      <SectionHeading>My projects</SectionHeading>

      {edit && (
        <div className="mb-8 flex w-full flex-col items-center justify-center rounded-lg">
          {projects.map((project: any, index: any) => (
            <React.Fragment key={index}>
              <ProjectEdit {...project} />
            </React.Fragment>
          ))}
          <ProjectNew />
        </div>
      )}
      {!edit && (
        <div className="mb-8 rounded-lg">
          {projects.map((project: any, index: any) => (
            <React.Fragment key={index}>
              <Project {...project} />
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
