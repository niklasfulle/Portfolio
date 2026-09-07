#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const binDirectory = path.join(projectRoot, "node_modules", ".bin");

const sonarHostUrl = process.env.SONAR_HOST_URL ?? process.argv[2];
const projectKey =
  process.env.SONAR_PROJECT_KEY ?? process.argv[3] ?? "Portfolio";
const sonarToken = process.env.SONAR_TOKEN;

if (!sonarHostUrl || !/^https?:\/\/[^\s]+$/.test(sonarHostUrl)) {
  fail(
    "SONAR_HOST_URL muss gesetzt sein, zum Beispiel https://sonarqube.example.com."
  );
}

if (!sonarToken) {
  fail("SONAR_TOKEN muss als Umgebungsvariable gesetzt sein.");
}

const jest = localBinary("jest");
const scanner = localBinary("sonar-scanner-npm");

console.log("Erzeuge LCOV-Coverage mit Jest ...");
run(jest, [
  "--coverage",
  "--coverageReporters=lcov",
  "--coverageReporters=text-summary",
  "--runInBand",
]);

const coveragePath = path.join(projectRoot, "coverage", "lcov.info");
if (!existsSync(coveragePath)) {
  fail(`LCOV-Datei wurde nicht erzeugt: ${coveragePath}`);
}

console.log(`Starte SonarQube-Analyse für '${projectKey}' ...`);
run(
  scanner,
  [`-Dsonar.host.url=${sonarHostUrl}`, `-Dsonar.projectKey=${projectKey}`],
  { SONAR_TOKEN: sonarToken }
);

console.log("SonarQube-Analyse erfolgreich abgeschlossen.");

function localBinary(name) {
  const binary = path.join(binDirectory, `${name}${isWindows ? ".cmd" : ""}`);
  if (!existsSync(binary)) {
    fail(`Lokales Tool wurde nicht gefunden: ${binary}. Führe yarn install aus.`);
  }
  return binary;
}

function run(command, args, extraEnvironment = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, ...extraEnvironment },
    stdio: "inherit",
    shell: isWindows,
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function fail(message) {
  console.error(`SonarQube-Scan abgebrochen: ${message}`);
  process.exit(1);
}
