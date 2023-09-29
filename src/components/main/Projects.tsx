"use client";
import React, { FC } from "react";
import SectionHeading from "@/components/SectionHeading";
import Project from "./Project";
import { ProjectType } from "@/lib/types";

interface ProjectsProps {
  projects: ProjectType[];
}
const Projects: FC<ProjectsProps> = ({ projects }) => {
  //const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      //ref={ref}
      id="projects"
      className="mb-28 h-fit min-h-screen scroll-mt-28"
    >
      <SectionHeading>My projects</SectionHeading>
      <div>
        {projects.map((project: ProjectType, index: number) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Projects;
