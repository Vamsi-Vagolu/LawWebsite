import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Updated type
) {
  try {
    // Check authentication
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

    // Handle mock tests
    if (testId.startsWith('mock-')) {
      const mockTestData = {
        id: testId,
        title: "Constitutional Law - Practice Test 1",
        description: "Comprehensive test covering fundamental rights, directive principles, and constitutional amendments.",
        category: "Constitutional Law",
        difficulty: "MEDIUM",
        timeLimit: 60, // 60 minutes
        totalQuestions: 50,
        passingScore: 70.0,
        questions: Array.from({ length: 50 }, (_, i) => ({
          id: `q${i + 1}`,
          questionNumber: i + 1,
          question: `Which of the following is correct regarding Article ${21 + i} of the Indian Constitution?`,
          optionA: "It deals with fundamental rights and their enforcement mechanisms",
          optionB: "It establishes the framework for judicial review and constitutional interpretation",
          optionC: "It defines the relationship between the Union and State governments",
          optionD: "It outlines the procedures for constitutional amendments and modifications"
        })),
        creator: "System Admin",
        hasActiveAttempt: false,
        attemptId: null
      };

      return NextResponse.json(mockTestData);
    }

    // Handle real tests
    const test = await prisma.test.findUnique({
      where: { 
        id: testId,
        isPublished: true // Only published tests
      },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
          select: {
            id: true,
            questionNumber: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            // Don't include correctAnswer in GET request for security
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found or not published' }, 
        { status: 404 }
      );
    }

    // Check if user already has an active attempt
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: testId,
        userId: token.sub!,
        isCompleted: false
      }
    });

    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      category: test.category,
      difficulty: test.difficulty,
      timeLimit: test.timeLimit,
      totalQuestions: test.totalQuestions,
      passingScore: test.passingScore,
      questions: test.questions,
      creator: test.creator?.name || 'Unknown',
      hasActiveAttempt: !!existingAttempt,
      attemptId: existingAttempt?.id
    });

  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Start a new test attempt
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
    const { action } = await request.json();

    if (action === 'start') {
      // Handle mock tests
      if (testId.startsWith('mock-')) {
        return NextResponse.json({
          success: true,
          attemptId: `mock-attempt-${Date.now()}`,
          message: 'Mock test attempt started'
        });
      }

      // Check if test exists
      const test = await prisma.test.findUnique({
        where: { 
          id: testId,
          isPublished: true 
        }
      });

      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' }, 
          { status: 404 }
        );
      }

      // Check for existing incomplete attempt
      const existingAttempt = await prisma.testAttempt.findFirst({
        where: {
          testId: testId,
          userId: token.sub!,
          isCompleted: false
        }
      });

      if (existingAttempt) {
        return NextResponse.json({
          success: true,
          attemptId: existingAttempt.id,
          message: 'Resuming existing attempt'
        });
      }

      // Create new attempt
      const newAttempt = await prisma.testAttempt.create({
        data: {
          testId: testId,
          userId: token.sub!,
          answers: {},
          totalQuestions: test.totalQuestions
        }
      });

      return NextResponse.json({
        success: true,
        attemptId: newAttempt.id,
        message: 'Test attempt started'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' }, 
      { status: 400 }
    );

  } catch (error) {
    console.error('Error starting test:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}