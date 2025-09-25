import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('\n🚀 === TEST SUBMISSION START ===');
    
    // Get the JWT token to authenticate the user
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('🎫 Token details:', {
      hasToken: !!token,
      sub: token?.sub,
      email: token?.email,
      role: token?.role
    });

    if (!token || !token.sub) {
      console.log('❌ No valid token found');
      return NextResponse.json(
        { error: 'Unauthorized - No valid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { answers, timeSpent } = body;

    console.log('📝 Submission data:', {
      answersType: typeof answers,
      answersKeys: typeof answers === 'object' ? Object.keys(answers) : 'N/A',
      timeSpent
    });

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    const testId = params.id;
    console.log('📊 Test ID:', testId);

    // ✅ CRITICAL: Use token.sub directly (this matches your JWT callback)
    const userId = token.sub;
    console.log('👤 Using user ID from token:', userId);

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
      console.error('❌ User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name
    });

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
      console.log('❌ Test not found:', testId);
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    console.log('📋 Test found:', {
      id: test.id,
      title: test.title,
      questionsCount: test.questions.length,
      passingScore: test.passingScore
    });

    // Calculate score based on your schema structure
    let correctCount = 0;
    const totalQuestions = test.questions.length;

    console.log('🧮 Calculating score...');

    // Iterate through answers and compare with correct answers
    for (const question of test.questions) {
      // Correct way to get the user's selected answer:
      const userAnswer = answers[question.id]?.selectedAnswer;
      console.log(`Q${question.questionNumber}: User: ${userAnswer}, Correct: ${question.correctAnswer}, ✅: ${userAnswer === question.correctAnswer}`);
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctCount++;
      }
    }

    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = scorePercentage >= test.passingScore;

    console.log('📊 Score calculation:', {
      correctCount,
      totalQuestions,
      scorePercentage: scorePercentage.toFixed(2),
      passingScore: test.passingScore,
      passed
    });

    // Check if user already has an attempt for this test
    let existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: testId,
        userId: userId // ✅ Use the same userId
      }
    });

    console.log('🔍 Existing attempt:', existingAttempt ? `Found (${existingAttempt.id})` : 'Not found');

    const now = new Date();
    let testAttempt;

    // Create or update test attempt
    if (!existingAttempt) {
      console.log('🆕 Creating new test attempt...');
      console.log('📝 Attempt data:', {
        testId,
        userId,
        answers,
        score: scorePercentage,
        correctCount,
        totalQuestions,
        timeSpent: timeSpent || 0
      });
      
      try {
        testAttempt = await prisma.testAttempt.create({
          data: {
            testId: testId,
            userId: userId, // ✅ This should now work!
            answers: answers, // Store answers as JSON
            score: scorePercentage,
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            timeSpent: timeSpent || 0,
            isCompleted: true,
            completedAt: now,
          }
        });
        
        console.log('✅ Test attempt created successfully:', testAttempt.id);
      } catch (createError: unknown) {
        console.error('❌ Failed to create test attempt:', createError);
        
        // Enhanced error logging for foreign key constraints
        if (createError && typeof createError === 'object' && 'code' in createError) {
          const prismaError = createError as any;
          console.error('🔗 Foreign key constraint details:', prismaError.meta);
          
          if (prismaError.code === 'P2003') {
            // Double-check that user and test exist
            const userExists = await prisma.user.findUnique({ where: { id: userId } });
            const testExists = await prisma.test.findUnique({ where: { id: testId } });
            
            console.error('🔍 Existence check:', {
              userId,
              userExists: !!userExists,
              testId,
              testExists: !!testExists
            });
            
            return NextResponse.json({
              error: 'Database constraint violation',
              details: {
                code: 'P2003',
                userExists: !!userExists,
                testExists: !!testExists,
                userId,
                testId,
                constraint: prismaError.meta?.constraint || 'Unknown'
              }
            }, { status: 400 });
          }
        }
        
        throw createError;
      }
    } else {
      console.log('🔄 Updating existing test attempt:', existingAttempt.id);
      
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
      
      console.log('✅ Test attempt updated successfully:', testAttempt.id);
    }

    const response = {
      success: true,
      score: Math.round(scorePercentage * 100) / 100, // Round to 2 decimal places
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      testAttemptId: testAttempt.id,
      passed: passed,
      passingScore: test.passingScore
    };

    console.log('✅ Success response:', response);
    console.log('=== TEST SUBMISSION END ===\n');

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('❌ Critical error in test submission:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
      });
    }
    
    // Prisma-specific error handling
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error('Prisma error:', {
        code: prismaError.code,
        meta: prismaError.meta,
        clientVersion: prismaError.clientVersion
      });
      
      if (prismaError.code === 'P2003') {
        return NextResponse.json({
          error: 'Foreign key constraint error',
          code: 'P2003',
          details: 'User or Test reference is invalid',
          meta: prismaError.meta
        }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}