import Intro from "@/components/Intro";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import { getExperience, getProjects, getSkills } from "@/lib/db/functions";

export default async function Home() {
  const projects = await getProjects();
  const skills = await getSkills();
  const experience = await getExperience();

  const skillsData = skills.map((skill) => skill.name);

  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About />
      <Projects />
      <Skills skills={skillsData} />
      <Experience experience={experience} />
      <Contact />
    </main>
  );
}
