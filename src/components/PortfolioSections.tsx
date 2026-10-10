import About from "@/main/About";
import Contact from "@/main/Contact";
import Experience from "@/main/Experience";
import Intro from "@/main/Intro";
import Projects from "@/main/Projects";
import Skills from "@/main/Skills";
import type { GithubStatsData } from "@/lib/github-stats";
import type {
  AbouteMeType,
  ExperienceType,
  ProjectType,
} from "@/lib/types";

export type PortfolioSectionsProps = {
  readonly aboutMe: AbouteMeType[];
  readonly projects: ProjectType[];
  readonly skills: string[];
  readonly experience: ExperienceType[];
  readonly contactEmail: string;
  readonly githubStats: GithubStatsData;
  readonly previewMode?: boolean;
};

export default function PortfolioSections({
  aboutMe,
  projects,
  skills,
  experience,
  contactEmail,
  githubStats,
  previewMode = false,
}: PortfolioSectionsProps) {
  return (
    <main className="flex flex-col items-center scroll-smooth px-4">
      <Intro stats={githubStats} />
      <About abouteMe={aboutMe} />
      <Projects projects={projects} githubStats={githubStats} />
      <Skills skills={skills} stats={githubStats} />
      <Experience experience={experience} />
      <Contact contactEmail={contactEmail} previewMode={previewMode} />
    </main>
  );
}
