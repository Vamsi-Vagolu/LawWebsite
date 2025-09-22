import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/errorHandler";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    const { slug } = params;

    if (!slug) {
      throw new AppError("Slug is required", 400);
    }

    const note = await prisma.note.findUnique({
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
      throw new AppError("Note not found", 404);
    }

    return NextResponse.json(note);

  } catch (error) {
    return handleApiError(error);
  }
}