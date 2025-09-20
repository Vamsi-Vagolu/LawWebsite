import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ✅ Create test user
  const passwordHash = await bcrypt.hash("Test@1234", 10);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: passwordHash,
      notes: {
        create: [
          {
            title: "Sample Note",
            content: "This is a sample note for testing purposes.",
          },
        ],
      },
      quizzes: {
        create: [
          {
            question: "What is the capital of India?",
            answer: "New Delhi",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
