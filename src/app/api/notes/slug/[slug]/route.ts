import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await params before accessing properties
    const { slug } = await params;

    if (!slug) {
      return Response.json({ error: "Slug is required" }, { status: 400 });
    }

    const note = await prisma.note.findFirst({
      where: { slug },
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

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}