import { createHash } from "node:crypto";

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((key) => JSON.stringify(key) + ":" + canonicalJson(record[key]));
    return "{" + entries.join(",") + "}";
  }
  return JSON.stringify(value) ?? "null";
}

export function createContentPublishIdempotencyKey(expectedVersion: number, content: unknown): string {
  return createHash("sha256")
    .update(`portfolio-publish-v1\n${expectedVersion}\n${canonicalJson(content)}`)
    .digest("hex");
}
