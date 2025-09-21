import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

// GET all notes
export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (err: any) {
    console.error("Failed to fetch notes:", err);
    return NextResponse.json(
      { error: "Failed to fetch notes", details: err.message },
      { status: 500 }
    );
  }
}

// POST new note
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "";
    const pdfFile = formData.get("pdfFile") as File;

    if (!title || !pdfFile) {
      return NextResponse.json(
        { error: "Title and PDF are required" },
        { status: 400 }
      );
    }

    // Save PDF filename (in production, handle real file storage)
    const pdfFileName = pdfFile.name;

    const slug = slugify(title, { lower: true, strict: true });

    const note = await prisma.note.create({
      data: {
        title,
        description,
        category,
        pdfFile: pdfFileName,
        slug,
        userId: "admin-id", // replace with real user if needed
      },
    });

    return NextResponse.json(note);
  } catch (err: any) {
    console.error("Failed to create note:", err);
    return NextResponse.json(
      { error: "Failed to create note", details: err.message },
      { status: 500 }
    );
  }
}
