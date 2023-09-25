import { db } from "./prisma";

export const getAbout = async () => {
  const aboutMe = await db.aboutMe.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return aboutMe;
}

export const getProjects = async () => {
  const projects = await db.projects.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return projects;
}

export const getSkills = async () => {
  const skills = await db.skills.findMany({ where: { visible: true, type: "skill" }, orderBy: { series: "asc" } });
  return skills;
}

export const getLearn = async () => {
  const learn = await db.skills.findMany({ where: { visible: true, type: "learn" }, orderBy: { series: "asc" } });
  return learn;
}

export const getExperience = async () => {
  const experience = await db.experience.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return experience;
}

export const getContactEmail = async () => {
  const contactEmail = await db.contactEmail.findMany();
  return contactEmail;
}