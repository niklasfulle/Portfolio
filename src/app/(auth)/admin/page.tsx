import Intro from "@/admin/Intro";
import Projects from "@/admin/Projects";
import About from "@/admin/About";
import Skills from "@/admin/Skills";
import Experience from "@/admin/Experience";
import Contact from "@/admin/Contact";
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
