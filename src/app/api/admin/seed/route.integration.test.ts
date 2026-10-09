/** @jest-environment node */

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { db } from "@/lib/db/prisma";
import { POST } from "./route";

const integrationUrl = process.env.PORTFOLIO_INTEGRATION_DATABASE_URL;
if (integrationUrl) {
  const parsed = new URL(integrationUrl);
  if (!/[\w-]+_test$/.test(parsed.pathname.slice(1)) || !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("Portfolio seed integration tests require a local database whose name ends in _test.");
  }
}

const token = "portfolio-seed-integration-token-at-least-thirty-two-characters";
const seed = {
  formatVersion: 1 as const,
  source: "Portfolio PostgreSQL application database",
  exportedAt: "2026-10-09T12:00:00.000Z",
  aboutMe: [],
  projects: [{
    id: "portfolio-seed-integration-project",
    title: "Seed project",
    descriptionDe: "Testbeschreibung",
    descriptionEn: "Test description",
    image: null,
    url: null,
    tags: "Legacy tags",
    visible: true,
    series: 1,
  }],
  skills: [],
  experience: [],
  contactEmail: [],
  githubStatsSnapshot: [{
    id: "seed-test",
    data: { totalContributions: 7 },
    fetchedAt: "2026-10-09T12:00:00.000Z",
  }],
  contentVersion: [],
};

const createRequest = () => new Request("http://localhost/api/admin/seed", {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(seed),
});

describe("Portfolio seed API with PostgreSQL", () => {
  const integrationIt = integrationUrl ? it : it.skip;

  beforeAll(async () => {
    if (!integrationUrl) return;
    process.env.ADMIN_CONTENT_API_TOKEN = token;
    await cleanSeedData();
  });

  afterAll(async () => {
    if (!integrationUrl) return;
    await cleanSeedData();
    await db.$disconnect();
  });

  integrationIt("seeds an empty database once and never overwrites existing data", async () => {
    const first = await POST(createRequest());
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ status: "applied" });
    expect(await db.projects.count()).toBe(1);
    expect(await db.githubStatsSnapshot.count()).toBe(1);
    expect(await db.portfolioSeedState.count()).toBe(1);

    const retry = await POST(createRequest());
    expect(await retry.json()).toEqual({ status: "already-applied" });

    await db.portfolioSeedState.deleteMany();
    await db.projects.update({
      where: { id: "portfolio-seed-integration-project" },
      data: { title: "Edited after seeding" },
    });
    const nonEmptyTarget = await POST(createRequest());
    expect(await nonEmptyTarget.json()).toEqual({ status: "skipped-existing-data" });
    expect(await db.projects.findUnique({ where: { id: "portfolio-seed-integration-project" } }))
      .toMatchObject({ title: "Edited after seeding" });
  });
});

async function cleanSeedData() {
  await db.$transaction([
    db.portfolioSeedState.deleteMany(),
    db.portfolioContentVersion.deleteMany(),
    db.githubStatsSnapshot.deleteMany(),
    db.aboutMe.deleteMany(),
    db.projects.deleteMany(),
    db.skills.deleteMany(),
    db.experience.deleteMany(),
    db.contactEmail.deleteMany(),
  ]);
}
