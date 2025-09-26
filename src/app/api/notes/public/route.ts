// app/api/notes/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch latest notes for public display (no authentication required)
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 6, // Limit to latest 6 notes
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        slug: true,
        createdAt: true,
        // Don't include pdfFile in public API for security
      },
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (err) {
    console.error("Error fetching public notes:", err);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}