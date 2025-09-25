import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Fetch all published tests from database
    const tests = await prisma.test.findMany({
      where: { isPublished: true },
      include: {
        creator: {
          select: { name: true }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get user attempts for each test
    const userId = token.sub!;
    const userAttempts = await prisma.testAttempt.groupBy({
      by: ['testId'],
      where: {
        testId: { in: tests.map(t => t.id) },
        userId: userId,
        isCompleted: true
      },
      _count: { id: true },
      _max: { score: true }
    });

    const userAttemptsMap = new Map(
      userAttempts.map(attempt => [
        attempt.testId, 
        { 
          count: attempt._count.id, 
          bestScore: attempt._max.score 
        }
      ])
    );

    const testsWithUserData = tests.map(test => {
      const userStats = userAttemptsMap.get(test.id) || { count: 0, bestScore: null };
      
      return {
        id: test.id,
        title: test.title,
        description: test.description || '',
        category: test.category || 'General',
        difficulty: test.difficulty,
        timeLimit: test.timeLimit,
        totalQuestions: test.totalQuestions,
        passingScore: test.passingScore,
        createdAt: test.createdAt.toISOString(),
        creator: test.creator?.name || 'Unknown',
        questionCount: test._count.questions,
        totalAttempts: test._count.attempts,
        userAttempts: userStats.count,
        bestScore: userStats.bestScore
      };
    });

    return NextResponse.json(testsWithUserData);

  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}