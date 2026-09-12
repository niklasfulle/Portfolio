import {
  disconnectGithubStatsCache,
  getCachedGithubStats,
  refreshGithubStats,
} from "@/lib/github-stats-cache";
import { getGithubStats, type GithubStatsData } from "@/lib/github-stats";
import { db } from "@/lib/db/prisma";

jest.mock("@/lib/github-stats", () => ({
  getGithubStats: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  db: {
    $disconnect: jest.fn(),
    githubStatsSnapshot: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

const mockedGetGithubStats = jest.mocked(getGithubStats);
const snapshot = db.githubStatsSnapshot;
const stats = {
  contributionDays: [],
  repositoryStats: [],
  totalContributions: 42,
  isFallback: false,
} as GithubStatsData;

describe("GitHub stats cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores freshly fetched statistics in the database", async () => {
    mockedGetGithubStats.mockResolvedValue(stats);

    await expect(refreshGithubStats()).resolves.toBe(stats);

    expect(snapshot.upsert).toHaveBeenCalledWith({
      create: expect.objectContaining({ data: stats, id: "github" }),
      update: { data: stats },
      where: { id: "github" },
    });
  });

  it("does not store fallback statistics", async () => {
    mockedGetGithubStats.mockResolvedValue({ ...stats, isFallback: true });

    await expect(refreshGithubStats()).rejects.toThrow(
      "GitHub statistics refresh returned fallback data"
    );

    expect(snapshot.upsert).not.toHaveBeenCalled();
  });

  it("returns the stored snapshot without calling GitHub", async () => {
    snapshot.findUnique.mockResolvedValue({ data: stats });

    await expect(getCachedGithubStats()).resolves.toBe(stats);
    expect(mockedGetGithubStats).not.toHaveBeenCalled();
  });

  it("fetches and stores statistics when no snapshot exists", async () => {
    snapshot.findUnique.mockResolvedValue(null);
    mockedGetGithubStats.mockResolvedValue(stats);

    await expect(getCachedGithubStats()).resolves.toBe(stats);
    expect(snapshot.upsert).toHaveBeenCalled();
  });

  it("refreshes legacy snapshots without contribution days", async () => {
    const legacyStats = { totalContributions: 42 } as GithubStatsData;
    snapshot.findUnique.mockResolvedValue({ data: legacyStats });
    mockedGetGithubStats.mockResolvedValue(stats);

    await expect(getCachedGithubStats()).resolves.toBe(stats);
    expect(mockedGetGithubStats).toHaveBeenCalledTimes(1);
    expect(snapshot.upsert).toHaveBeenCalled();
  });

  it("falls back to a live request when the database is unavailable", async () => {
    snapshot.findUnique.mockRejectedValue(new Error("database offline"));
    mockedGetGithubStats.mockResolvedValue(stats);

    await expect(getCachedGithubStats()).resolves.toBe(stats);
    expect(mockedGetGithubStats).toHaveBeenCalledTimes(1);
  });

  it("disconnects the Prisma cache client on shutdown", async () => {
    await disconnectGithubStatsCache();

    expect(db.$disconnect).toHaveBeenCalledTimes(1);
  });
});
