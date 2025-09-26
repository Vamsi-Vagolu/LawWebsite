import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Anyone can access bare acts (public content)
    // But we still want to track access if user is logged in

    const { filename } = await params;

    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "private", "bare-acts", filename);

    try {
      const file = await fs.readFile(filePath);

      return new NextResponse(new Uint8Array(file), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year since these are public documents
        },
      });
    } catch (fileError) {
      console.error("File not found:", filename);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error serving bare acts PDF:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}