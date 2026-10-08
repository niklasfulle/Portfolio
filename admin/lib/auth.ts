
import { timingSafeEqual } from "node:crypto";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { getAdminDatabase } from "@admin/lib/database";

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

function createAuthInstance() {
  const authSecret = requiredEnvironment("BETTER_AUTH_SECRET");
  if (authSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }

  const baseURL = requiredEnvironment("BETTER_AUTH_URL");
  const trustedOrigin = requiredEnvironment("ADMIN_APP_ORIGIN");
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (!baseURL.startsWith("https://") || !trustedOrigin.startsWith("https://"))) {
    throw new Error("BETTER_AUTH_URL and ADMIN_APP_ORIGIN must use HTTPS in production.");
  }
  const database = getAdminDatabase();

  return betterAuth({
    appName: "Portfolio Admin",
    baseURL,
    secret: authSecret,
    database,
    trustedOrigins: [trustedOrigin],
    emailAndPassword: {
      enabled: true,
      // Registration is restricted to the one-time bootstrap hook below.
      disableSignUp: false,
      minPasswordLength: 14,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 8,
      updateAge: 60 * 30,
    },
    advanced: {
      useSecureCookies: isProduction,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/",
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 10,
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path === "/sign-in/email") {
          await database.query(
            "INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)",
            ["unknown", "auth.login_attempt"],
          );
          return;
        }
        if (context.path !== "/sign-up/email") return;

        const configuredToken = process.env.ADMIN_BOOTSTRAP_TOKEN ?? "";
        const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
        const suppliedToken = context.headers?.get("x-admin-bootstrap-token") ?? "";
        const expected = Buffer.from(configuredToken);
        const supplied = Buffer.from(suppliedToken);
        const tokenMatches = expected.length >= 32 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
        const requestedEmail = typeof context.body?.email === "string"
          ? context.body.email.trim().toLowerCase()
          : "";

        if (!tokenMatches || requestedEmail !== configuredEmail) {
          throw new APIError("FORBIDDEN", { message: "Admin bootstrap is unavailable." });
        }

        const existingAdmin = await database.query('SELECT 1 FROM "user" LIMIT 1');
        if (existingAdmin.rowCount) {
          throw new APIError("FORBIDDEN", { message: "Admin bootstrap is unavailable." });
        }
      }),
      after: createAuthMiddleware(async (context) => {
        const actionByPath: Record<string, string> = {
          "/two-factor/verify-totp": "auth.mfa_succeeded",
          "/two-factor/verify-backup-code": "auth.mfa_succeeded",
          "/two-factor/enable": "auth.mfa_enabled",
          "/two-factor/disable": "auth.mfa_disabled",
          "/sign-out": "auth.logout",
        };
        const action = actionByPath[context.path];
        if (!action) return;
        const actor = context.context.newSession?.user.id ?? context.context.session?.user.id ?? "unknown";
        await database.query(
          "INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)",
          [actor, action],
        );
      }),
    },
    plugins: [
      twoFactor({
        issuer: "Portfolio Admin",
        backupCodes: { amount: 10, length: 10, storeBackupCodes: "encrypted" },
      }),
    ],
    telemetry: { enabled: false },
  });
}

let authInstance: ReturnType<typeof createAuthInstance> | undefined;

export function getAuth() {
  if (!authInstance) authInstance = createAuthInstance();
  return authInstance;
}
