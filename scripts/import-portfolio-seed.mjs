import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(
  process.env.PORTFOLIO_SEED_FILE ?? resolve(scriptDirectory, "../.local/portfolio-seed.json"),
);
const apiUrl = process.env.PORTFOLIO_SEED_API_URL;
const apiToken = process.env.ADMIN_CONTENT_API_TOKEN;

let seed;
try {
  seed = JSON.parse(await readFile(seedPath, "utf8"));
} catch (error) {
  if (error.code === "ENOENT") {
    process.stdout.write("No local portfolio seed found; startup seed attempt skipped.\n");
    process.exit(0);
  }
  process.stderr.write("Could not read the local portfolio seed; startup continues without seeding.\n");
  process.exit(0);
}

if (seed.formatVersion !== 1 || !apiUrl || !apiToken || apiToken.length < 32) {
  process.stderr.write("Portfolio seed API configuration or seed format is invalid; startup continues.\n");
  process.exit(0);
}

const maxAttempts = 20;
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(seed),
      signal: AbortSignal.timeout(2_000),
    });

    if (response.ok) {
      const result = await response.json();
      process.stdout.write(`Portfolio seed startup attempt: ${result.status ?? "completed"}.\n`);
      process.exit(0);
    }

    if (response.status < 500) {
      process.stderr.write(`Portfolio seed startup attempt returned HTTP ${response.status}; startup continues.\n`);
      process.exit(0);
    }
  } catch {
    // The portfolio server may still be starting; retry without logging request data.
  }

  if (attempt < maxAttempts) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000));
  }
}

process.stderr.write("Portfolio seed API stayed unavailable; admin startup continues without seeding.\n");
