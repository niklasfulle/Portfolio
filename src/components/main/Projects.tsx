"use client";
import React, { FC } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import Project from "./Project";
import { Projects } from "@prisma/client";

interface ProjectsProps {
  projects: Projects[];
}
const Projects: FC<ProjectsProps> = ({ projects }) => {
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      ref={ref}
      id="projects"
      className="mb-28 h-fit min-h-screen scroll-mt-28"
    >
      <SectionHeading>My projects</SectionHeading>
      <div>
        {projects.map((project: Project, index: number) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Projects;
