import React from "react";
import Intro from "@/admin/Intro";
import Projects from "@/admin/Projects";
import About from "@/admin/About";
import Skills from "@/admin/Skills";
import Experience from "@/admin/Experience";
import Contact from "@/admin/Contact";
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

export default async function Home() {
  const about: AbouteMeType[] = await getAbout();
  const projects: ProjectType[] = await getProjects();
  const skills: SkillType[] = await getSkills();
  const learn: SkillType[] = await getLearn();
  const experience: ExperienceType[] = await getExperience();
  const contactEmail: ContactEmailType[] = await getContactEmail();

  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About abouteMe={about} />
      <Projects projects={projects} />
      <Skills skills={skills} learn={learn} />
      <Experience experience={experience} />
      <Contact contactEmail={contactEmail[0].email} id={contactEmail[0].id} />
    </main>
  );
}
