import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getGithubStats } from "../src/lib/github-stats.ts";

const refreshIntervalMs = 15 * 60 * 1000;
const snapshotId = "github";
const connectionString = process.env.POSTGRESQL_URL;

if (!connectionString) {
  throw new Error("POSTGRESQL_URL must be set");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });
let refreshInProgress = false;

async function refresh() {
  if (refreshInProgress) return;

  refreshInProgress = true;

  try {
    const stats = await getGithubStats();
    await db.githubStatsSnapshot.upsert({
      where: { id: snapshotId },
      create: { data: stats, id: snapshotId },
      update: { data: stats },
    });
    console.info(
      `[github-stats-worker] Snapshot refreshed: ${stats.totalContributions} contributions`
    );
  } catch (error) {
    console.error("[github-stats-worker] Snapshot refresh failed", error);
  } finally {
    refreshInProgress = false;
  }
}

async function shutdown() {
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await refresh();
setInterval(() => void refresh(), refreshIntervalMs);
