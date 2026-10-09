import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const expectedContainerId =
  "8375ca34b7fee092064774da9b0bc01c7987ef5bfb49510fb232ec8088847a5e";
const container = process.env.PORTFOLIO_SEED_SOURCE ?? expectedContainerId;
const outputPath = resolve(
  process.env.PORTFOLIO_SEED_FILE ?? ".local/portfolio-seed.json",
);
const force = process.argv.includes("--force");

const inspect = spawnSync(
  "docker",
  [
    "inspect",
    "--format",
    "{{.Id}}|{{.State.Status}}|{{index .Config.Labels \"com.docker.compose.project\"}}|{{index .Config.Labels \"com.docker.compose.service\"}}",
    container,
  ],
  { encoding: "utf8" },
);

if (inspect.status !== 0) {
  throw new Error("Could not inspect the selected Docker database container.");
}

const [containerId, state, composeProject, composeService] = inspect.stdout
  .trim()
  .split("|");

if (
  state !== "running" ||
  composeProject !== "portfolio" ||
  composeService !== "db"
) {
  throw new Error(
    "Seed export is restricted to the running Portfolio Compose db service.",
  );
}

if (container === expectedContainerId && containerId !== expectedContainerId) {
  throw new Error("The container ID does not match the requested source.");
}

const query = `SELECT jsonb_build_object(
  'aboutMe', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "AboutMe" AS row_data), '[]'::jsonb),
  'projects', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "Projects" AS row_data), '[]'::jsonb),
  'skills', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "Skills" AS row_data), '[]'::jsonb),
  'experience', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "Experience" AS row_data), '[]'::jsonb),
  'contactEmail', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "ContactEmail" AS row_data), '[]'::jsonb),
  'githubStatsSnapshot', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "GithubStatsSnapshot" AS row_data), '[]'::jsonb),
  'contentVersion', COALESCE((SELECT jsonb_agg(to_jsonb(row_data) ORDER BY id) FROM "PortfolioContentVersion" AS row_data), '[]'::jsonb)
)::text;`;

const exported = spawnSync(
  "docker",
  [
    "exec",
    container,
    "psql",
    "-XAtq",
    "-U",
    "portfolio",
    "-d",
    "portfolio",
    "-c",
    query,
  ],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);

if (exported.status !== 0) {
  throw new Error("Database seed export failed; no seed file was written.");
}

let data;
try {
  data = JSON.parse(exported.stdout.trim());
} catch {
  throw new Error("Database returned an invalid seed document.");
}

const seed = {
  formatVersion: 1,
  source: "Portfolio PostgreSQL application database",
  exportedAt: new Date().toISOString(),
  ...data,
};

for (const row of seed.githubStatsSnapshot) {
  row.fetchedAt = normalizeDatabaseDate(row.fetchedAt);
}
for (const row of seed.contentVersion) {
  row.updatedAt = normalizeDatabaseDate(row.updatedAt);
}

const counts = Object.fromEntries(
  Object.entries(data).map(([key, rows]) => [key, rows.length]),
);

await mkdir(resolve(outputPath, ".."), { recursive: true });
if (!force) {
  try {
    await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`, {
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(
        `Seed already exists at ${outputPath}. Use --force to replace it intentionally.`,
      );
    }
    throw error;
  }
} else {
  await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`);
}

process.stdout.write(
  `Exported ${Object.values(counts).reduce((total, count) => total + count, 0)} rows to ${outputPath}. Counts: ${JSON.stringify(counts)}\n`,
);

function normalizeDatabaseDate(value) {
  const text = String(value);
  const utcValue = /(?:z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text}Z`;
  const date = new Date(utcValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Database returned an invalid timestamp; no seed file was written.");
  }
  return date.toISOString();
}
