import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, get or create a system user (admin)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lawfirm.com' },
    update: {},
    create: {
      email: 'admin@lawfirm.com',
      name: 'System Admin',
      role: 'ADMIN'
    }
  });

  // Create the AIBE test
  const aibeTest = await prisma.test.create({
    data: {
      title: "AIBE-XVIII Mock Test - Set Code B",
      description: "All India Bar Examination practice test with 100 questions covering Criminal Law, Constitutional Law, Civil Procedure, Evidence Act, and other legal subjects.",
      category: "AIBE",
      difficulty: "HARD",
      timeLimit: 180,
      totalQuestions: 100,
      passingScore: 40.0,
      isPublished: true,
      createdBy: adminUser.id,
    }
  });

  // Answer key mapping
  const answers = {
    1: "C", 2: "A", 3: "C", 4: "D", 5: "D", 6: "C", 7: "A", 8: "A", 9: "B", 10: "C",
    11: "C", 12: "B", 13: "B", 14: "C", 15: "B", 16: "D", 17: "D", 18: "B", 19: "C", 20: "D",
    21: "B", 22: "A", 23: "B", 24: "A", 25: "D", 26: "B", 27: "A", 28: "C", 29: "C", 30: "D",
    31: "B", 32: "B", 33: "C", 34: "C", 35: "C", 36: "C", 37: "B", 38: "C", 39: "C", 40: "B",
    41: "A", 42: "B", 43: "B", 44: "B", 45: "D", 46: "A", 47: "D", 48: "B", 49: "B", 50: "A",
    51: "C", 52: "A", 53: "D", 54: "D", 55: "A", 56: "D", 57: "D", 58: "D", 59: "A", 60: "A",
    61: "C", 62: "B", 63: "B", 64: "B", 65: "B", 66: "B", 67: "C", 68: "C", 69: "B", 70: "B",
    71: "C", 72: "B", 73: "B", 74: "C", 75: "B", 76: "B", 77: "C", 78: "B", 79: "B", 80: "A",
    81: "D", 82: "A", 83: "C", 84: "C", 85: "C", 86: "A", 87: "D", 88: "A", 89: "C", 90: "C",
    91: "D", 92: "C", 93: "A", 94: "B", 95: "D", 96: "B", 97: "C", 98: "A", 99: "B", 100: "A"
  };

  // Sample questions (I'll create first few, you can add the rest)
  const sampleQuestions = [
    {
      questionNumber: 1,
      question: "Which of the following is incorrect with respect to diary of proceedings in investigation as per the Code of Criminal Procedure, 1973?",
      optionA: "The statements of witnesses recorded during investigation shall be inserted in the diary.",
      optionB: "The diary shall be duly paginated.",
      optionC: "The diary may be used as evidence.",
      optionD: "Can be used by the police officers to refresh memory.",
    },
    // Add more questions here...
  ];

  // Create questions
  for (const questionData of sampleQuestions) {
    await prisma.question.create({
      data: {
        testId: aibeTest.id,
        questionNumber: questionData.questionNumber,
        question: questionData.question,
        optionA: questionData.optionA,
        optionB: questionData.optionB,
        optionC: questionData.optionC,
        optionD: questionData.optionD,
        correctAnswer: answers[questionData.questionNumber as keyof typeof answers]
      }
    });
  }

  console.log('✅ AIBE Mock Test created successfully!');
  console.log(`📝 Test ID: ${aibeTest.id}`);
  console.log(`🎯 Total Questions: ${sampleQuestions.length} (add remaining 99)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });