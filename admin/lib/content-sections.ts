import { contentSchema } from "@/lib/admin-content-schema";

export const CONTENT_SECTIONS = ["aboutMe", "projects", "skills", "experience", "contactEmail"] as const;
export type ContentSection = (typeof CONTENT_SECTIONS)[number];
export type PortfolioContent = {
  aboutMe: unknown[];
  projects: unknown[];
  skills: unknown[];
  experience: unknown[];
  contactEmail: unknown[];
};

export function isContentSection(value: string): value is ContentSection {
  return CONTENT_SECTIONS.some((section) => section === value);
}

export function parseSectionPayload(section: ContentSection, payload: unknown): unknown[] {
  const empty: PortfolioContent = {
    aboutMe: [], projects: [], skills: [], experience: [], contactEmail: [],
  };
  const result = contentSchema.safeParse({ ...empty, [section]: payload });
  if (!result.success) throw result.error;
  return result.data[section] as unknown[];
}

export function mergeDraftSections(
  published: unknown,
  rows: Array<{ id: string; payload: unknown; version?: number; published_draft_version?: number }>,
): unknown {
  if (!published || typeof published !== "object" || !("content" in published)) return published;
  const content = (published as { content: unknown }).content;
  if (!content || typeof content !== "object") return published;
  const merged = { ...(content as Record<string, unknown>) };
  for (const row of rows) {
    if (row.version !== undefined && row.published_draft_version !== undefined
      && row.version <= row.published_draft_version) continue;
    if (isContentSection(row.id)) merged[row.id] = row.payload;
  }
  return { ...(published as Record<string, unknown>), content: merged };
}
