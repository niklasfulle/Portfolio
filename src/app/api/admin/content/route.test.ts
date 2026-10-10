/** @jest-environment node */

import { GET, PUT } from "./route";
import { db } from "@/lib/db/prisma";
import { getCachedGithubStats } from "@/lib/github-stats-cache";
import { revalidatePath } from "next/cache";
import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";
import { createAdminServiceAssertion } from "@/lib/admin-service-auth";

jest.mock("@/lib/db/prisma", () => ({
  db: {
    aboutMe: { findMany: jest.fn() },
    projects: { findMany: jest.fn() },
    skills: { findMany: jest.fn() },
    experience: { findMany: jest.fn() },
    contactEmail: { findMany: jest.fn() },
    portfolioContentVersion: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/github-stats-cache", () => ({
  getCachedGithubStats: jest.fn(),
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const TOKEN = "test-content-api-token-that-is-at-least-thirty-two-characters";
const content = {
  aboutMe: [],
  projects: [{
    id: "project-1",
    title: "Test project",
    descriptionDe: "Beschreibung",
    descriptionEn: "Description",
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
const contentKey = createContentPublishIdempotencyKey(4, content);

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

function serviceHeaders(method: string, path = "/api/admin/content") {
  return {
    authorization: `Bearer ${TOKEN}`,
    ...createAdminServiceAssertion(TOKEN, { actor: "test-admin", method, pathname: path }),
  };
}

beforeEach(() => {
  process.env.ADMIN_CONTENT_API_TOKEN = TOKEN;
  jest.clearAllMocks();
  (db.aboutMe.findMany as jest.Mock).mockResolvedValue([]);
  (db.projects.findMany as jest.Mock).mockResolvedValue([]);
  (db.skills.findMany as jest.Mock).mockResolvedValue([]);
  (db.experience.findMany as jest.Mock).mockResolvedValue([]);
  (db.contactEmail.findMany as jest.Mock).mockResolvedValue([]);
  (db.portfolioContentVersion.findUnique as jest.Mock).mockResolvedValue({ version: 4, lastPublishKey: null });
  (getCachedGithubStats as jest.Mock).mockResolvedValue({ totalContributions: 12 });
});

describe("public portfolio content API", () => {
  it("reports the API unavailable when the service token is not configured", async () => {
    delete process.env.ADMIN_CONTENT_API_TOKEN;

    const getResponse = await GET(request("/api/admin/content"));
    const putResponse = await PUT(request("/api/admin/content", { method: "PUT" }));

    expect(getResponse.status).toBe(503);
    expect(putResponse.status).toBe(503);
    expect(db.aboutMe.findMany).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
    process.env.ADMIN_CONTENT_API_TOKEN = TOKEN;
  });

  it("rejects missing and incorrect bearer tokens without querying content", async () => {
    const missing = await GET(request("/api/admin/content"));
    const incorrect = await GET(request("/api/admin/content", {
      headers: { authorization: `Bearer ${"x".repeat(TOKEN.length)}` },
    }));

    expect(missing.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(db.aboutMe.findMany).not.toHaveBeenCalled();
    expect(missing.headers.get("cache-control")).toBe("no-store");
  });

  it("returns current content and GitHub stats without caching", async () => {
    const response = await GET(request("/api/admin/content", {
      headers: serviceHeaders("GET"),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      version: 4,
      content: emptyContent,
      githubStats: { totalContributions: 12 },
    });
  });

  it("rejects invalid updates before opening a database transaction", async () => {
    const response = await PUT(request("/api/admin/content", {
      method: "PUT",
      headers: { ...serviceHeaders("PUT"), "content-type": "application/json" },
      body: JSON.stringify({ expectedVersion: 4, idempotencyKey: contentKey, content: { ...content, unexpected: true } }),
    }));

    expect(response.status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("publishes validated content transactionally and revalidates the home page", async () => {
    const transaction = {
      portfolioContentVersion: {
        upsert: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ version: 5, lastPublishKey: null }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      projects: { upsert: jest.fn(), deleteMany: jest.fn() },
      skills: { upsert: jest.fn(), deleteMany: jest.fn() },
      experience: { upsert: jest.fn(), deleteMany: jest.fn() },
      contactEmail: { upsert: jest.fn(), deleteMany: jest.fn() },
      aboutMe: { upsert: jest.fn(), deleteMany: jest.fn() },
    };
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback(transaction));

    const response = await PUT(request("/api/admin/content", {
      method: "PUT",
      headers: { ...serviceHeaders("PUT"), "content-type": "application/json" },
      body: JSON.stringify({ expectedVersion: 4, idempotencyKey: contentKey, content }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ version: 5 });
    expect(transaction.portfolioContentVersion.updateMany).toHaveBeenCalledWith({
      where: { id: "main", version: 4 },
      data: { version: { increment: 1 }, lastPublishKey: contentKey },
    });
    expect(transaction.projects.upsert).toHaveBeenCalledWith({
      where: { id: "project-1" },
      create: content.projects[0],
      update: {
        title: "Test project",
        descriptionDe: "Beschreibung",
        descriptionEn: "Description",
        image: null,
        url: null,
        tags: "TypeScript, Next.js, Webentwicklung, PostgreSQL, Tests, CI/CD",
        visible: true,
        series: 1,
      },
    });
    expect(transaction.projects.deleteMany).toHaveBeenCalledWith({ where: { id: { notIn: ["project-1"] } } });
    expect(transaction.skills.deleteMany).toHaveBeenCalledWith(undefined);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns a conflict when the content version changed", async () => {
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback({
      portfolioContentVersion: {
        findUnique: jest.fn().mockResolvedValue({ version: 5, lastPublishKey: null }),
        upsert: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    }));

    const response = await PUT(request("/api/admin/content", {
      method: "PUT",
      headers: { ...serviceHeaders("PUT"), "content-type": "application/json" },
      body: JSON.stringify({ expectedVersion: 4, idempotencyKey: contentKey, content }),
    }));

    expect(response.status).toBe(409);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("confirms a retry when this publish key was already committed", async () => {
    const transaction = {
      portfolioContentVersion: {
        findUnique: jest.fn().mockResolvedValue({ version: 5, lastPublishKey: contentKey }),
      },
    };
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => callback(transaction));

    const response = await PUT(request("/api/admin/content", {
      method: "PUT",
      headers: { ...serviceHeaders("PUT"), "content-type": "application/json" },
      body: JSON.stringify({ expectedVersion: 4, idempotencyKey: contentKey, content }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ version: 5 });
    expect(db.portfolioContentVersion.upsert).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects a valid-shaped but mismatched idempotency key", async () => {
    const response = await PUT(request("/api/admin/content", {
      method: "PUT",
      headers: { ...serviceHeaders("PUT"), "content-type": "application/json" },
      body: JSON.stringify({ expectedVersion: 4, idempotencyKey: "f".repeat(64), content }),
    }));

    expect(response.status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
