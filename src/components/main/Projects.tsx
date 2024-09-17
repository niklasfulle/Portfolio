"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { ProjectType } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import Project from "./Project";

interface ProjectsProps {
  projects: ProjectType[];
}
const Projects: FC<ProjectsProps> = ({ projects }) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");

  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section
      ref={ref}
      id="projects"
      className="mb-28 h-fit min-h-screen scroll-mt-28"
    >
      <SectionHeading>
        {language === "de" ? ("Meine Projekte" ?? "") : ("My projects" ?? "")}
      </SectionHeading>
      <div>
        {projects.map((project: ProjectType, index: number) => (
          <React.Fragment key={index}>
            <Project {...project} language={language} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Projects;
