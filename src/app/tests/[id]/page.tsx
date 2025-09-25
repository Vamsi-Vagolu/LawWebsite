"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Question {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface TestData {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  totalQuestions: number;
  passingScore: number; // ✅ Add this line
  questions: Question[];
  // ...other fields...
}

interface UserAnswer {
  selectedAnswer: string | null;
  isAnswered: boolean; // ✅ Add this line
  isFlagged: boolean;
}

export default function TestSeriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // Test data state
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Test taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // UI state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load test data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    fetchTestData();
  }, [session, status, testId, router]);

  const fetchTestData = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Call the real API instead of using mock data
      const response = await fetch(`/api/tests/${testId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Test not found');
          return;
        }
        throw new Error('Failed to fetch test data');
      }
      
      const data = await response.json();
      
      // ✅ Set the real test data from database
      setTestData({
        id: data.id,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        questions: data.questions
      });
      
      // Initialize user answers for all questions
      const initialAnswers: Record<string, UserAnswer> = {};
      data.questions.forEach((q: any) => {
        initialAnswers[q.id] = {
          selectedAnswer: null,
          isAnswered: false,
          isFlagged: false
        };
      });
      setUserAnswers(initialAnswers);
      
      // Set timer based on real time limit (convert minutes to seconds)
      setTimeRemaining(data.timeLimit * 60);
      
      console.log('✅ Real test data loaded:', data.title);
      
    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Failed to load test data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
  };

  const selectAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswer: answer,
        isAnswered: true
      }
    }));
  };

  const toggleFlag = (questionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isFlagged: !prev[questionId].isFlagged // <-- use isFlagged
      }
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (testData?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: userAnswers,
          timeSpent: (testData?.timeLimit || 0) * 60 - timeRemaining
        })
      });

      if (response.ok) {
        setTestCompleted(true);
        setShowSubmitDialog(false);
        router.push(`/tests/${testId}/results`);
      } else {
        const errorData = await response.json();
        console.error('Failed to submit test:', errorData.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      // You could add a toast notification here
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(`answers-${testId}`);
    if (saved) {
      setUserAnswers(JSON.parse(saved));
    }
  }, [testId]);

  useEffect(() => {
    if (testStarted && !testCompleted) {
      localStorage.setItem(`answers-${testId}`, JSON.stringify(userAnswers));
    }
  }, [userAnswers, testId, testStarted, testCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
          <button
            onClick={() => router.push('/tests')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion?.id];
  const answeredCount = Object.values(userAnswers).filter(a => a.selectedAnswer !== null).length;
  const flaggedCount = Object.values(userAnswers).filter(a => a.isFlagged).length;

  // Instructions screen
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{testData.title}</h1>
              <p className="text-gray-600">{testData.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">📋 Test Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-medium">{testData.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Limit:</span>
                    <span className="font-medium">{testData.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Question Type:</span>
                    <span className="font-medium">Multiple Choice</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passing Score:</span>
                    <span className="font-medium">70%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">📚 Instructions</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Read each question carefully before selecting an answer
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You can flag questions for review and return to them later
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use the navigation panel to jump to any question quickly
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Your answers are automatically saved as you progress
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Click "Submit Test" when you're ready to finish
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Test will auto-submit when time expires
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-amber-700">
                    Once you start the test, the timer will begin immediately. Make sure you have a stable internet connection and won't be interrupted.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startTest}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
              >
                🚀 Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main test interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{testData.title}</h1>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {testData.totalQuestions}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Answered: {answeredCount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Flagged: {flaggedCount}</span>
                </div>
              </div>
              
              {/* Timer */}
              <div className={`font-mono text-lg font-semibold px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 
                timeRemaining < 900 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / testData.totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Q{currentQuestion.questionNumber}
                  </span>
                  {currentAnswer?.isFlagged && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                      🏃 Flagged
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentAnswer?.isFlagged 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                  title={currentAnswer?.isFlagged ? 'Remove flag' : 'Flag for review'}
                >
                  🏁
                </button>
              </div>

              {/* Question */}
              <div className="mb-8">
                <p className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([option, text]) => (
                  <div key={option}>
                    <label 
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        currentAnswer?.selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={currentAnswer?.selectedAnswer === option}
                        onChange={() => selectAnswer(currentQuestion.id, option as 'A' | 'B' | 'C' | 'D')}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5 ${
                        currentAnswer?.selectedAnswer === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {currentAnswer?.selectedAnswer === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`font-semibold mr-3 ${
                            currentAnswer?.selectedAnswer === option ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {option}.
                          </span>
                        </div>
                        <p className={`text-gray-700 ${
                          currentAnswer?.selectedAnswer === option ? 'text-gray-900' : ''
                        }`}>
                          {text}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-3">
                  {currentQuestionIndex === testData.questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitDialog(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={() => goToQuestion(currentQuestionIndex + 1)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {testData.questions.map((question, index) => {
                  const answer = userAnswers[question.id];
                  const isAnswered = answer?.selectedAnswer !== null;
                  const isFlagged = answer?.isFlagged;
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white scale-110'
                          : isAnswered && isFlagged
                          ? 'bg-yellow-500 text-white'
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : isFlagged
                          ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="text-xs space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-gray-600">Flagged & Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded mr-2"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Not Visited</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium">{answeredCount}/{testData.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{testData.totalQuestions - answeredCount}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowSubmitDialog(true)}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Test?</h3>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{answeredCount}/{testData?.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged Questions:</span>
                  <span className="font-medium">{flaggedCount}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {answeredCount < (testData?.totalQuestions || 0) && 
                  `You have ${(testData?.totalQuestions || 0) - answeredCount} unanswered questions. `
                }
                Are you sure you want to submit your test?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
