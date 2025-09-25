import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ErrorResponses } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // request is a Web Fetch Request in Next 13 route handlers — cast to any for getToken typings
    const token = await getToken({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub) {
      return ErrorResponses.UNAUTHORIZED();
    }

    // 1) Fetch published tests with minimal includes
    const tests = await prisma.test.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        timeLimit: true,
        totalQuestions: true,
        passingScore: true,
        createdAt: true,
        // include small preview of questions so frontend can decide to load full quiz
        questions: {
          select: { id: true, questionNumber: true },
          orderBy: { questionNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const testIds = tests.map(t => t.id);
    const userId = token.sub;

    // 2) Total attempts per test (all users)
    const totalAttemptsRaw = await prisma.testAttempt.groupBy({
      by: ['testId'],
      where: {
        testId: { in: testIds },
        isCompleted: true
      },
      _count: { id: true }
    });
    const totalAttemptsMap = new Map<string, number>(
      totalAttemptsRaw.map(r => [r.testId, r._count.id])
    );

    // 3) User attempts & best score for the current user
    const userAttemptsRaw = await prisma.testAttempt.findMany({
      where: {
        testId: { in: testIds },
        userId,
        isCompleted: true
      },
      select: { testId: true, score: true }
    });

    const userAttemptsMap = new Map<string, { count: number; bestScore: number | null }>();
    for (const rec of userAttemptsRaw) {
      const prev = userAttemptsMap.get(rec.testId) ?? { count: 0, bestScore: null };
      prev.count += 1;
      if (rec.score != null && (prev.bestScore == null || rec.score > prev.bestScore)) {
        prev.bestScore = rec.score;
      }
      userAttemptsMap.set(rec.testId, prev);
    }

    // 4) Build response
    const res = tests.map(t => {
      const userStats = userAttemptsMap.get(t.id) ?? { count: 0, bestScore: null };
      const totalAttempts = totalAttemptsMap.get(t.id) ?? 0;

      return {
        id: t.id,
        title: t.title,
        description: t.description ?? '',
        category: t.category ?? 'General',
        difficulty: t.difficulty ?? null,
        timeLimit: t.timeLimit ?? null,
        totalQuestions: t.totalQuestions ?? (t.questions?.length ?? 0),
        passingScore: t.passingScore ?? null,
        createdAt: t.createdAt.toISOString(),
        questionsPreview: (t.questions || []).map(q => ({ id: q.id, questionNumber: q.questionNumber })),
        totalAttempts,
        userAttempts: userStats.count,
        bestScore: userStats.bestScore
      };
    });

    return createSuccessResponse(res);

  } catch (err) {
    console.error('Error fetching tests:', err);
    return ErrorResponses.INTERNAL_ERROR();
  }
}