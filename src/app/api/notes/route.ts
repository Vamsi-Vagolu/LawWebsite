// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

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
        createdAt: true,
      },
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Optional: Handle POST if you plan to add notes later
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Generate slug
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");

    // TODO: Replace with actual userId from session
    const userId = data.userId || ""; 

    const newNote = await prisma.note.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        slug,
        pdfFile: data.pdfFile || "",
        userId, // required by your Prisma schema
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (err) {
    console.error("Error creating note:", err);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

