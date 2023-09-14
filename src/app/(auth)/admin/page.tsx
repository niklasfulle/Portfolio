import Intro from "@/admin/Intro";
import Projects from "@/admin/Projects";
import About from "@/admin/About";
import Skills from "@/admin/Skills";
import Experience from "@/admin/Experience";
import Contact from "@/admin/Contact";
import {
  getAbout,
  getExperience,
  getLearn,
  getProjects,
  getSkills,
} from "@/lib/db/functions";

export default async function Home() {
  const about = await getAbout();
  const projects = await getProjects();
  const skills = await getSkills();
  const learn = await getLearn();
  const experience = await getExperience();

  const skillsData = skills.map((skill) => skill.name);
  const learnData = learn.map((skill) => skill.name);
  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About abouteMe={about} />
      <Projects projects={projects} />
      <Skills skills={skillsData} learn={learnData} />
      <Experience experience={experience} />
      <Contact />
    </main>
  );
}
