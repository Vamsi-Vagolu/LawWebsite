import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return ErrorResponses.UNAUTHORIZED();
    }

    const { id: testId } = await params;

    // Handle mock test results
    if (testId.startsWith('mock-')) {
      const mockResults = {
        id: `mock-result-${testId}`,
        score: 75,
        correctCount: 38,
        totalQuestions: 50,
        timeSpent: 45 * 60,
        completedAt: new Date().toISOString(),
        test: {
          title: "Constitutional Law - Fundamentals",
          description: "Mock test description",
          passingScore: 70
        },
        questions: [],
        answers: {}
      };
      return createSuccessResponse(mockResults);
    }

    // Handle real test results
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId,
        userId: token.sub!,
        isCompleted: true
      },
      include: {
        // include the test and its questions for detailed breakdown
        test: {
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
            questions: {
              select: {
                id: true,
                questionNumber: true,
                question: true,
                options: true,
                correctAnswer: true,
                explanation: true
              },
              orderBy: { questionNumber: 'asc' }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!testAttempt) {
      return ErrorResponses.NOT_FOUND('Test attempt');
    }

    return createSuccessResponse({
      id: testAttempt.id,
      score: testAttempt.score ?? 0,
      correctCount: testAttempt.correctCount ?? 0,
      totalQuestions:
        testAttempt.totalQuestions ??
        (testAttempt.test?.questions?.length ?? 0),
      timeSpent: testAttempt.timeSpent ?? 0,
      completedAt: testAttempt.completedAt?.toISOString() ?? null,
      test: {
        id: testAttempt.test?.id,
        title: testAttempt.test?.title,
        description: testAttempt.test?.description,
        passingScore: testAttempt.test?.passingScore
      },
      // include detailed data frontend expects
      questions: testAttempt.test?.questions ?? [],
      answers: testAttempt.answers ?? {}
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}