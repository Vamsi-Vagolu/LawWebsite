import { PrismaClient } from "@/generated/prisma"; // use your generated client

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // optional: logs queries
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
