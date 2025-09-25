import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Check if database has any tests first
    const testCount = await prisma.test.count({
      where: { isPublished: true }
    });

    // If no tests exist, return mock data for development
    if (testCount === 0) {
      console.log('No tests found in database, returning mock data');
      
      const mockTests = [
        {
          id: 'mock-1',
          title: 'Constitutional Law - Fundamentals',
          description: 'Test your knowledge of fundamental rights, directive principles, and constitutional amendments.',
          category: 'Constitutional Law',
          difficulty: 'MEDIUM',
          timeLimit: 60,
          totalQuestions: 50,
          passingScore: 70,
          createdAt: new Date().toISOString(),
          creator: 'System Admin',
          questionCount: 50,
          totalAttempts: 0,
          userAttempts: 0,
          bestScore: null
        },
        {
          id: 'mock-2',
          title: 'Criminal Law - Advanced Concepts',
          description: 'Advanced topics in criminal law including procedures, evidence, and case studies.',
          category: 'Criminal Law',
          difficulty: 'HARD',
          timeLimit: 90,
          totalQuestions: 75,
          passingScore: 65,
          createdAt: new Date().toISOString(),
          creator: 'System Admin',
          questionCount: 75,
          totalAttempts: 0,
          userAttempts: 0,
          bestScore: null
        },
        {
          id: 'mock-3',
          title: 'Contract Law - Basics',
          description: 'Essential concepts of contract law, formation, performance, and breach.',
          category: 'Contract Law',
          difficulty: 'EASY',
          timeLimit: 45,
          totalQuestions: 30,
          passingScore: 75,
          createdAt: new Date().toISOString(),
          creator: 'System Admin',
          questionCount: 30,
          totalAttempts: 0,
          userAttempts: 0,
          bestScore: null
        }
      ];

      return NextResponse.json(mockTests);
    }

    // Fetch all published tests with proper error handling
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

    // Optimize user data fetching with a single query per user
    const userId = token.sub!;
    
    // Get all user attempts for these tests in one query
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

    // Create lookup map for performance
    const userAttemptsMap = new Map(
      userAttempts.map(attempt => [
        attempt.testId, 
        { 
          count: attempt._count.id, 
          bestScore: attempt._max.score 
        }
      ])
    );

    // Map tests with user data
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
    
    // Return detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
      }, 
      { status: 500 }
    );
  } finally {
    // Ensure Prisma connection is properly closed
    await prisma.$disconnect();
  }
}