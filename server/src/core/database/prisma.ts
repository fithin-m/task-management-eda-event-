import { PrismaClient } from "@prisma/client";

// ── Prisma singleton with global guard ────────────────────────────────────────
// Prevents multiple PrismaClient instances during ts-node-dev hot-reloads.
// Without this, each module re-evaluation creates a new client that hasn't
// fully initialised, causing "Cannot read properties of undefined" errors.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
