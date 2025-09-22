import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { validateUser, sanitizeInput } from "@/lib/validation";
import { handleApiError, AppError } from "@/lib/errorHandler";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only OWNER can fetch admins
    if (!session || session.user.role !== "OWNER") {
      throw new AppError("Unauthorized", 401);
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(admins);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      throw new AppError("Unauthorized", 401);
    }

    const rawData = await req.json();

    // Validate input
    const validation = validateUser(rawData);
    if (!validation.isValid) {
      throw new AppError(`Validation failed: ${validation.errors.join(", ")}`, 400);
    }

    // Sanitize input
    const name = sanitizeInput(rawData.name);
    const email = sanitizeInput(rawData.email.toLowerCase());
    const password = rawData.password;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newAdmin);

  } catch (error) {
    return handleApiError(error);
  }
}