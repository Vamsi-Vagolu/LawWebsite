import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 🔑 Hash password
  const passwordHash = await bcrypt.hash("Test@1234", 10);

  // 🧑‍🤝‍🧑 Create users with roles
  const [owner, admin, user] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Vamsi Vagolu",
        email: "v.vamsi3666@gmail.com",
        password: passwordHash,
        role: "OWNER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: await bcrypt.hash("password", 10),
        role: "ADMIN", // use string, not Role.ADMIN
      },
    }),
    prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: passwordHash,
        role: "USER",
      },
    }),
  ]);

  console.log("✅ Created users:", [owner.email, admin.email, user.email]);

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

  // 📝 Assign notes only to Admin and Owner (example: normal User can’t add notes)
  for (const note of notesData) {
    const createdNote = await prisma.note.create({
      data: {
        ...note,
        userId: admin.id, // assign ADMIN as note creator
      },
    });

    // ⭐ Mark one note as favorite for test user
    if (note.title === "Constitutional Law") {
      await prisma.userFavoriteNote.create({
        data: {
          userId: user.id,
          noteId: createdNote.id,
        },
      });
    }

    // ⏱️ Simulate recently viewed for all users
    for (const u of [owner, admin, user]) {
      await prisma.viewedNote.create({
        data: {
          userId: u.id,
          noteId: createdNote.id,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
