import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const { id: testId } = await params;

    // ✅ Remove mock data handling - only use real database data
    const test = await prisma.test.findUnique({
      where: { 
        id: testId,
        isPublished: true
      },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
          select: {
            id: true,
            questionNumber: true,
            question: true,
            options: true, // <-- Use options, not optionA/B/C/D
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    });

    if (!test || !test.questions) {
      return NextResponse.json(
        { error: 'Test not found or not published' }, 
        { status: 404 }
      );
    }

    // Check for active attempts
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

    console.log('token.sub:', token.sub);

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
          testId, // from params
          userId: token.sub!, // from JWT
          answers: {},
          totalQuestions: test.questions.length
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