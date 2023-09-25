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

export default async function Home() {
  const about: any = await getAbout();
  const projects = await getProjects();
  const skills = await getSkills();
  const learn = await getLearn();
  const experience = await getExperience();
  const contactEmail = await getContactEmail();

  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About abouteMe={about} />
      <Projects projects={projects} />
      <Skills skills={skills} learn={learn} />
      <Experience experience={experience} />
      <Contact contactEmail={contactEmail[0].email} />
    </main>
  );
}
