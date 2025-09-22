import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await params before accessing properties
    const { filename } = await params;

    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "private", "pdfs", filename);
    
    try {
      const file = await fs.readFile(filePath);
      
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