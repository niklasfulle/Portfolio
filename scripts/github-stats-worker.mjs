import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getGithubStats } from "../src/lib/github-stats.ts";

const refreshIntervalMs = 15 * 60 * 1000;
const snapshotId = "github";
const connectionString = process.env.POSTGRESQL_URL;
const githubToken = process.env.GITHUB_TOKEN;

if (!connectionString) {
  throw new Error("POSTGRESQL_URL must be set");
}
if (!githubToken) {
  throw new Error("GITHUB_TOKEN must be set for authenticated statistics refreshes");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });
let refreshInProgress = false;
const runOnce = process.argv.includes("--once");

async function refresh() {
  if (refreshInProgress) return false;

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
    return true;
  } catch (error) {
    console.error("[github-stats-worker] Snapshot refresh failed", error);
    return false;
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

const initialRefreshSucceeded = await refresh();
if (runOnce) {
  await db.$disconnect();
  process.exit(initialRefreshSucceeded ? 0 : 1);
}

setInterval(() => void refresh(), refreshIntervalMs);
