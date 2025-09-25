import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get or create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@lawfirm.com' },
      update: {},
      create: {
        email: 'admin@lawfirm.com',
        name: 'System Admin',
        role: 'ADMIN',
        password: 'admin123' // You should hash this in production
      }
    });

    console.log('👤 Admin user ready:', adminUser.email);

    // Create AIBE Test (6 Questions for Testing)
    const aibeTest = await prisma.test.create({
      data: {
        title: "AIBE XVIII",
        description: "Original All India Bar Examination XVIII practice test.",
        category: "AIBE",
        difficulty: "HARD",
        timeLimit: 180, // 3 hours for testing
        totalQuestions: 100, // Actual test has 100 questions
        passingScore: 40.0, // 40% = 40 questions (40 to pass)
        isPublished: true,
        createdBy: adminUser.id,
      }
    });

    console.log('📋 AIBE Test created:', aibeTest.title);

    // Create the 6 questions with correct answers from answer key
    const questions = [
      {
        questionNumber: 1,
        question: "Which of the following is incorrect with respect to diary of proceedings in investigation as per the Code of Criminal Procedure, 1973?",
        options: {
          A: "The statements of witnesses recorded during investigation shall be inserted in the diary.",
          B: "The diary shall be duly paginated.",
          C: "The diary may be used as evidence.",
          D: "Can be used by the police officers to refresh memory."
        },
        correctAnswer: "C", // From answer key
        explanation: "The diary of proceedings in an investigation is a crucial document and its contents are generally not admissible as evidence in court. This is to ensure that the evidence presented in court is not tainted by previous recordings or notes made during the investigation."
      },
      {
        questionNumber: 2,
        question: "In which of the following cases manner of committing offence is not required to be mentioned in the charge as per the Code of Criminal Procedure, 1973?",
        options: {
          A: "A is accused of the theft of a certain article at a certain time and place.",
          B: "A is accused of cheating B at a given time and place.",
          C: "A is accused of disobeying a direction of the law with intent to save B from punishment.",
          D: "A is accused of giving false evidence at a given time and place."
        },
        correctAnswer: "A", // From answer key
        explanation: "In cases of theft, it is sufficient to specify the article stolen, the time, and the place. The manner of committing the offence, such as how the theft was carried out, does not need to be detailed in the charge."
      },
      {
        questionNumber: 3,
        question: "Which of the following offences may be tried summarily as per the Code of Criminal Procedure, 1973?",
        options: {
          A: "Offence under Section 454 of the IPC.",
          B: "Offence under Section 504 of the IPC.",
          C: "Offence punishable with imprisonment for a term not exceeding two years.",
          D: "Offence punishable with life imprisonment."
        },
        correctAnswer: "C", // From answer key
        explanation: "Summary trials are meant for offences that are less serious and carry a maximum punishment of two years imprisonment. Offences punishable with more than two years or with life imprisonment are not triable summarily."
      },
      {
        questionNumber: 4,
        question: "Which of the following Section of the Code of Criminal Procedure, 1973 provides for reference to High Court?",
        options: {
          A: "Section 275",
          B: "Section 325",
          C: "Section 383",
          D: "Section 395"
        },
        correctAnswer: "D", // From answer key
        explanation: "Section 395 of the CrPC provides for the reference of certain cases to the High Court. This is usually in the nature of a revision or an appeal against the order of a lower court."
      },
      {
        questionNumber: 5,
        question: "A person accused of the following offence may not be granted bail under Section 438 of the Code of Criminal Procedure, 1973: i. Accused of offence under Section 376AB of the IPC; ii. Accused of offence under Section 376DA of the IPC; iii. Accused of offence under Section 376DB of the IPC;",
        options: {
          A: "i & ii",
          B: "ii & iii",
          C: "iii & i",
          D: "i, ii & iii"
        },
        correctAnswer: "D", // From answer key
        explanation: "Section 438 of the CrPC deals with anticipatory bail. However, in cases of serious offences like rape (IPC Sections 376AB, 376DA, 376DB), bail is typically not granted as these are non-bailable offences due to their serious nature."
      },
      {
        questionNumber: 6,
        question: "Which of the following act if done by any Magistrate, even in good faith without being empowered, shall vitiate the proceedings as per the Code of Criminal Procedure, 1973?",
        options: {
          A: "Tender a pardon under Section 306 of CrPC.",
          B: "Recall a case and try it under Section 410 of the CrPC.",
          C: "Attaches property under Section 83 of the CrPC.",
          D: "Hold an inquest under Section 176 of the CrPC."
        },
        correctAnswer: "C", // From answer key
        explanation: "Certain acts, if done without proper authority or empowerment, can nullify the proceedings. For instance, attaching property under Section 83 without being empowered to do so would vitiate the proceedings."
      }
    ];

    // Insert all questions
    for (const questionData of questions) {
      await prisma.question.create({
        data: {
          testId: aibeTest.id,
          questionNumber: questionData.questionNumber,
          question: questionData.question,
          options: questionData.options, // { A: "...", B: "...", C: "...", D: "..." }
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
        }
      });
    }

    console.log('✅ All 6 questions created successfully!');
    console.log(`📝 Test ID: ${aibeTest.id}`);
    console.log(`⏱️  Time Limit: 15 minutes (for testing)`);
    console.log(`🎯 Pass Mark: 40% (3 out of 6 questions)`);
    console.log('');
    console.log('🚀 Ready to test! Visit: http://localhost:3000/tests');

  } catch (error) {
    console.error('❌ Error creating AIBE test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});