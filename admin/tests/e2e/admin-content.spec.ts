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

function assertIsolatedAdminDatabase() {
  const databaseUrl = process.env.ADMIN_DATABASE_URL;
  if (!databaseUrl) throw new Error("E2E tests require an isolated ADMIN_DATABASE_URL ending in _test.");

  const database = new URL(databaseUrl);
  const databaseName = decodeURIComponent(database.pathname.slice(1));
  if (!["localhost", "127.0.0.1", "::1", "db"].includes(database.hostname) || !databaseName.endsWith("_test")) {
    throw new Error("E2E tests are allowed only against a local database whose name ends in _test.");
  }
}

assertIsolatedAdminDatabase();

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
  const origin = `http://127.0.0.1:${process.env.ADMIN_E2E_PORT ?? "3001"}`;
  const contentApiUrl = `http://127.0.0.1:${process.env.PORTFOLIO_MOCK_API_PORT ?? "4010"}/api/admin/content`;
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

  const setupContext = await browser.newContext({ storageState: await api.storageState() });
  const setupPage = await setupContext.newPage();
  await setupPage.goto(`${origin}/two-factor/setup`);
  await setupPage.getByLabel("Passwort").fill("Integration-Test-Password-2026!");
  await setupPage.getByRole("button", { name: "MFA-Schlüssel erstellen" }).click();
  await expect(setupPage.getByRole("img", { name: "QR-Code für die Authenticator-App" })).toBeVisible();
  await setupPage.getByText("Manuelle Einrichtung anzeigen").click();
  const enrollmentUri = await setupPage.locator("code.secret-value").textContent();
  assert.ok(enrollmentUri);
  const backupCodes = await setupPage.locator(".recovery-list code").allTextContents();
  assert.equal(backupCodes.length, 10);
  const recoveryCode = backupCodes[0];
  const totpSecret = new URL(enrollmentUri).searchParams.get("secret");
  assert.ok(totpSecret);
  await setupPage.getByLabel("Code aus der App").fill(currentTotp(totpSecret));
  await setupPage.getByRole("button", { name: "MFA bestätigen" }).click();
  await expect(setupPage.getByRole("heading", { name: "Inhalte verwalten" })).toBeVisible();
  await setupContext.close();
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

  const invalidDraft = {
    ...liveContent,
    projects: [{ ...liveContent.projects[0], tags: "TypeScript, Next.js" }],
  };
  const rejectedDraft = await api.put("/api/content", {
    headers: { origin },
    data: { expectedVersion: 0, sourceVersion: 0, content: invalidDraft },
  });
  expect(rejectedDraft.status()).toBe(400);
  expect(await rejectedDraft.json()).toMatchObject({
    message: "Bitte korrigiere die markierten Eingaben.",
    issues: [{ field: "tags", message: "Mindestens sechs Stichpunkte eintragen." }],
  });

  const save = await api.put("/api/content", {
    headers: { origin: origin },
    data: { expectedVersion: 0, sourceVersion: 0, content: liveContent },
  });
  expect(save.ok()).toBeTruthy();
  const stillPublished = await api.get(contentApiUrl, {
    headers: { authorization: `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}` },
  });
  expect((await stillPublished.json()).content.projects[0].title).toBe("Published project title");
  const preview = await api.get("/preview");
  expect(preview.ok()).toBeTruthy();
  expect(preview.headers()["cache-control"]).toContain("no-store");
  expect(preview.headers()["x-robots-tag"]).toContain("noindex");
  const previewHtml = await preview.text();
  expect(previewHtml).toContain('name="robots"');
  expect(previewHtml).toContain("noindex");
  expect(previewHtml).toContain("Draft project title");

  const publish = await api.post("/api/content/publish", { headers: { origin } });
  expect(publish.ok()).toBeTruthy();
  const published = await publish.json();
  expect(published.publishedVersion).toBe(1);
  expect(published.publishedAt).toBeTruthy();
  const nowPublished = await api.get(contentApiUrl, {
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
  const remainsPublished = await api.get(contentApiUrl, {
    headers: { authorization: `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}` },
  });
  expect((await remainsPublished.json()).content.projects[0].title).toBe("Draft project title");
  expect((await api.post("/api/content/discard", { headers: { origin } })).ok()).toBeTruthy();
  expect(await (await api.get("/preview")).text()).toContain("Draft project title");

  const browserContext = await browser.newContext({ storageState: await api.storageState() });
  const adminPage = await browserContext.newPage();
  await adminPage.goto("/admin");
  await expect(adminPage.getByRole("heading", { name: "Inhalte verwalten" })).toBeVisible();
  await expect(adminPage.locator(".dashboard-shell .content-manager")).toBeVisible();
  await expect(adminPage.locator(".dashboard-shell > .auth-card")).toHaveCount(0);
  await expect(adminPage.getByRole("link", { name: /Vorschau/ })).toHaveCount(1);
  await expect(adminPage.locator(".dashboard-account-chip")).toHaveCount(1);
  await expect(adminPage.locator(".sidebar-account")).toHaveCount(0);

  const projectCards = adminPage.locator(".editor-item");
  await expect(projectCards).toHaveCount(1);
  await adminPage.getByRole("button", { name: /Eintrag hinzufügen/ }).click();
  await expect(projectCards).toHaveCount(2);
  await expect(adminPage.getByRole("button", { name: "Entwurf speichern" })).toHaveCount(1);
  await expect(adminPage.getByRole("button", { name: "Veröffentlichen" })).toHaveCount(0);
  await expect(adminPage.locator(".editor-secondary-actions")).toHaveCount(0);

  const moveUp = projectCards.nth(1).getByRole("button", { name: "Eintrag nach oben verschieben" });
  await moveUp.focus();
  await moveUp.press("Enter");
  await expect(projectCards.nth(0).locator("legend")).toHaveText("Eintrag");
  await expect(projectCards.nth(1).locator("legend")).toHaveText("Draft project title");
  await expect(projectCards.nth(0).getByRole("button", { name: "Eintrag nach oben verschieben" })).toBeDisabled();
  await expect(projectCards.nth(1).getByRole("button", { name: "Draft project title nach unten verschieben" })).toBeDisabled();

  const invalidTags = projectCards.nth(1).locator('input[name$=".tags"]');
  await invalidTags.fill("TypeScript, Next.js");
  await adminPage.getByRole("button", { name: "Entwurf speichern" }).click();
  await expect(adminPage.locator(".editor-status[role='alert']")).toContainText(
    "Bitte korrigiere die markierten Eingaben.",
  );
  await expect(invalidTags).toHaveAttribute("aria-invalid", "true");
  const describedBy = (await invalidTags.getAttribute("aria-describedby"))?.split(/\s+/) ?? [];
  expect(describedBy.some((id) => id.endsWith("-hint"))).toBe(true);
  const errorId = describedBy.find((id) => id.endsWith("-error"));
  expect(errorId).toBeTruthy();
  await expect(adminPage.locator(`[id="${errorId}"]`)).toHaveText("Mindestens sechs Stichpunkte eintragen.");
  await browserContext.close();

  const mobileContext = await browser.newContext({
    storageState: await api.storageState(),
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("/admin");
  await expect(mobilePage.getByRole("heading", { name: "Inhalte verwalten" })).toBeVisible();
  await expect(mobilePage.getByRole("button", { name: /Eintrag hinzufügen/ })).toBeVisible();
  expect(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await mobileContext.close();

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

  const armConnectionFailure = await api.post(
    `http://127.0.0.1:${process.env.PORTFOLIO_MOCK_API_PORT ?? "4010"}/_test/fail-next-read`,
  );
  expect(armConnectionFailure.ok()).toBeTruthy();
  const unavailableContent = await api.get("/api/content");
  expect(unavailableContent.status()).toBe(502);
  expect(await unavailableContent.json()).toEqual({ message: "Portfolio content could not be loaded." });

  const armPreviewFailure = await api.post(
    `http://127.0.0.1:${process.env.PORTFOLIO_MOCK_API_PORT ?? "4010"}/_test/fail-next-read`,
  );
  expect(armPreviewFailure.ok()).toBeTruthy();
  const unavailablePreview = await api.get("/preview");
  expect(unavailablePreview.ok()).toBeTruthy();
  expect(await unavailablePreview.text()).toContain("Vorschau nicht verfügbar");

  const auditDb = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
  try {
    const audit = await auditDb.query<{ action: string }>(
      "SELECT action FROM admin_audit_log WHERE action IN ('auth.login_attempt', 'auth.login_succeeded', 'auth.mfa_attempt', 'auth.mfa_succeeded')",
    );
    expect(audit.rows.filter((row) => row.action === "auth.login_attempt").length).toBeGreaterThanOrEqual(3);
    expect(audit.rows.filter((row) => row.action === "auth.login_succeeded").length).toBeGreaterThanOrEqual(2);
    expect(audit.rows.filter((row) => row.action === "auth.mfa_attempt").length).toBeGreaterThanOrEqual(3);
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
