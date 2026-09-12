"use client";
import { FC } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { ProjectType } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import Project from "./Project";
import type { GithubStatsData } from "@/lib/github-stats";

type ProjectsProps = {
  readonly projects: ProjectType[];
  readonly githubStats: GithubStatsData;
};
const Projects: FC<ProjectsProps> = ({ projects, githubStats }) => {
  const { language } = useLanguage();

  const { ref } = useSectionInView("Projects", 0.1);

  return (
    <section
      ref={ref}
      id="projects"
      className="section-glow section-glow--projects mb-36 h-fit min-h-screen w-full max-w-[64rem] scroll-mt-28"
    >
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeading
            eyebrow={language === "de" ? "Ausgewählte Arbeiten" : "Selected work"}
          >
            {language === "de" ? "Meine Projekte" : "My projects"}
          </SectionHeading>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-right">
          {language === "de"
            ? "Eine Auswahl öffentlicher GitHub-Projekte und vertraulicher Arbeiten aus der Praxis."
            : "A selection of public GitHub projects and confidential work from practice."}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project: ProjectType) => (
          <Project
            key={project.id}
            {...project}
            commitCount={
              project.url
                ? githubStats.repositoryStats.find((repository) =>
                    project.url?.toLowerCase().endsWith(repository.nameWithOwner.toLowerCase())
                  )?.commits
                : undefined
            }
            language={language}
          />
        ))}
      </div>
    </section>
  );
};

export default Projects;
