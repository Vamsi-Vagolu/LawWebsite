// src/app/api/admin/bare-acts/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
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

// Directory to save PDFs
const uploadDir = path.join(process.cwd(), "private", "bare-acts");

// Validate bare act input
function validateBareActInput(data: any) {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (data.title && data.title.trim().length > 255) {
    errors.push("Title must be less than 255 characters");
  }

  if (!data.category || !['AIBE', 'ALL'].includes(data.category)) {
    errors.push("Category must be either 'AIBE' or 'ALL'");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ----------------------------
// GET /api/admin/bare-acts/[id]
// ----------------------------
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bareAct = await prisma.bareAct.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        slug: true,
        pdfFile: true,
        order: true,
        createdAt: true,
      },
    });

    if (!bareAct) {
      return NextResponse.json({ error: "Bare act not found" }, { status: 404 });
    }

    return NextResponse.json(bareAct, { status: 200 });
  } catch (err) {
    console.error("Error fetching bare act:", err);
    return NextResponse.json(
      { error: "Failed to fetch bare act" },
      { status: 500 }
    );
  }
}

// ----------------------------
// PUT /api/admin/bare-acts/[id]
// ----------------------------
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Check if bare act exists
    const existingBareAct = await prisma.bareAct.findUnique({
      where: { id },
    });

    if (!existingBareAct) {
      return NextResponse.json({ error: "Bare act not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string || "0");
    const pdfFile = formData.get("pdfFile") as File | null;

    // Validate input
    const validation = validateBareActInput({ title, category });
    if (!validation.isValid) {
      return NextResponse.json({
        error: "Validation failed",
        details: validation.errors
      }, { status: 400 });
    }

    let pdfFileName = existingBareAct.pdfFile || "";

    // Handle new PDF file upload
    if (pdfFile && pdfFile.size > 0) {
      // File size validation (10MB limit)
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
      }

      // File type validation
      if (pdfFile.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }

      // Delete old file if exists
      if (existingBareAct.pdfFile) {
        const oldFileName = path.basename(existingBareAct.pdfFile);
        const oldFilePath = path.join(uploadDir, oldFileName);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn("Could not delete old file:", err);
        }
      }

      // Save new file
      const uniqueId = randomUUID();
      const newPdfFileName = `${uniqueId}.pdf`;
      const buffer = await pdfFile.arrayBuffer();
      const filePath = path.join(uploadDir, newPdfFileName);
      await fs.writeFile(filePath, Buffer.from(buffer));

      pdfFileName = `/api/protected-pdf/bare-acts/${newPdfFileName}`;
    }

    const slug = generateSlug(title);

    const updatedBareAct = await prisma.bareAct.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category as "AIBE" | "ALL",
        slug,
        pdfFile: pdfFileName,
        order,
      },
    });

    return NextResponse.json(updatedBareAct, { status: 200 });

  } catch (err: any) {
    console.error("Error updating bare act:", err);
    return NextResponse.json(
      { error: "Failed to update bare act" },
      { status: 500 }
    );
  }
}

// ----------------------------
// DELETE /api/admin/bare-acts/[id]
// ----------------------------
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Get the bare act to delete the associated file
    const bareAct = await prisma.bareAct.findUnique({
      where: { id },
    });

    if (!bareAct) {
      return NextResponse.json({ error: "Bare act not found" }, { status: 404 });
    }

    // Delete the PDF file if exists
    if (bareAct.pdfFile) {
      const fileName = path.basename(bareAct.pdfFile);
      const filePath = path.join(uploadDir, fileName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("Could not delete file:", err);
      }
    }

    // Delete from database
    await prisma.bareAct.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Bare act deleted successfully" },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Error deleting bare act:", err);
    return NextResponse.json(
      { error: "Failed to delete bare act" },
      { status: 500 }
    );
  }
}