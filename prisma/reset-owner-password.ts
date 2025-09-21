// prisma/reset-owner-password.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPlain = "";
  const hash = await bcrypt.hash(newPlain, 10);

  const user = await prisma.user.update({
    where: { email: "v.vamsi3666@gmail.com" },
    data: { password: hash },
  });

  console.log("Updated owner password for:", user.email);
  console.log("New plaintext password:", newPlain);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
