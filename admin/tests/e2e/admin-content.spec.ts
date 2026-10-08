import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Pool } from "pg";
import { test, expect, request } from "@playwright/test";

function decodeBase32(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.replace(/=+$/, "").toUpperCase()) {
    const value = alphabet.indexOf(char);
    if (value < 0) throw new Error("Invalid TOTP secret.");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function currentTotp(secret: string) {
  const counter = BigInt(Math.floor(Date.now() / 30_000));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(counter);
  const digest = createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

const liveContent = {
  aboutMe: [],
  projects: [{
    id: "cms-e2e-project",
    title: "Draft project title",
    descriptionDe: "Beschreibung des Entwurfs",
    descriptionEn: "Draft description",
    image: null,
    url: "https://example.test/project",
    tags: "TypeScript, Next.js, Webentwicklung, PostgreSQL, Tests, CI/CD",
    visible: true,
    series: 1,
  }],
  skills: [],
  experience: [],
  contactEmail: [],
};

test("MFA-gated editor previews private drafts and publishes or discards them", async ({ browser }) => {
  const origin = "http://127.0.0.1:3001";
  let api = await request.newContext({ baseURL: origin });
  const anonymousPreview = await api.get("/preview", { maxRedirects: 0 });
  expect(anonymousPreview.status()).toBe(307);
  expect(anonymousPreview.headers().location).toContain("/login");
  expect((await api.get("/api/content")).status()).toBe(401);
  expect((await api.post("/api/content/discard")).status()).toBe(403);
  expect((await api.post("/api/content/discard", {
    headers: { origin: "https://attacker.example.test" },
  })).status()).toBe(403);

  const bootstrap = await api.post("/api/auth/sign-up/email", {
    headers: {
      origin,
      "x-admin-bootstrap-token": process.env.ADMIN_BOOTSTRAP_TOKEN!,
    },
    data: {
      name: "CMS Integration Test",
      email: process.env.ADMIN_EMAIL!,
      password: "Integration-Test-Password-2026!",
    },
  });
  expect(bootstrap.ok()).toBeTruthy();
  expect((await api.get("/api/content")).status()).toBe(401);

  const enrollment = await api.post("/api/auth/two-factor/enable", {
    headers: { origin },
    data: { password: "Integration-Test-Password-2026!", method: "totp" },
  });
  expect(enrollment.ok(), await enrollment.text()).toBeTruthy();
  const enrollmentData = await enrollment.json();
  assert.ok(Array.isArray(enrollmentData.backupCodes));
  assert.equal(enrollmentData.backupCodes.length, 10);
  const recoveryCode = enrollmentData.backupCodes[0] as string;
  const totpSecret = new URL(enrollmentData.totpURI).searchParams.get("secret");
  assert.ok(totpSecret);
  const enrollmentVerification = await api.post("/api/auth/two-factor/verify-totp", {
    headers: { origin },
    data: { code: currentTotp(totpSecret) },
  });
  expect(enrollmentVerification.ok()).toBeTruthy();
  const signOut = await api.post("/api/auth/sign-out", { headers: { origin }, data: {} });
  expect(signOut.ok(), await signOut.text()).toBeTruthy();
  await api.dispose();
  api = await request.newContext({ baseURL: origin });
  expect((await api.get("/api/content")).status()).toBe(401);
  const failedLogin = await api.post("/api/auth/sign-in/email", {
    headers: { origin },
    data: { email: process.env.ADMIN_EMAIL!, password: "Incorrect-password-for-audit-test!" },
  });
  expect(failedLogin.ok()).toBeFalsy();
  const signIn = await api.post("/api/auth/sign-in/email", {
    headers: { origin },
    data: { email: process.env.ADMIN_EMAIL!, password: "Integration-Test-Password-2026!" },
  });
  expect(signIn.ok()).toBeTruthy();
  expect((await signIn.json()).twoFactorRedirect).toBe(true);
  expect((await api.get("/api/content")).status()).toBe(401);
  const secondFactor = await api.post("/api/auth/two-factor/verify-totp", {
    headers: { origin },
    data: { code: currentTotp(totpSecret) },
  });
  expect(secondFactor.ok()).toBeTruthy();
  expect((await api.get("/api/content")).ok()).toBeTruthy();

  const save = await api.put("/api/content", {
    headers: { origin: origin },
    data: { expectedVersion: 0, sourceVersion: 0, content: liveContent },
  });
  expect(save.ok()).toBeTruthy();
  const stillPublished = await api.get("http://127.0.0.1:4010/api/admin/content", {
    headers: { authorization: `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}` },
  });
  expect((await stillPublished.json()).content.projects[0].title).toBe("Published project title");
  const preview = await api.get("/preview");
  expect(preview.ok()).toBeTruthy();
  expect(await preview.text()).toContain("Draft project title");

  const publish = await api.post("/api/content/publish", { headers: { origin } });
  expect(publish.ok()).toBeTruthy();
  const published = await publish.json();
  expect(published.publishedVersion).toBe(1);
  expect(published.publishedAt).toBeTruthy();
  const nowPublished = await api.get("http://127.0.0.1:4010/api/admin/content", {
    headers: { authorization: `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}` },
  });
  expect((await nowPublished.json()).content.projects[0].title).toBe("Draft project title");
  expect((await api.post("/api/content/publish", { headers: { origin } })).status()).toBe(409);

  const state = await (await api.get("/api/content")).json();
  expect(state.publishedDraftVersion).toBe(state.draftVersion);
  expect(state.currentPublishedVersion).toBe(1);

  const nextDraft = {
    ...liveContent,
    projects: [{ ...liveContent.projects[0], title: "Discarded project title" }],
  };
  const saveNext = await api.put("/api/content", {
    headers: { origin },
    data: { expectedVersion: state.draftVersion, sourceVersion: 1, content: nextDraft },
  });
  expect(saveNext.ok(), await saveNext.text()).toBeTruthy();
  expect(await (await api.get("/preview")).text()).toContain("Discarded project title");
  const remainsPublished = await api.get("http://127.0.0.1:4010/api/admin/content", {
    headers: { authorization: `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}` },
  });
  expect((await remainsPublished.json()).content.projects[0].title).toBe("Draft project title");
  expect((await api.post("/api/content/discard", { headers: { origin } })).ok()).toBeTruthy();
  expect(await (await api.get("/preview")).text()).toContain("Draft project title");

  const browserContext = await browser.newContext({ storageState: await api.storageState() });
  const adminPage = await browserContext.newPage();
  await adminPage.goto("/admin");
  await expect(adminPage.getByText("MFA wurde bestätigt.")).toBeVisible();
  await browserContext.close();

  await api.post("/api/auth/sign-out", { headers: { origin }, data: {} });
  const recoverySignIn = await api.post("/api/auth/sign-in/email", {
    headers: { origin },
    data: { email: process.env.ADMIN_EMAIL!, password: "Integration-Test-Password-2026!" },
  });
  expect((await recoverySignIn.json()).twoFactorRedirect).toBe(true);
  const recoveryVerification = await api.post("/api/auth/two-factor/verify-backup-code", {
    headers: { origin },
    data: { code: recoveryCode },
  });
  expect(recoveryVerification.ok(), await recoveryVerification.text()).toBeTruthy();
  expect((await api.get("/api/content")).ok()).toBeTruthy();

  const reusedCode = await api.post("/api/auth/two-factor/verify-backup-code", {
    headers: { origin },
    data: { code: recoveryCode },
  });
  expect(reusedCode.ok()).toBeFalsy();
  expect((await api.get("/api/content")).ok()).toBeTruthy();

  const auditDb = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
  try {
    const audit = await auditDb.query<{ action: string }>(
      "SELECT action FROM admin_audit_log WHERE action IN ('auth.login_attempt', 'auth.mfa_succeeded')",
    );
    expect(audit.rows.filter((row) => row.action === "auth.login_attempt").length).toBeGreaterThanOrEqual(3);
    expect(audit.rows.some((row) => row.action === "auth.mfa_succeeded")).toBe(true);
    const storedRecoveryCodes = await auditDb.query<{ backup_codes: string }>(
      'SELECT tf."backupCodes" AS backup_codes FROM "twoFactor" tf JOIN "user" u ON u.id = tf."userId" WHERE u.email = $1',
      [process.env.ADMIN_EMAIL],
    );
    expect(storedRecoveryCodes.rows).toHaveLength(1);
    expect(storedRecoveryCodes.rows[0].backup_codes).not.toContain(recoveryCode);
  } finally {
    await auditDb.end();
  }
  await api.dispose();
});
