import React from "react";
import Intro from "@/main/Intro";
import Projects from "@/main/Projects";
import About from "@/main/About";
import Skills from "@/main/Skills";
import Experience from "@/main/Experience";
import Contact from "@/main/Contact";
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

  //console.log(experience);

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
