import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const testId = params.id;

    // Get the test with questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // Check if test is published
    if (!test.isPublished) {
      return NextResponse.json(
        { error: "Test is not available" },
        { status: 403 }
      );
    }

    // Check if user has already attempted this test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: testId,
        userId: token.sub!,
      },
    });

    // Transform questions for frontend (remove correct answers for security)
    const safeQuestions = test.questions.map(question => ({
      id: question.id,
      questionNumber: question.questionNumber,
      question: question.question,
      options: question.options,
      // Don't send correctAnswer to frontend for security
    }));

    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      category: test.category,
      difficulty: test.difficulty,
      timeLimit: test.timeLimit,
      totalQuestions: test.totalQuestions,
      passingScore: test.passingScore,
      questions: safeQuestions,
      hasAttempted: !!existingAttempt,
      attemptScore: existingAttempt?.score || null,
    });

  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}