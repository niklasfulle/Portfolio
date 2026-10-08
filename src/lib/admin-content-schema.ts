import { z } from "zod";
import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";

const idSchema = z.string().trim().min(1).max(128);
const safeUrlSchema = z.string().trim().max(2048).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return true;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "Use an HTTPS URL or a local path beginning with a single slash.");
const aboutSchema = z.object({
  id: idSchema,
  textDe: z.string().max(10_000).nullable(),
  textEn: z.string().max(10_000).nullable(),
  visible: z.boolean(),
  series: z.number().int().min(0).max(100_000),
}).strict();
const projectSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1).max(200),
  descriptionDe: z.string().max(10_000),
  descriptionEn: z.string().max(10_000),
  image: safeUrlSchema.nullable(),
  url: safeUrlSchema.nullable(),
  tags: z.string().max(2000).refine(
    (value) => value.split(",").filter((tag) => tag.trim().length > 0).length >= 6,
    "Add at least six comma-separated project key points.",
  ),
  visible: z.boolean(),
  series: z.number().int().min(0).max(100_000),
}).strict();
const skillSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(120),
  image: safeUrlSchema.nullable(),
  type: z.string().max(80).nullable(),
  visible: z.boolean(),
  series: z.number().int().min(0).max(100_000),
}).strict();
const experienceSchema = z.object({
  id: idSchema,
  category: z.string().max(80),
  titleDe: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  location: z.string().max(300),
  descriptionDe: z.string().max(10_000),
  descriptionEn: z.string().max(10_000),
  icon: z.string().max(100),
  date: z.string().max(200),
  visible: z.boolean(),
  series: z.number().int().min(0).max(100_000),
}).strict();
const contactSchema = z.object({
  id: idSchema,
  email: z.email().max(254),
}).strict();

export const contentSchema = z.object({
  aboutMe: z.array(aboutSchema).max(200),
  projects: z.array(projectSchema).max(500),
  skills: z.array(skillSchema).max(500),
  experience: z.array(experienceSchema).max(500),
  contactEmail: z.array(contactSchema).max(10),
}).strict().superRefine((content, context) => {
  for (const collection of ["aboutMe", "projects", "skills", "experience", "contactEmail"] as const) {
    const ids = new Set<string>();
    content[collection].forEach((entry, index) => {
      if (ids.has(entry.id)) {
        context.addIssue({
          code: "custom",
          message: "Entry IDs must be unique within a content section.",
          path: [index, "id"],
        });
      }
      ids.add(entry.id);
    });
  }
});

export const updateContentSchema = z.object({
  expectedVersion: z.number().int().min(0),
  idempotencyKey: z.string().regex(/^[a-f0-9]{64}$/),
  content: contentSchema,
}).strict().superRefine((update, context) => {
  if (update.idempotencyKey !== createContentPublishIdempotencyKey(update.expectedVersion, update.content)) {
    context.addIssue({
      code: "custom",
      message: "The idempotency key must match the content and expected version.",
      path: ["idempotencyKey"],
    });
  }
});
