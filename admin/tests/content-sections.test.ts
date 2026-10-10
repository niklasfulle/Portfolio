import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeDraftSections, parseSectionPayload } from "@admin/lib/content-sections";

test("section payload validation applies the portfolio content schema", () => {
  assert.deepEqual(parseSectionPayload("aboutMe", [{ id: "about-1", textDe: "Hallo", textEn: "Hello", visible: true, series: 0 }]), [
    { id: "about-1", textDe: "Hallo", textEn: "Hello", visible: true, series: 0 },
  ]);
  assert.throws(() => parseSectionPayload("projects", [{ id: "project-1", title: "Missing key points" }]));
});

test("merging a draft changes only that section and does not mutate published data", () => {
  const published = { version: 4, content: { aboutMe: [{ id: "live" }], projects: [{ id: "published" }] } };
  const merged = mergeDraftSections(published, [{ id: "projects", payload: [{ id: "draft" }] }]) as typeof published;
  assert.deepEqual(merged.content, { aboutMe: [{ id: "live" }], projects: [{ id: "draft" }] });
  assert.deepEqual(published.content.projects, [{ id: "published" }]);
});
