import Intro from "@/main/Intro";
import { getCachedGithubStats } from "@/lib/github-stats-cache";
import Projects from "@/main/Projects";
import About from "@/main/About";
import Skills from "@/main/Skills";
import Experience from "@/main/Experience";
import Contact from "@/main/Contact";
import {
  getAbout,
  getContactEmail,
  getExperience,
  getLearn,
  getProjects,
  getSkills,
} from "@/lib/db/functions";
import {
  SkillType,
} from "@/lib/types";

export default async function Home() {
  const [abouteMe, projects, skills, learn, experience, contactEmail, githubStats] =
    await Promise.all([
      getAbout(),
      getProjects(),
      getSkills(),
      getLearn(),
      getExperience(),
      getContactEmail(),
      getCachedGithubStats(),
    ]);
  const recipientEmail = contactEmail[0]?.email ?? "";

  const skillsData: string[] = skills.map((skill: SkillType) => skill.name);
  const learnData: string[] = learn.map((skill: SkillType) => skill.name);

  return (
    <main className="flex flex-col items-center scroll-smooth px-4">
      <Intro stats={githubStats} />
      <About abouteMe={abouteMe} />
      <Projects projects={projects} />
      <Skills skills={skillsData} learn={learnData} stats={githubStats} />
      <Experience experience={experience} />
      <Contact contactEmail={recipientEmail} />
    </main>
  );
}
