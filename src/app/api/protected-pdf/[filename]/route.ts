import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filename = params.filename;
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Check if file exists in private folder
    const filePath = path.join(process.cwd(), "private", "pdfs", filename);
    
    try {
      const file = await fs.readFile(filePath);
      
      // Convert Buffer to Uint8Array for NextResponse
      return new NextResponse(new Uint8Array(file), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, no-cache",
        },
      });
    } catch (fileError) {
      console.error("File not found:", filename);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Remove the POST method - it doesn't belong in this file
// POST should be in /api/admin/notes/route.ts