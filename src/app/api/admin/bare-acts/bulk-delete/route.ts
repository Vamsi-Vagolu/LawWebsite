// src/app/api/admin/bare-acts/bulk-delete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

const uploadDir = path.join(process.cwd(), "private", "bare-acts");

// ----------------------------
// POST /api/admin/bare-acts/bulk-delete
// ----------------------------
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No IDs provided for deletion" },
        { status: 400 }
      );
    }

    // Get all bare acts to be deleted (to delete associated files)
    const bareActsToDelete = await prisma.bareAct.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        title: true,
        pdfFile: true,
      },
    });

    if (bareActsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No bare acts found with the provided IDs" },
        { status: 404 }
      );
    }

    // Delete associated PDF files
    const fileDeletionPromises = bareActsToDelete
      .filter(bareAct => bareAct.pdfFile)
      .map(async (bareAct) => {
        const fileName = path.basename(bareAct.pdfFile!);
        const filePath = path.join(uploadDir, fileName);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.warn(`Could not delete file for ${bareAct.title}:`, err);
        }
      });

    await Promise.allSettled(fileDeletionPromises);

    // Delete from database
    const deleteResult = await prisma.bareAct.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(
      {
        message: `Successfully deleted ${deleteResult.count} bare acts`,
        deletedCount: deleteResult.count,
        requestedCount: ids.length,
      },
      { status: 200 }
    );

  } catch (err: unknown) {
    console.error("Error bulk deleting bare acts:", err);
    return NextResponse.json(
      { error: "Failed to delete bare acts" },
      { status: 500 }
    );
  }
}