import { z } from "zod";

const id = z.string().min(1).max(128);
const aboutMeRow = z.object({
  id,
  textDe: z.string().nullable(),
  textEn: z.string().nullable(),
  visible: z.boolean(),
  series: z.number().int(),
}).strict();
const projectRow = z.object({
  id,
  title: z.string(),
  descriptionDe: z.string(),
  descriptionEn: z.string(),
  image: z.string().nullable(),
  url: z.string().nullable(),
  tags: z.string(),
  visible: z.boolean(),
  series: z.number().int(),
}).strict();
const skillRow = z.object({
  id,
  name: z.string(),
  image: z.string().nullable(),
  type: z.string().nullable(),
  visible: z.boolean(),
  series: z.number().int(),
}).strict();
const experienceRow = z.object({
  id,
  category: z.string(),
  titleDe: z.string(),
  titleEn: z.string(),
  location: z.string(),
  descriptionDe: z.string(),
  descriptionEn: z.string(),
  icon: z.string(),
  date: z.string(),
  visible: z.boolean(),
  series: z.number().int(),
}).strict();
const contactEmailRow = z.object({
  id,
  email: z.email(),
}).strict();
const dateString = z.iso.datetime({ offset: true });
const githubStatsRow = z.object({
  id,
  data: z.record(z.string(), z.unknown()),
  fetchedAt: dateString,
}).strict();
const contentVersionRow = z.object({
  id,
  version: z.number().int(),
  lastPublishKey: z.string().max(64).nullable(),
  updatedAt: dateString,
}).strict();

export const portfolioSeedSchema = z.object({
  formatVersion: z.literal(1),
  source: z.string().max(100),
  exportedAt: dateString,
  aboutMe: z.array(aboutMeRow).max(200),
  projects: z.array(projectRow).max(500),
  skills: z.array(skillRow).max(500),
  experience: z.array(experienceRow).max(500),
  contactEmail: z.array(contactEmailRow).max(10),
  githubStatsSnapshot: z.array(githubStatsRow).max(10),
  contentVersion: z.array(contentVersionRow).max(10),
}).strict();
