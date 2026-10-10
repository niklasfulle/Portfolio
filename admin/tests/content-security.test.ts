import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { contentSchema } from "@/lib/admin-content-schema";
import { hasMfaEnabledSession, isAdminRole } from "@admin/lib/session-policy";
import { isTrustedMutationOrigin } from "@admin/lib/csrf";
import { ADMIN_MUTATION_LIMIT, isAdminMutationRateLimited } from "@admin/lib/mutation-rate-limit";

const originalAdminOrigin = process.env.ADMIN_APP_ORIGIN;

afterEach(() => {
  if (originalAdminOrigin === undefined) delete process.env.ADMIN_APP_ORIGIN;
  else process.env.ADMIN_APP_ORIGIN = originalAdminOrigin;
});

function validContent() {
  return {
    aboutMe: [],
    projects: [{
      id: "project-1",
      title: "Example",
      descriptionDe: "Beschreibung",
      descriptionEn: "Description",
      image: "https://images.example.test/project.png",
      url: "/projects/example",
      tags: "TypeScript, Next.js, Webentwicklung, Tests, CI/CD, PostgreSQL",
      visible: true,
      series: 1,
    }],
    skills: [],
    experience: [],
    contactEmail: [],
  };
}

test("content schema accepts normal HTTPS and same-site project links", () => {
  assert.equal(contentSchema.safeParse(validContent()).success, true);
});

test("content schema requires at least six non-empty project key points", () => {
  const content = validContent();
  content.projects[0].tags = "TypeScript, Next.js, Webentwicklung, CI/CD, Docker";
  assert.equal(contentSchema.safeParse(content).success, false);
  content.projects[0].tags = "TypeScript, Next.js, Webentwicklung, CI/CD, Docker, PostgreSQL";
  assert.equal(contentSchema.safeParse(content).success, true);
});

test("content schema rejects executable and protocol-relative asset URLs", () => {
  const executable = validContent();
  executable.projects[0].image = "javascript:alert(1)";
  assert.equal(contentSchema.safeParse(executable).success, false);

  const protocolRelative = validContent();
  protocolRelative.projects[0].url = "//attacker.example/path";
  assert.equal(contentSchema.safeParse(protocolRelative).success, false);
});

test("content schema rejects duplicate entry IDs within a section", () => {
  const content = validContent();
  content.projects.push({ ...content.projects[0], title: "Duplicate" });
  assert.equal(contentSchema.safeParse(content).success, false);
});

test("admin session is accepted only after MFA enrollment", () => {
  assert.equal(hasMfaEnabledSession({ user: { twoFactorEnabled: true } }), true);
  assert.equal(hasMfaEnabledSession({ user: { twoFactorEnabled: false } }), false);
  assert.equal(hasMfaEnabledSession(null), false);
});

test("only a persisted admin role grants admin authorization", () => {
  assert.equal(isAdminRole("admin"), true);
  assert.equal(isAdminRole("user"), false);
  assert.equal(isAdminRole(undefined), false);
});

test("admin mutations are accepted through the configured limit and throttled after it", () => {
  assert.equal(isAdminMutationRateLimited(ADMIN_MUTATION_LIMIT), false);
  assert.equal(isAdminMutationRateLimited(ADMIN_MUTATION_LIMIT + 1), true);
});

test("mutation origin accepts only the configured admin origin", () => {
  process.env.ADMIN_APP_ORIGIN = "https://admin.example.test/";
  assert.equal(
    isTrustedMutationOrigin(new Request("https://admin.example.test/api/content", {
      method: "PUT",
      headers: { origin: "https://admin.example.test" },
    })),
    true,
  );
  assert.equal(
    isTrustedMutationOrigin(new Request("https://admin.example.test/api/content", {
      method: "PUT",
      headers: { origin: "https://evil.example.test" },
    })),
    false,
  );
});

test("mutation origin fails closed when origin or configuration is missing", () => {
  process.env.ADMIN_APP_ORIGIN = "https://admin.example.test";
  assert.equal(isTrustedMutationOrigin(new Request("https://admin.example.test/api/content", { method: "PUT" })), false);
  delete process.env.ADMIN_APP_ORIGIN;
  assert.equal(
    isTrustedMutationOrigin(new Request("https://admin.example.test/api/content", {
      method: "PUT",
      headers: { origin: "https://admin.example.test" },
    })),
    false,
  );
});
