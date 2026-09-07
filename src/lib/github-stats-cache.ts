import type { Prisma } from "@prisma/client";
import { getGithubStats, type GithubStatsData } from "./github-stats";
import { db } from "./db/prisma";

const GITHUB_STATS_SNAPSHOT_ID = "github";

export async function refreshGithubStats(): Promise<GithubStatsData> {
  const stats = await getGithubStats();

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

    if (snapshot) return snapshot.data as GithubStatsData;

    return refreshGithubStats();
  } catch {
    return getGithubStats();
  }
}

export async function disconnectGithubStatsCache() {
  await db.$disconnect();
}
