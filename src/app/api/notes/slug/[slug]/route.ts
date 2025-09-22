import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // ✅ Check authentication first
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("No authenticated session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await and validate params
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug || typeof slug !== 'string') {
      console.log("Invalid slug:", slug);
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    console.log(`Fetching note with slug: ${slug} for user: ${session.user.email}`);

    // ✅ Find note by slug with better error handling
    const note = await prisma.note.findFirst({
      where: { 
        slug: slug.trim().toLowerCase() // ✅ Normalize slug
      },
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
      console.log(`Note not found with slug: ${slug}`);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    console.log(`Found note: ${note.title}`);

    // ✅ Return note data
    return NextResponse.json(note, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error("API Error fetching note by slug:", error);
    
    // ✅ Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Server error: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// ✅ Optional: Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  });
}