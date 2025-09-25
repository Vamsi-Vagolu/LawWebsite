import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse, ErrorResponses, logInDevelopment, logError } from '@/lib/api-utils';
import { TestAttemptSubmission } from '@/types/api';
import { validateTestSubmission } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logInDevelopment('🚀 TEST SUBMISSION START', { testId: await params.then(p => p.id) });
    
    // Get the JWT token to authenticate the user
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    logInDevelopment('🎫 Token validation', {
      hasToken: !!token,
      userId: token?.sub,
    });

    if (!token || !token.sub) {
      return ErrorResponses.UNAUTHORIZED();
    }

    // Parse and validate request body
    const body: TestAttemptSubmission = await request.json();
    const { answers, timeSpent } = body;

    logInDevelopment('📝 Submission data', {
      answersCount: typeof answers === 'object' ? Object.keys(answers).length : 0,
      timeSpent
    });

    // Validate submission data
    const validation = validateTestSubmission({ answers, timeSpent });
    if (!validation.isValid) {
      return ErrorResponses.VALIDATION_ERROR({
        errors: validation.errors,
        fieldErrors: validation.fieldErrors
      });
    }

    const { id: testId } = await params;
    const userId = token.sub;

    logInDevelopment('📊 Processing submission', { testId, userId });

    // Verify the user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      logError(new Error(`User not found: ${userId}`), 'USER_VERIFICATION');
      return ErrorResponses.NOT_FOUND('User');
    }

    logInDevelopment('✅ User verified', { userId: user.id, email: user.email });

    // Verify the test exists and get questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    });

    if (!test) {
      return ErrorResponses.NOT_FOUND('Test');
    }

    if (!test.isPublished) {
      return createErrorResponse('Test not available', 403, 'TEST_NOT_PUBLISHED');
    }

    logInDevelopment('📋 Test verified', {
      id: test.id,
      title: test.title,
      questionsCount: test.questions.length,
      passingScore: test.passingScore
    });

    // Calculate score based on test schema
    let correctCount = 0;
    const totalQuestions = test.questions.length;

    logInDevelopment('🧮 Calculating score for test', { totalQuestions });

    // Iterate through answers and compare with correct answers
    for (const question of test.questions) {
      const userAnswer = answers[question.id]?.selectedAnswer;
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctCount++;
      }
    }

    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = scorePercentage >= test.passingScore;

    logInDevelopment('📊 Score calculated', {
      correctCount,
      totalQuestions,
      scorePercentage: Math.round(scorePercentage * 100) / 100,
      passed
    });

    // Check if user already has an attempt for this test
    let existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: testId,
        userId: userId
      }
    });

    logInDevelopment('🔍 Existing attempt check', {
      found: !!existingAttempt,
      attemptId: existingAttempt?.id
    });

    const now = new Date();
    let testAttempt;

    // Create or update test attempt
    if (!existingAttempt) {
      logInDevelopment('🆕 Creating new test attempt');

      try {
        testAttempt = await prisma.testAttempt.create({
          data: {
            testId: testId,
            userId: userId,
            answers: answers,
            score: scorePercentage,
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            timeSpent: timeSpent || 0,
            isCompleted: true,
            completedAt: now,
          }
        });

        logInDevelopment('✅ Test attempt created', { attemptId: testAttempt.id });
      } catch (createError: unknown) {
        logError(createError, 'TEST_ATTEMPT_CREATION');

        // Handle specific Prisma errors
        if (createError && typeof createError === 'object' && 'code' in createError) {
          const prismaError = createError as any;

          if (prismaError.code === 'P2003') {
            return createErrorResponse(
              'Invalid test or user reference',
              400,
              'FOREIGN_KEY_CONSTRAINT',
              { constraint: prismaError.meta?.constraint }
            );
          }
        }

        throw createError;
      }
    } else {
      logInDevelopment('🔄 Updating existing test attempt', { attemptId: existingAttempt.id });

      testAttempt = await prisma.testAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          answers: answers,
          score: scorePercentage,
          correctCount: correctCount,
          totalQuestions: totalQuestions,
          timeSpent: timeSpent || existingAttempt.timeSpent,
          isCompleted: true,
          completedAt: now,
          updatedAt: now,
        }
      });

      logInDevelopment('✅ Test attempt updated', { attemptId: testAttempt.id });
    }

    const responseData = {
      score: Math.round(scorePercentage * 100) / 100,
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      testAttemptId: testAttempt.id,
      passed: passed,
      passingScore: test.passingScore
    };

    logInDevelopment('✅ Test submission completed successfully', {
      score: responseData.score,
      passed: responseData.passed
    });

    return createSuccessResponse(responseData);

  } catch (error: unknown) {
    logError(error, 'TEST_SUBMISSION');

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;

      if (prismaError.code === 'P2003') {
        return createErrorResponse(
          'Database constraint error',
          400,
          'FOREIGN_KEY_CONSTRAINT',
          { constraint: prismaError.meta?.constraint }
        );
      }
    }

    return ErrorResponses.INTERNAL_ERROR();
  }
}