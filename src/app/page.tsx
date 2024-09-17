import React, { useState } from "react";
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
import {
  AbouteMeType,
  ContactEmailType,
  ExperienceType,
  ProjectType,
  SkillType,
} from "@/lib/types";
import { useSearchParams } from "next/navigation";

export default async function Home() {
  const abouteMe: AbouteMeType[] = await getAbout();
  const projects: ProjectType[] = await getProjects();
  const skills: SkillType[] = await getSkills();
  const learn: SkillType[] = await getLearn();
  const experience: ExperienceType[] = await getExperience();
  const contactEmail: ContactEmailType[] = await getContactEmail();

  const skillsData: String[] = skills.map((skill: SkillType) => skill.name);
  const learnData: String[] = learn.map((skill: SkillType) => skill.name);

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
