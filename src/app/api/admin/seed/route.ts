import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/prisma";
import { portfolioSeedSchema } from "@/lib/portfolio-seed-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 5_000_000;
const SEED_ID = "initial-portfolio-seed-v1";

function authorized(request: Request) {
  const expectedToken = process.env.ADMIN_CONTENT_API_TOKEN ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(suppliedToken);
  return expected.length >= 32 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

async function readBody(request: Request) {
  const declaredSize = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) {
    throw new RangeError();
  }
  if (!request.body) throw new SyntaxError();

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError();
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text) as unknown;
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_CONTENT_API_TOKEN) {
    return NextResponse.json({ message: "Content API unavailable" }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } },
    );
  }

  let seed;
  try {
    seed = portfolioSeedSchema.parse(await readBody(request));
  } catch (error) {
    const status = error instanceof RangeError ? 413 : 400;
    return NextResponse.json(
      { message: status === 413 ? "Seed is too large" : "Invalid seed payload" },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const seedHash = createHash("sha256").update(JSON.stringify(seed)).digest("hex");
  try {
    const status = await db.$transaction(async (transaction) => {
      const existingMarker = await transaction.portfolioSeedState.findUnique({ where: { id: SEED_ID } });
      if (existingMarker) return "already-applied" as const;

      const counts = await Promise.all([
        transaction.aboutMe.count(),
        transaction.projects.count(),
        transaction.skills.count(),
        transaction.experience.count(),
        transaction.contactEmail.count(),
        transaction.githubStatsSnapshot.count(),
        transaction.portfolioContentVersion.count(),
      ]);
      if (counts.some((count) => count > 0)) return "skipped-existing-data" as const;

      await transaction.portfolioSeedState.create({
        data: { id: SEED_ID, seedHash },
      });
      await transaction.aboutMe.createMany({ data: seed.aboutMe });
      await transaction.projects.createMany({ data: seed.projects });
      await transaction.skills.createMany({ data: seed.skills });
      await transaction.experience.createMany({ data: seed.experience });
      await transaction.contactEmail.createMany({ data: seed.contactEmail });
      await transaction.githubStatsSnapshot.createMany({
        data: seed.githubStatsSnapshot.map((row) => ({
          ...row,
          data: row.data as Prisma.InputJsonValue,
          fetchedAt: new Date(row.fetchedAt),
        })),
      });
      await transaction.portfolioContentVersion.createMany({
        data: seed.contentVersion.map((row) => ({
          ...row,
          updatedAt: new Date(row.updatedAt),
        })),
      });
      return "applied" as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (status === "applied") {
      try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/");
      } catch {
        // The data is committed; page revalidation is a best-effort safety net.
      }
    }

    return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    const marker = await db.portfolioSeedState.findUnique({ where: { id: SEED_ID } }).catch(() => null);
    if (marker) {
      return NextResponse.json({ status: "already-applied" }, { headers: { "Cache-Control": "no-store" } });
    }
    console.error("Portfolio seed attempt failed; database details suppressed.");
    return NextResponse.json(
      { message: "Seed could not be applied" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
