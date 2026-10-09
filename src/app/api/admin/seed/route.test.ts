/** @jest-environment node */

import { POST } from "./route";
import { db } from "@/lib/db/prisma";

jest.mock("@/lib/db/prisma", () => ({
  db: {
    portfolioSeedState: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const TOKEN = "test-seed-api-token-that-is-at-least-thirty-two-characters";
const seed = {
  formatVersion: 1,
  source: "Portfolio PostgreSQL application database",
  exportedAt: "2026-10-09T12:00:00.000Z",
  aboutMe: [],
  projects: [{
    id: "project-1",
    title: "Legacy project",
    descriptionDe: "Beschreibung",
    descriptionEn: "Description",
    image: null,
    url: null,
    tags: "TypeScript, Next.js",
    visible: true,
    series: 0,
  }],
  skills: [],
  experience: [],
  contactEmail: [],
  githubStatsSnapshot: [{
    id: "main",
    data: { totalContributions: 12 },
    fetchedAt: "2026-10-09T12:00:00.000Z",
  }],
  contentVersion: [],
};

function createRequest(body: unknown, authorization = `Bearer ${TOKEN}`) {
  return new Request("http://localhost/api/admin/seed", {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ADMIN_CONTENT_API_TOKEN = TOKEN;
  jest.clearAllMocks();
});

describe("portfolio startup seed API", () => {
  it("requires the service bearer token before reading the seed or database", async () => {
    const response = await POST(createRequest(seed, "Bearer invalid"));

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("applies a seed transactionally only to an empty database", async () => {
    const transaction = {
      portfolioSeedState: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
      aboutMe: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      projects: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      skills: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      experience: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      contactEmail: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      githubStatsSnapshot: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
      portfolioContentVersion: { count: jest.fn().mockResolvedValue(0), createMany: jest.fn() },
    };
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback(transaction));

    const response = await POST(createRequest(seed));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "applied" });
    expect(transaction.portfolioSeedState.create).toHaveBeenCalledWith({
      data: { id: "initial-portfolio-seed-v1", seedHash: expect.any(String) },
    });
    expect(transaction.projects.createMany).toHaveBeenCalledWith({ data: seed.projects });
    expect(transaction.githubStatsSnapshot.createMany).toHaveBeenCalledWith({
      data: [{ ...seed.githubStatsSnapshot[0], fetchedAt: new Date(seed.githubStatsSnapshot[0].fetchedAt) }],
    });
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "Serializable",
    });
  });

  it("skips any existing database content without overwriting it", async () => {
    const transaction = {
      portfolioSeedState: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
      aboutMe: { count: jest.fn().mockResolvedValue(0) },
      projects: { count: jest.fn().mockResolvedValue(1) },
      skills: { count: jest.fn().mockResolvedValue(0) },
      experience: { count: jest.fn().mockResolvedValue(0) },
      contactEmail: { count: jest.fn().mockResolvedValue(0) },
      githubStatsSnapshot: { count: jest.fn().mockResolvedValue(0) },
      portfolioContentVersion: { count: jest.fn().mockResolvedValue(0) },
    };
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback(transaction));

    const response = await POST(createRequest(seed));

    expect(await response.json()).toEqual({ status: "skipped-existing-data" });
    expect(transaction.portfolioSeedState.create).not.toHaveBeenCalled();
  });

  it("does not reapply a seed that was already recorded", async () => {
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback({
      portfolioSeedState: { findUnique: jest.fn().mockResolvedValue({ id: "initial-portfolio-seed-v1" }) },
    }));

    const response = await POST(createRequest(seed));

    expect(await response.json()).toEqual({ status: "already-applied" });
  });
});
