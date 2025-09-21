// src/app/api/admin/notes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

// Utility: generate slug from title
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Directory to save PDFs
const uploadDir = path.join(process.cwd(), "public", "pdfs");

// ----------------------------
// GET /api/admin/notes
// ----------------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const forDropdown = url.searchParams.get("dropdown") === "true";

    if (forDropdown) {
      // Return minimal data for QuizzesPanel dropdown
      const notes = await prisma.note.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(notes);
    }

    // Full data for admin view
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true } } },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// ----------------------------
// POST /api/admin/notes
// ----------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const file = formData.get("pdfFile") as File | Blob | null;

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    let pdfFilePath: string | null = null;
    if (file) {
      const fileName = `${randomUUID()}${path.extname((file as File).name)}`;
      pdfFilePath = `/pdfs/${fileName}`;

      const arrayBuffer = await (file as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(path.join(uploadDir, fileName), buffer);
      console.log("PDF saved to:", path.join(uploadDir, fileName));
    }

    const slug = generateSlug(title);

    const note = await prisma.note.create({
      data: {
        title,
        slug,
        description,
        category,
        pdfFile: pdfFilePath ?? "",
        userId: user.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
