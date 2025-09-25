import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
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

    // Handle mock test results
    if (testId.startsWith('mock-')) {
      // For mock tests, we'll need to store results temporarily
      // For now, return a sample result
      const mockResults = {
        id: `mock-result-${testId}`,
        score: 75,
        correctCount: 38,
        totalQuestions: 50,
        timeSpent: 45 * 60, // 45 minutes
        completedAt: new Date().toISOString(),
        test: {
          title: "Constitutional Law - Fundamentals",
          description: "Mock test description",
          passingScore: 70
        }
      };
      
      return NextResponse.json(mockResults);
    }

    // Handle real test results
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId,
        userId: token.sub!,
        isCompleted: true
      },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            passingScore: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'No completed test attempt found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: testAttempt.id,
      score: testAttempt.score || 0,
      correctCount: testAttempt.correctCount || 0,
      totalQuestions: testAttempt.totalQuestions || 0,
      timeSpent: testAttempt.timeSpent || 0,
      completedAt: testAttempt.completedAt?.toISOString(),
      test: testAttempt.test
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}