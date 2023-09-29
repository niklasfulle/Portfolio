import React from "react";
import Intro from "@/main/Intro";
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

export default async function Home() {
  const abouteMe: AbouteMe[] = await getAbout();
  const projects: Project[] = await getProjects();
  const skills: Skill[] = await getSkills();
  const learn: Skill[] = await getLearn();
  const experience: Experience[] = await getExperience();
  const contactEmail: ContactEmail[] = await getContactEmail();

  const skillsData: String[] = skills.map((skill: Skill) => skill.name);
  const learnData: String[] = learn.map((skill: Skill) => skill.name);

  return (
    <main className="flex flex-col items-center scroll-smooth px-4">
      <Intro />
      <About abouteMe={abouteMe} />
      <Projects projects={projects} />
      <Skills skills={skillsData} learn={learnData} />
      <Experience experience={experience} />
      <Contact contactEmail={contactEmail[0].email} />
    </main>
  );
}
