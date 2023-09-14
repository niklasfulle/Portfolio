import { db } from "./prisma";

export const getAbout = async () => {
  const aboutMe = await db.aboutMe.findMany({ where: { visible: true } });
  return aboutMe;
}

export const getProjects = async () => {
  const projects = await db.projects.findMany({ where: { visible: true } });
  return projects;
}

export const getSkills = async () => {
  const skills = await db.skills.findMany({ where: { visible: true, type: "skill" } });
  return skills;
}

export const getLearn = async () => {
  const learn = await db.skills.findMany({ where: { visible: true, type: "learn" } });
  return learn;
}

export const getExperience = async () => {
  const experience = await db.experience.findMany({ where: { visible: true } });
  return experience;
}