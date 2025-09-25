import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

// PUT - Update test
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'OWNER')) {
      return ErrorResponses.UNAUTHORIZED();
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, category, difficulty, timeLimit, passingScore, isPublished } = body;

    const test = await prisma.test.update({
      where: { id },
      data: {
        title,
        description,
        category,
        difficulty,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        passingScore: passingScore ? parseInt(passingScore) : null,
        isPublished
      }
    });

    return createSuccessResponse(test);
  } catch (error) {
    console.error('Error updating test:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}

// DELETE - Delete test
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'OWNER')) {
      return ErrorResponses.UNAUTHORIZED();
    }

    const { id } = await params;

    // Check if test has attempts - prevent deletion if so
    const attemptCount = await prisma.testAttempt.count({
      where: { testId: id }
    });

    if (attemptCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete test with existing attempts. Unpublish instead.' },
        { status: 400 }
      );
    }

    // Delete questions first, then test
    await prisma.question.deleteMany({
      where: { testId: id }
    });

    await prisma.test.delete({
      where: { id }
    });

    return createSuccessResponse({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}