import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

// GET - Get all tests for admin management
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'OWNER')) {
      return ErrorResponses.UNAUTHORIZED();
    }

    const tests = await prisma.test.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        timeLimit: true,
        totalQuestions: true,
        passingScore: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const testsWithStats = tests.map(test => ({
      ...test,
      questionCount: test._count.questions,
      attemptCount: test._count.attempts
    }));

    return createSuccessResponse(testsWithStats);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}

// POST - Create new test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'OWNER')) {
      return ErrorResponses.UNAUTHORIZED();
    }

    const body = await request.json();
    const { title, description, category, difficulty, timeLimit, passingScore, isPublished } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const test = await prisma.test.create({
      data: {
        title,
        description,
        category,
        difficulty,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        passingScore: passingScore ? parseInt(passingScore) : null,
        isPublished: isPublished || false,
        totalQuestions: 0
      }
    });

    return createSuccessResponse(test);
  } catch (error) {
    console.error('Error creating test:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}