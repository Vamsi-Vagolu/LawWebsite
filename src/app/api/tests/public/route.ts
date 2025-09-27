import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

export async function GET() {
  try {
    // Fetch published tests with basic information for public display
    const tests = await prisma.test.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        timeLimit: true,
        totalQuestions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response for public consumption
    const publicTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      description: test.description || '',
      category: test.category || 'General',
      difficulty: test.difficulty || null,
      timeLimit: test.timeLimit || null,
      totalQuestions: test.totalQuestions || 0,
      createdAt: test.createdAt.toISOString(),
    }));

    return createSuccessResponse(publicTests);

  } catch (err) {
    console.error('Error fetching public tests:', err);
    return ErrorResponses.INTERNAL_ERROR();
  }
}