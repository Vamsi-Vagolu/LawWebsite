import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateNote, sanitizeInput } from "@/lib/validation";
import { handleApiError, AppError } from "@/lib/errorHandler";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// GET note details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Security: Role-based authentication
    if (!session || !["ADMIN", "OWNER", "USER"].includes(session.user.role)) {
      throw new AppError("Unauthorized", 401);
    }

    // ✅ Await params before accessing properties
    const { id } = await params;

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        slug: true,
        pdfFile: true,
        createdAt: true,
        updatedAt: true,
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

// PUT edit note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Security: Role-based authentication
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      throw new AppError("Unauthorized", 401);
    }

    // ✅ Await params before accessing properties
    const { id } = await params;
    if (!id) {
      throw new AppError("Note ID is required", 400);
    }

    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id },
      select: { id: true, pdfFile: true }
    });

    if (!existingNote) {
      throw new AppError("Note not found", 404);
    }

    const formData = await request.formData();
    const rawData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      category: (formData.get("category") as string) || "",
    };

    // Validate input
    const validation = validateNote(rawData);
    if (!validation.isValid) {
      throw new AppError(`Validation failed: ${validation.errors.join(", ")}`, 400);
    }

    // Sanitize input
    const title = sanitizeInput(rawData.title);
    const description = sanitizeInput(rawData.description);
    const category = sanitizeInput(rawData.category);

    const pdfFile = formData.get("pdfFile") as File | null;

    const updatedData: any = {
      title,
      description,
      category,
      slug: slugify(title, { lower: true, strict: true }),
    };

    // Handle PDF file update if provided
    if (pdfFile && pdfFile.size > 0) {
      // File validation
      if (pdfFile.size > 10 * 1024 * 1024) {
        throw new AppError("File too large (max 10MB)", 400);
      }

      if (pdfFile.type !== "application/pdf") {
        throw new AppError("Only PDF files allowed", 400);
      }

      // Delete old PDF file if exists
      if (existingNote.pdfFile) {
        const oldFileName = path.basename(existingNote.pdfFile);
        if (oldFileName && oldFileName !== '.' && oldFileName !== '..') {
          const oldFilePath = path.join(process.cwd(), "private", "pdfs", oldFileName);
          try {
            await fs.access(oldFilePath);
            await fs.unlink(oldFilePath);
            console.log(`Deleted old PDF: ${oldFileName}`);
          } catch (error) {
            console.warn(`Could not delete old PDF: ${oldFileName}`);
          }
        }
      }

      // Save new file
      const uniqueId = randomUUID();
      const pdfFileName = `${uniqueId}.pdf`;
      const uploadDir = path.join(process.cwd(), "private", "pdfs");
      
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const buffer = await pdfFile.arrayBuffer();
      const filePath = path.join(uploadDir, pdfFileName);
      await fs.writeFile(filePath, Buffer.from(buffer));
      
      updatedData.pdfFile = `/api/protected-pdf/${pdfFileName}`;
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedNote);

  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE note with PDF file deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      throw new AppError("Unauthorized", 401);
    }

    // ✅ Await params before accessing properties
    const { id } = await params;
    if (!id) {
      throw new AppError("Note ID is required", 400);
    }

    // First, get the note to find the PDF file path
    const note = await prisma.note.findUnique({
      where: { id },
      select: { pdfFile: true, title: true }
    });

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    // Delete the PDF file from the PRIVATE folder
    if (note.pdfFile && note.pdfFile.trim() !== '') {
      const fileName = path.basename(note.pdfFile);
      
      if (fileName && fileName !== '' && fileName !== '.' && fileName !== '..') {
        const filePath = path.join(process.cwd(), "private", "pdfs", fileName);
        
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
          console.log(`Successfully deleted PDF file: ${fileName}`);
        } catch (fileError: any) {
          if (fileError.code === 'ENOENT') {
            console.warn(`PDF file not found: ${fileName}`);
          } else {
            console.warn(`Could not delete PDF file: ${fileName}`, fileError.message);
          }
        }
      }
    }

    // Delete related records first (to avoid foreign key constraints)
    await prisma.userFavoriteNote.deleteMany({ where: { noteId: id } });
    await prisma.viewedNote.deleteMany({ where: { noteId: id } });

    // If you have quizzes, uncomment this:
    // await prisma.quiz.deleteMany({ where: { noteId: id } });

    // Delete the note from database
    const deletedNote = await prisma.note.delete({ where: { id } });

    return NextResponse.json({ 
      message: "Note and PDF deleted successfully", 
      note: deletedNote 
    });

  } catch (error) {
    return handleApiError(error);
  }
}
