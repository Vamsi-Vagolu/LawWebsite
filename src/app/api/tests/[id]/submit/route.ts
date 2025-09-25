import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Updated type
) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const { id: testId } = await params; // ✅ Await params
    const { answers, timeSpent } = await request.json();

    // Handle mock tests
    if (testId.startsWith('mock-')) {
      // For mock tests, simulate scoring
      const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
        id: `q${i + 1}`,
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      }));

      let correctCount = 0;
      const results: Record<string, {
        userAnswer: string | null;
        correctAnswer: string;
        isCorrect: boolean;
      }> = {};

      mockQuestions.forEach((question) => {
        const userAnswer = answers[question.id]?.selectedAnswer || null;
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        results[question.id] = {
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        };
      });

      const score = (correctCount / mockQuestions.length) * 100;
      const passingScore = 70;

      return NextResponse.json({
        success: true,
        attemptId: `mock-attempt-${Date.now()}`,
        score,
        correctCount,
        totalQuestions: mockQuestions.length,
        timeSpent,
        passed: score >= passingScore
      });
    }

    // Handle real tests
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          select: {
            id: true,
            questionNumber: true,
            correctAnswer: true
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' }, 
        { status: 404 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const results: Record<string, {
      userAnswer: string | null;
      correctAnswer: string;
      isCorrect: boolean;
    }> = {};

    test.questions.forEach((question) => {
      const userAnswer = answers[question.id]?.selectedAnswer || null;
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;
      
      results[question.id] = {
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = (correctCount / test.questions.length) * 100;

    // Find or create test attempt
    let testAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId,
        userId: token.sub!,
        isCompleted: false
      }
    });

    if (!testAttempt) {
      testAttempt = await prisma.testAttempt.create({
        data: {
          testId,
          userId: token.sub!,
          answers: {},
          totalQuestions: test.questions.length
        }
      });
    }

    // Update attempt with final results
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: {
        answers,
        score,
        correctCount,
        timeSpent,
        isCompleted: true,
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      attemptId: updatedAttempt.id,
      score,
      correctCount,
      totalQuestions: test.questions.length,
      timeSpent,
      passed: score >= test.passingScore
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}