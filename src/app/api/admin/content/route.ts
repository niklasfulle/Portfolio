import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { db } from "@/lib/db/prisma";
import { getCachedGithubStats } from "@/lib/github-stats-cache";
import { contentSchema, updateContentSchema } from "@/lib/admin-content-schema";
import { verifyAdminServiceRequest } from "@/lib/admin-service-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;
class StaleContentVersionError extends Error {}

function authorized(request: Request) {
  const expectedToken = process.env.ADMIN_CONTENT_API_TOKEN ?? "";
  return verifyAdminServiceRequest(expectedToken, request);
}

function unauthorized() {
  return NextResponse.json(
    { message: "Unauthorized" },
    { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } },
  );
}

async function readJsonBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RangeError("Request body is too large");
  }
  if (!request.body) throw new SyntaxError("Request body is missing");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("Request body is too large");
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  return JSON.parse(body) as unknown;
}

export async function GET(request: Request) {
  if (!process.env.ADMIN_CONTENT_API_TOKEN) {
    return NextResponse.json({ message: "Content API unavailable" }, { status: 503 });
  }
  if (!authorized(request)) return unauthorized();

  const [aboutMe, projects, skills, experience, contactEmail, release, githubStats] = await Promise.all([
    db.aboutMe.findMany({ orderBy: { series: "asc" } }),
    db.projects.findMany({ orderBy: { series: "asc" } }),
    db.skills.findMany({ orderBy: { series: "asc" } }),
    db.experience.findMany({ orderBy: { series: "asc" } }),
    db.contactEmail.findMany(),
    db.portfolioContentVersion.findUnique({ where: { id: "main" }, select: { version: true } }),
    getCachedGithubStats(),
  ]);

  return NextResponse.json({
    version: release?.version ?? 0,
    content: { aboutMe, projects, skills, experience, contactEmail },
    githubStats,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!process.env.ADMIN_CONTENT_API_TOKEN) {
    return NextResponse.json({ message: "Content API unavailable" }, { status: 503 });
  }
  if (!authorized(request)) return unauthorized();

  try {
    const update = updateContentSchema.parse(await readJsonBody(request));
    const version = await db.$transaction(async (transaction) => {
      const current = await transaction.portfolioContentVersion.findUnique({
        where: { id: "main" },
        select: { version: true, lastPublishKey: true },
      });
      if (current?.lastPublishKey === update.idempotencyKey) return current.version;

      await transaction.portfolioContentVersion.upsert({
        where: { id: "main" },
        create: { id: "main", version: 0 },
        update: {},
      });
      const claim = await transaction.portfolioContentVersion.updateMany({
        where: { id: "main", version: update.expectedVersion },
        data: {
          version: { increment: 1 },
          lastPublishKey: update.idempotencyKey,
        },
      });
      if (claim.count !== 1) {
        const latest = await transaction.portfolioContentVersion.findUnique({
          where: { id: "main" },
          select: { version: true, lastPublishKey: true },
        });
        if (latest?.lastPublishKey === update.idempotencyKey) return latest.version;
        throw new StaleContentVersionError();
      }

      for (const item of update.content.aboutMe) {
        const { id, ...data } = item;
        await transaction.aboutMe.upsert({ where: { id }, create: item, update: data });
      }
      for (const item of update.content.projects) {
        const { id, ...data } = item;
        await transaction.projects.upsert({ where: { id }, create: item, update: data });
      }
      for (const item of update.content.skills) {
        const { id, ...data } = item;
        await transaction.skills.upsert({ where: { id }, create: item, update: data });
      }
      for (const item of update.content.experience) {
        const { id, ...data } = item;
        await transaction.experience.upsert({ where: { id }, create: item, update: data });
      }
      for (const item of update.content.contactEmail) {
        const { id, ...data } = item;
        await transaction.contactEmail.upsert({ where: { id }, create: item, update: data });
      }

      const aboutMeIds = update.content.aboutMe.map(({ id }) => id);
      const projectIds = update.content.projects.map(({ id }) => id);
      const skillIds = update.content.skills.map(({ id }) => id);
      const experienceIds = update.content.experience.map(({ id }) => id);
      const contactIds = update.content.contactEmail.map(({ id }) => id);
      await transaction.aboutMe.deleteMany(aboutMeIds.length ? { where: { id: { notIn: aboutMeIds } } } : undefined);
      await transaction.projects.deleteMany(projectIds.length ? { where: { id: { notIn: projectIds } } } : undefined);
      await transaction.skills.deleteMany(skillIds.length ? { where: { id: { notIn: skillIds } } } : undefined);
      await transaction.experience.deleteMany(experienceIds.length ? { where: { id: { notIn: experienceIds } } } : undefined);
      await transaction.contactEmail.deleteMany(contactIds.length ? { where: { id: { notIn: contactIds } } } : undefined);
      return update.expectedVersion + 1;
    });

    try {
      revalidatePath("/");
    } catch (revalidationError) {
      // The page reads current Prisma rows directly; revalidation is a cache
      // safety net and must not misreport a committed publish as a rollback.
      console.error(
        "Portfolio page revalidation failed:",
        revalidationError instanceof Error ? revalidationError.message : "Unknown error",
      );
    }

    return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ message: "Request body is too large" }, { status: 413 });
    }
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json({ message: "Invalid content payload" }, { status: 400 });
    }
    if (error instanceof StaleContentVersionError) {
      return NextResponse.json({ message: "Content changed since it was loaded. Reload before publishing." }, { status: 409 });
    }
    console.error("Admin content update failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Content update failed" }, { status: 500 });
  }
}
