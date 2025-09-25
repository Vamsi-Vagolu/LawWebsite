import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, ErrorResponses } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;

    // next-auth expects a Node/NextRequest shape — cast to any for typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return ErrorResponses.UNAUTHORIZED();

    // fetch test meta (no questions here)
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        totalQuestions: true,
        passingScore: true,
        isPublished: true,
      },
    });

    if (!test) return ErrorResponses.NOT_FOUND("Test");
    if (!test.isPublished) return ErrorResponses.FORBIDDEN();

    // fetch ALL questions explicitly (no take/limit)
    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: { questionNumber: "asc" }
    });

    // remove correct answers before returning to client
    const safeQuestions = questions.map(({ correctAnswer, ...rest }) => rest);

    return createSuccessResponse({
      ...test,
      questions: safeQuestions
    });
  } catch (error) {
    console.error("Error in tests/[id] route:", error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}