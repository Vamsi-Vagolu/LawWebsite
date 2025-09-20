import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 🔑 Hash password
  const passwordHash = await bcrypt.hash("Test@1234", 10);

  // 🧑‍🤝‍🧑 Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Vamsi",
        email: "vamsi@example.com",
        password: passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: passwordHash,
      },
    }),
  ]);

  console.log("✅ Created users:", users.map(u => u.email));

  // 📚 Seed Notes
  const notesData = [
    {
      title: "Constitutional Law",
      slug: "constitutional-law",
      description: "Fundamental Rights and Directive Principles.",
      category: "Constitutional",
      pdfFile: "/pdfs/constitutional-law.pdf",
    },
    {
      title: "Criminal Law",
      slug: "criminal-law",
      description: "IPC and landmark criminal cases.",
      category: "Criminal",
      pdfFile: "/pdfs/criminal-law.pdf",
    },
    {
      title: "Contract Law",
      slug: "contract-law",
      description: "Essentials of a valid contract.",
      category: "Contract",
      pdfFile: "/pdfs/contract-law.pdf",
    },
  ];

  for (const user of users) {
    for (const note of notesData) {
      // 📝 Create note
      const createdNote = await prisma.note.create({
        data: {
          ...note,
        },
      });

      // 📝 Create quizzes for each note
      await prisma.quiz.createMany({
        data: [
          {
            question: `What is one key point in ${note.title}?`,
            answer: "Refer to the note content.",
            userId: user.id,
            noteId: createdNote.id,
          },
          {
            question: `Which category is ${note.title} in?`,
            answer: note.category,
            userId: user.id,
            noteId: createdNote.id,
          },
        ],
      });

      // ⭐ Mark one note as favorite
      if (note.title === "Constitutional Law") {
        await prisma.userFavoriteNote.create({
          data: {
            userId: user.id,
            noteId: createdNote.id,
          },
        });
      }

      // ⏱️ Simulate recently viewed
      await prisma.viewedNote.create({
        data: {
          userId: user.id,
          noteId: createdNote.id,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
