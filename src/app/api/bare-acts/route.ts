// src/app/api/bare-acts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------------------
// GET /api/bare-acts - Public endpoint
// ----------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let whereClause = {};

    // If category is "AIBE", only show AIBE acts
    // If category is "ALL" or not specified, show ALL bare acts regardless of their category
    if (category === "AIBE") {
      whereClause = { category: "AIBE" };
    }
    // For "ALL" category or no category specified, show all bare acts regardless of their original category

    const bareActs = await prisma.bareAct.findMany({
      where: whereClause,
      orderBy: [
        { title: "asc" }, // Primary sort: alphabetical by title
        { category: "asc" }, // Secondary sort: category
        { order: "asc" } // Tertiary sort: custom order
      ],
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

    return NextResponse.json(bareActs, { status: 200 });
  } catch (err) {
    console.error("Error fetching bare acts:", err);
    return NextResponse.json(
      { error: "Failed to fetch bare acts" },
      { status: 500 }
    );
  }
}