import { AbouteMeType, ContactEmailType, ExperienceType, ProjectType, SkillType } from "../types";
import { db } from "./prisma";

/**
 * Get all aboutMe text data
 * 
 * @returns {Promise<AbouteMe[]>} About me data
 */
export const getAbout = async (): Promise<AbouteMeType[]> => {
  const aboutMe = await db.aboutMe.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return aboutMe;
}

/**
 * Get all projects data
 * 
 * @returns {Promise<Project[]>} Projects data
 */
export const getProjects = async (): Promise<ProjectType[]> => {
  const projects = await db.projects.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return projects;
}

/**
 * Get all skills data
 * 
 * @returns {Promise<Skill[]>} Skills data
 */
export const getSkills = async (): Promise<SkillType[]> => {
  const skills = await db.skills.findMany({ where: { visible: true, type: "skill" }, orderBy: { series: "asc" } });
  return skills;
}

/**
 * Get all learn data
 * 
 * @returns {Promise<Skill[]>} Learn data
 */
export const getLearn = async (): Promise<SkillType[]> => {
  const learn = await db.skills.findMany({ where: { visible: true, type: "learn" }, orderBy: { series: "asc" } });
  return learn;
}

/**
 * Get all experience data
 * 
 * @returns {Promise<Experience[]>} Experience data
 */
export const getExperience = async (): Promise<ExperienceType[]> => {
  const experience = await db.experience.findMany({ where: { visible: true }, orderBy: { series: "asc" } });
  return experience;
}

/**
 * Get all contact email data
 * 
 * @returns {Promise<ContactEmailType[]>} Contact email data
 */
export const getContactEmail = async (): Promise<ContactEmailType[]> => {
  const contactEmail = await db.contactEmail.findMany();
  return contactEmail;
}