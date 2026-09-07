import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.POSTGRESQL_URL;

if (!connectionString) {
  throw new Error("POSTGRESQL_URL must be set");
}

const adapter = new PrismaPg({ connectionString });

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter })
} else {
  if (!globalThis.cachedPrisma) {
    globalThis.cachedPrisma = new PrismaClient({ adapter })
  }
  prisma = globalThis.cachedPrisma
}

export const db = prisma
