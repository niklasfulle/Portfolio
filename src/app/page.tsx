import Intro from "@/main/Intro";
import Projects from "@/main/Projects";
import About from "@/main/About";
import Skills from "@/main/Skills";
import Experience from "@/main/Experience";
import Contact from "@/main/Contact";
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
