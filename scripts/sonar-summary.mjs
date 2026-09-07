#!/usr/bin/env node

const [hostArgument, projectArgument] = process.argv.slice(2);
const sonarHostUrl = process.env.SONAR_HOST_URL ?? hostArgument;
const projectKey = process.env.SONAR_PROJECT_KEY ?? projectArgument ?? "Portfolio";
const sonarToken = process.env.SONAR_TOKEN;

if (!sonarHostUrl || !isHttpUrl(sonarHostUrl)) {
  fail("Eine gültige SonarQube-URL muss als Argument oder SONAR_HOST_URL gesetzt sein.");
}

if (!sonarToken) {
  fail("SONAR_TOKEN muss als Umgebungsvariable gesetzt sein.");
}

const serverUrl = new URL(`${sonarHostUrl.replace(/\/$/, "")}/`);
const authorization = `Basic ${Buffer.from(`${sonarToken}:`).toString("base64")}`;
const metricLabels = {
  bugs: "Bugs",
  vulnerabilities: "Vulnerabilities",
  security_hotspots: "Security Hotspots",
  code_smells: "Code Smells",
  coverage: "Coverage (%)",
  duplicated_lines_density: "Duplikate (%)",
  ncloc: "Lines of Code",
};

try {
  const [qualityGate, measures, issues] = await Promise.all([
    request("api/qualitygates/project_status", { projectKey }),
    request("api/measures/component", {
      component: projectKey,
      metricKeys: [
        "bugs",
        "vulnerabilities",
        "security_hotspots",
        "code_smells",
        "coverage",
        "duplicated_lines_density",
        "ncloc",
      ].join(","),
    }),
    request("api/issues/search", {
      componentKeys: projectKey,
      resolved: "false",
      ps: "1",
    }),
  ]);

  printSummary(qualityGate.projectStatus, measures.component, issues);
} catch (error) {
  fail(error instanceof Error ? error.message : "Unbekannter API-Fehler.");
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function request(pathname, parameters) {
  const url = new URL(pathname, serverUrl);

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: authorization,
    },
  });

  if (!response.ok) {
    throw new Error(`SonarQube API ${pathname} antwortete mit HTTP ${response.status}.`);
  }

  return response.json();
}

function printSummary(projectStatus, component, issues) {
  const status = projectStatus?.status ?? "UNKNOWN";
  const statusLabel = {
    OK: "✅ PASSED",
    ERROR: "❌ FAILED",
    WARN: "⚠️ WARNING",
    IN_PROGRESS: "⏳ IN PROGRESS",
  }[status] ?? `ℹ️ ${status}`;

  console.log(`\nSonarQube-Übersicht für '${projectKey}'`);
  console.log(`Quality Gate: ${statusLabel}`);

  const conditions = projectStatus?.conditions ?? [];
  if (conditions.length > 0) {
    console.log("Quality-Gate-Bedingungen:");
    for (const condition of conditions) {
      const conditionStatus = condition.status === "OK" ? "✅" : "❌";
      const metric = metricLabels[condition.metricKey] ?? condition.metricKey;
      const actual = condition.actualValue ?? "nicht verfügbar";
      const threshold = condition.errorThreshold ?? "nicht verfügbar";
      console.log(`  ${conditionStatus} ${metric}: ${actual} (Grenzwert ${threshold})`);
    }
  }

  const measureValues = new Map(
    (component?.measures ?? []).map((measure) => [measure.metric, measure.value])
  );
  console.log("Kennzahlen:");
  for (const metric of [
    "bugs",
    "vulnerabilities",
    "security_hotspots",
    "code_smells",
    "coverage",
    "duplicated_lines_density",
    "ncloc",
  ]) {
    console.log(`  ${metricLabels[metric] ?? metric}: ${measureValues.get(metric) ?? "nicht verfügbar"}`);
  }

  console.log(`Offene Issues: ${issues?.total ?? "nicht verfügbar"}`);
  console.log("");
}

function fail(message) {
  console.error(`SonarQube-Übersicht abgebrochen: ${message}`);
  process.exit(1);
}
