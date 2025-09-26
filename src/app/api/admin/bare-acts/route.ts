// src/app/api/admin/bare-acts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/errorHandler";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import formidable from "formidable";

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

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

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
// GET /api/admin/bare-acts
// ----------------------------
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bareActs = await prisma.bareAct.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
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

    return NextResponse.json(bareActs, { status: 200 });
  } catch (err) {
    console.error("Error fetching bare acts:", err);
    return NextResponse.json(
      { error: "Failed to fetch bare acts" },
      { status: 500 }
    );
  }
}

// ----------------------------
// POST /api/admin/bare-acts
// ----------------------------
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUploadDir();

    const formData = await req.formData();

    // Handle single file upload
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || "";
    const category = formData.get("category") as string;
    const pdfFile = formData.get("pdfFile") as File | null;

    // Handle multiple file uploads
    const files: File[] = [];
    const titles: string[] = [];

    // Check if this is a bulk upload
    const isBulkUpload = formData.has("files[0]");

    if (isBulkUpload) {
      let i = 0;
      while (formData.has(`files[${i}]`)) {
        const file = formData.get(`files[${i}]`) as File;
        const fileTitle = formData.get(`titles[${i}]`) as string;
        files.push(file);
        titles.push(fileTitle || file.name.replace('.pdf', ''));
        i++;
      }
    }

    if (isBulkUpload && files.length > 0) {
      // Handle bulk upload
      const createdActs = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileTitle = titles[i];

        // Validate each file
        const validation = validateBareActInput({
          title: fileTitle,
          category: category
        });

        if (!validation.isValid) {
          continue; // Skip invalid files
        }

        // File validation
        if (file.size > 10 * 1024 * 1024) {
          continue; // Skip files larger than 10MB
        }

        if (file.type !== "application/pdf") {
          continue; // Skip non-PDF files
        }

        // Save file
        const uniqueId = randomUUID();
        const pdfFileName = `${uniqueId}.pdf`;
        const buffer = await file.arrayBuffer();
        const filePath = path.join(uploadDir, pdfFileName);
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Create bare act
        const slug = generateSlug(fileTitle);
        const userId = session.user.id;

        const bareAct = await prisma.bareAct.create({
          data: {
            title: fileTitle.trim(),
            description: description.trim(),
            category: category as "AIBE" | "ALL",
            slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
            pdfFile: `/api/protected-pdf/bare-acts/${pdfFileName}`,
            order: 0,
            createdBy: userId,
          },
        });

        createdActs.push(bareAct);
      }

      return NextResponse.json({
        message: `Successfully created ${createdActs.length} bare acts`,
        created: createdActs
      }, { status: 201 });

    } else {
      // Handle single file upload
      const validation = validateBareActInput({ title, category });
      if (!validation.isValid) {
        return NextResponse.json({
          error: "Validation failed",
          details: validation.errors
        }, { status: 400 });
      }

      let pdfFileName = "";
      if (pdfFile && pdfFile.size > 0) {
        // File size validation (10MB limit)
        if (pdfFile.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
        }

        // File type validation
        if (pdfFile.type !== "application/pdf") {
          return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
        }

        const uniqueId = randomUUID();
        pdfFileName = `${uniqueId}.pdf`;

        const buffer = await pdfFile.arrayBuffer();
        const filePath = path.join(uploadDir, pdfFileName);
        await fs.writeFile(filePath, Buffer.from(buffer));
      }

      const slug = generateSlug(title);
      const userId = session.user.id;

      const newBareAct = await prisma.bareAct.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          category: category as "AIBE" | "ALL",
          slug,
          pdfFile: pdfFileName ? `/api/protected-pdf/bare-acts/${pdfFileName}` : "",
          order: 0,
          createdBy: userId,
        },
      });

      return NextResponse.json(newBareAct, { status: 201 });
    }

  } catch (err: any) {
    console.error("Error creating bare act:", err);
    return NextResponse.json(
      { error: "Failed to create bare act" },
      { status: 500 }
    );
  }
}