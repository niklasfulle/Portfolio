import { describe, expect, it } from "@jest/globals";
import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";
import { contentSchema, updateContentSchema } from "@/lib/admin-content-schema";

const project = {
  id: "project-1",
  title: "Portfolio",
  descriptionDe: "Beschreibung",
  descriptionEn: "Description",
  image: null as string | null,
  url: null as string | null,
  tags: "TypeScript, Next.js, Webentwicklung, PostgreSQL, Tests, CI/CD",
  visible: true,
  series: 0,
};

const content = {
  aboutMe: [],
  projects: [project],
  skills: [],
  experience: [],
  contactEmail: [],
};

describe("admin content validation", () => {
  it("accepts HTTPS and safe local image and project URLs", () => {
    expect(contentSchema.safeParse({
      ...content,
      projects: [{ ...project, image: "https://example.com/image.png", url: "/projects/portfolio" }],
    }).success).toBe(true);
  });

  it.each(["//example.com/image.png", "/\\example.com", "http://example.com", "not a URL"]) (
    "rejects unsafe project URLs: %s",
    (url) => {
      expect(contentSchema.safeParse({
        ...content,
        projects: [{ ...project, image: url }],
      }).success).toBe(false);
    },
  );

  it("requires at least six non-empty project key points and rejects duplicate IDs", () => {
    expect(contentSchema.safeParse({
      ...content,
      projects: [{ ...project, tags: "TypeScript, Next.js, Tests, CI/CD, PostgreSQL" }],
    }).success).toBe(false);
    expect(contentSchema.safeParse({
      ...content,
      projects: [project, { ...project, title: "Duplicate" }],
    }).success).toBe(false);
  });

  it("requires the publish key to match the version and content", () => {
    const expectedKey = createContentPublishIdempotencyKey(3, content);
    expect(updateContentSchema.safeParse({
      expectedVersion: 3,
      idempotencyKey: expectedKey,
      content,
    }).success).toBe(true);
    expect(updateContentSchema.safeParse({
      expectedVersion: 3,
      idempotencyKey: "f".repeat(64),
      content,
    }).success).toBe(false);
  });
});
