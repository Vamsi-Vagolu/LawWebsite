// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use consistent import

export async function GET() {
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

