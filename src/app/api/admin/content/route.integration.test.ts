/** @jest-environment node */

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { db } from "@/lib/db/prisma";
import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";
import { GET, PUT } from "./route";

const integrationUrl = process.env.PORTFOLIO_INTEGRATION_DATABASE_URL;
if (integrationUrl) {
  const parsed = new URL(integrationUrl);
  if (!/[\w-]+_test$/.test(parsed.pathname.slice(1)) || !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("Portfolio API integration tests require a local database whose name ends in _test.");
  }
}

const token = "portfolio-api-integration-token-at-least-thirty-two-characters";
const initialContent = {
  aboutMe: [],
  projects: [{
    id: "cms-api-integration-project",
    title: "Committed content",
    descriptionDe: "Testbeschreibung",
    descriptionEn: "Test description",
    image: null,
    url: null,
    tags: "TypeScript, Next.js, Webentwicklung, PostgreSQL, Tests, CI/CD",
    visible: true,
    series: 1,
  }],
  skills: [],
  experience: [],
  contactEmail: [],
};
const emptyContent = {
  aboutMe: [],
  projects: [],
  skills: [],
  experience: [],
  contactEmail: [],
};

function createRequest(body: unknown) {
  return new Request("http://localhost/api/admin/content", {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("Portfolio content API with PostgreSQL", () => {
  const integrationIt = integrationUrl ? it : it.skip;

  beforeAll(async () => {
    if (!integrationUrl) return;
    process.env.ADMIN_CONTENT_API_TOKEN = token;
    await db.$transaction([
      db.aboutMe.deleteMany(),
      db.projects.deleteMany(),
      db.skills.deleteMany(),
      db.experience.deleteMany(),
      db.contactEmail.deleteMany(),
      db.portfolioContentVersion.deleteMany({ where: { id: "main" } }),
    ]);
  });

  afterAll(async () => {
    if (!integrationUrl) return;
    await db.$transaction([
      db.aboutMe.deleteMany(),
      db.projects.deleteMany(),
      db.skills.deleteMany(),
      db.experience.deleteMany(),
      db.contactEmail.deleteMany(),
      db.portfolioContentVersion.deleteMany({ where: { id: "main" } }),
    ]);
    await db.$disconnect();
  });

  integrationIt("atomically publishes, safely retries, and deletes removed content", async () => {
    const firstKey = createContentPublishIdempotencyKey(0, initialContent);
    const first = await PUT(createRequest({ expectedVersion: 0, idempotencyKey: firstKey, content: initialContent }));
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ version: 1 });
    expect(await db.projects.findUnique({ where: { id: "cms-api-integration-project" } })).toMatchObject({ title: "Committed content" });
    expect(await db.portfolioContentVersion.findUnique({ where: { id: "main" } })).toMatchObject({
      version: 1,
      lastPublishKey: firstKey,
    });

    const retry = await PUT(createRequest({ expectedVersion: 0, idempotencyKey: firstKey, content: initialContent }));
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual({ version: 1 });
    expect(await db.projects.count()).toBe(1);

    const changedBodyWithOldKey = await PUT(createRequest({
      expectedVersion: 0,
      idempotencyKey: firstKey,
      content: { ...initialContent, projects: [] },
    }));
    expect(changedBodyWithOldKey.status).toBe(400);
    expect(await db.projects.count()).toBe(1);

    const deleteKey = createContentPublishIdempotencyKey(1, emptyContent);
    const deleted = await PUT(createRequest({ expectedVersion: 1, idempotencyKey: deleteKey, content: emptyContent }));
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toEqual({ version: 2 });
    expect(await db.projects.count()).toBe(0);

    const unauthorized = await GET(new Request("http://localhost/api/admin/content"));
    expect(unauthorized.status).toBe(401);
  });
});
