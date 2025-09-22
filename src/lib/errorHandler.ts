import { NextResponse } from "next/server";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: any) {
  console.error("API Error:", error);

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: "A record with this data already exists" },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: "Record not found" },
      { status: 404 }
    );
  }

  // Generic server error
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}