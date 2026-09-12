import type { Prisma } from "@prisma/client";
import { getGithubStats, type GithubStatsData } from "./github-stats";
import { db } from "./db/prisma";

const GITHUB_STATS_SNAPSHOT_ID = "github";

export async function refreshGithubStats(): Promise<GithubStatsData> {
  const stats = await getGithubStats();

  if (stats.isFallback) {
    throw new Error("GitHub statistics refresh returned fallback data");
  }

  await db.githubStatsSnapshot.upsert({
    where: { id: GITHUB_STATS_SNAPSHOT_ID },
    create: {
      data: stats as Prisma.InputJsonValue,
      id: GITHUB_STATS_SNAPSHOT_ID,
    },
    update: {
      data: stats as Prisma.InputJsonValue,
    },
  });

  return stats;
}

export async function getCachedGithubStats(): Promise<GithubStatsData> {
  try {
    const snapshot = await db.githubStatsSnapshot.findUnique({
      where: { id: GITHUB_STATS_SNAPSHOT_ID },
    });

    if (snapshot) {
      const cachedStats = snapshot.data as Partial<GithubStatsData>;

      // Older snapshots predate the contribution calendar. Refresh them once so
      // the UI can rely on the current data contract without crashing.
      if (
        !Array.isArray(cachedStats.contributionDays) ||
        !Array.isArray(cachedStats.repositoryStats)
      ) {
        return refreshGithubStats();
      }

      return snapshot.data as GithubStatsData;
    }

    return refreshGithubStats();
  } catch {
    return getGithubStats();
  }
}

export async function disconnectGithubStatsCache() {
  await db.$disconnect();
}
