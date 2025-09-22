// src/app/api/admin/notes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { validateNote, sanitizeInput } from "@/lib/validation";
import { handleApiError, AppError } from "@/lib/errorHandler";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// Utility: generate slug from title
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Directory to save PDFs (PRIVATE folder now)
const uploadDir = path.join(process.cwd(), "private", "pdfs");

// Ensure private directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

// ----------------------------
// GET /api/admin/notes
// ----------------------------
export async function GET(req: Request) {
  try {
    // Fetch all notes, newest first
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        slug: true,
        pdfFile: true,
      },
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (err) {
    console.error("Error fetching notes:", err);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// ----------------------------
// POST /api/admin/notes
// ----------------------------
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      category: formData.get("category") as string || "",
    };

    // Validate input
    const validation = validateNote(rawData);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }

    // Sanitize input
    const title = sanitizeInput(rawData.title);
    const description = sanitizeInput(rawData.description);
    const category = sanitizeInput(rawData.category);

    const pdfFile = formData.get("pdfFile") as File | null;

    let pdfFileName = "";
    if (pdfFile && pdfFile.size > 0) {
      // File size validation (10MB limit)
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
      }

      // File type validation
      if (pdfFile.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }

      const uniqueId = randomUUID();
      pdfFileName = `${uniqueId}.pdf`;

      const buffer = await pdfFile.arrayBuffer();
      const filePath = path.join(uploadDir, pdfFileName);
      await fs.writeFile(filePath, Buffer.from(buffer));
    }

    const slug = generateSlug(title);
    const userId = session.user.id;

    const newNote = await prisma.note.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        slug,
        pdfFile: pdfFileName ? `/api/protected-pdf/${pdfFileName}` : "", // Protected URL
        userId,
      },
    });

    return NextResponse.json(newNote, { status: 201 });

  } catch (err: any) {
    console.error("Error creating note:", err);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
