// Shared API types and interfaces

export interface APIError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
}

// Test-related types
export interface TestQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // Only included in results/admin views
  explanation?: string;
}

export interface TestData {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  totalQuestions: number;
  passingScore: number;
  isPublished: boolean;
  questions: TestQuestion[];
  createdAt: string;
}

export interface TestAttemptSubmission {
  answers: Record<string, {
    selectedAnswer: string | null;
    isAnswered: boolean;
    isFlagged: boolean;
  }>;
  timeSpent: number;
}

export interface TestResult {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  passingScore: number;
  completedAt: string | null;
  test: {
    id: string;
    title: string;
    description?: string;
    passingScore: number;
  };
  questions: TestQuestion[];
  answers: Record<string, any>;
}

// User answer type for quiz interface
export interface UserAnswer {
  selectedAnswer: string | null;
  isAnswered: boolean;
  isFlagged: boolean;
}

// Test list item for tests page
export interface TestListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  timeLimit: number | null;
  totalQuestions: number;
  passingScore: number | null;
  createdAt: string;
  questionsPreview: { id: string; questionNumber: number }[];
  totalAttempts: number;
  userAttempts: number;
  bestScore: number | null;
}

// Validation schemas (for future use with libraries like Zod)
export interface TestSubmissionValidation {
  testId: string;
  answers: Record<string, { selectedAnswer: string }>;
  timeSpent: number;
}