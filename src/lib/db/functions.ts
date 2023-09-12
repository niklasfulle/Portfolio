import { db } from "./prisma";

export const getProjects = async () => {
  const skills = await db.projects.findMany({ where: { visible: true } });
  return skills;
}

export const getSkills = async () => {
  const skills = await db.skills.findMany({ where: { visible: true } });
  return skills;
}

export const getExperience = async () => {
  const skills = await db.experience.findMany({ where: { visible: true } });
  return skills;
}