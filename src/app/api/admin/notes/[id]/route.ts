import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

// PUT edit note
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== "v.vamsi3666@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

// DELETE note with PDF file deletion
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== "v.vamsi3666@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Note id is required" }, { status: 400 });
  }

  try {
    // First, get the note to find the PDF file path
    const note = await prisma.note.findUnique({
      where: { id },
      select: { pdfFile: true, title: true }
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Delete the PDF file from the file system if it exists
    if (note.pdfFile && note.pdfFile.trim() !== '') {
      const fileName = path.basename(note.pdfFile); // Extract filename safely
      
      if (fileName && fileName !== '' && fileName !== '.' && fileName !== '..') {
        const filePath = path.join(process.cwd(), "public", "pdfs", fileName);
        
        try {
          await fs.access(filePath); // Check if file exists first
          await fs.unlink(filePath); // Delete the file
          console.log(`Successfully deleted PDF file: ${fileName}`);
        } catch (fileError: any) {
          if (fileError.code === 'ENOENT') {
            console.warn(`PDF file not found (already deleted?): ${fileName}`);
          } else {
            console.warn(`Could not delete PDF file: ${fileName}`, fileError.message);
          }
          // Don't fail the entire operation if file deletion fails
        }
      }
    }

    // Delete related records first (to avoid foreign key constraints)
    await prisma.userFavoriteNote.deleteMany({ where: { noteId: id } });
    await prisma.viewedNote.deleteMany({ where: { noteId: id } });
    
    // Remove quiz deletion if you removed quizzes model
    // await prisma.quiz.deleteMany({ where: { noteId: id } });

    // Delete the note from database
    const deletedNote = await prisma.note.delete({ where: { id } });

    return NextResponse.json({ 
      message: "Note and PDF deleted successfully", 
      note: deletedNote 
    });

  } catch (err: any) {
    console.error("Error deleting note:", err);
    return NextResponse.json(
      { error: "Failed to delete note", details: err.message },
      { status: 500 }
    );
  }
}
