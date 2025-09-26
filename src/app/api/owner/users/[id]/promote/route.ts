import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is owner
    if (!session?.user || session.user.role !== "OWNER") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await params before accessing properties
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      message: "User promoted to Admin successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}