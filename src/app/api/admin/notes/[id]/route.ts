import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

// PUT edit note
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Note id is required" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "";
    const pdfFile = formData.get("pdfFile") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updatedData: any = {
      title,
      description,
      category,
      slug: slugify(title, { lower: true, strict: true }),
    };

    if (pdfFile) updatedData.pdfFile = pdfFile.name;

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedNote);
  } catch (err: any) {
    console.error("Failed to update note:", err);
    return NextResponse.json(
      { error: "Failed to update note", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE note
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Note id is required" }, { status: 400 });
  }

  try {
    // Delete related records
    await prisma.userFavoriteNote.deleteMany({ where: { noteId: id } });
    await prisma.viewedNote.deleteMany({ where: { noteId: id } });
    await prisma.quiz.deleteMany({ where: { noteId: id } });

    // Delete note
    const deletedNote = await prisma.note.delete({ where: { id } });

    return NextResponse.json({ message: "Note deleted", note: deletedNote });
  } catch (err: any) {
    console.error("Error deleting note:", err);
    return NextResponse.json(
      { error: "Failed to delete note", details: err.message },
      { status: 500 }
    );
  }
}
