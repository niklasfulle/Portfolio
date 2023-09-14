"use client";

import React, { FC } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import Project from "./Project";

interface Props {
  projects?: any;
}
const Projects: FC<Props> = ({ projects }) => {
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      ref={ref}
      id="projects"
      className="mb-28 h-fit min-h-screen scroll-mt-28"
    >
      <SectionHeading>My projects</SectionHeading>
      <div>
        {projects.map((project: any, index: any) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Projects;
