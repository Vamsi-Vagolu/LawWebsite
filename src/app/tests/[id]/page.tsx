"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TestData, UserAnswer, APIResponse } from '@/types/api';

// Simple functions for navbar/footer visibility
const hideNavbarFooter = () => {
  const navbar = document.querySelector('nav');
  const footer = document.querySelector('footer');
  if (navbar) navbar.style.display = 'none';
  if (footer) footer.style.display = 'none';
};

const showNavbarFooter = () => {
  const navbar = document.querySelector('nav');
  const footer = document.querySelector('footer');
  if (navbar) navbar.style.display = '';
  if (footer) footer.style.display = '';
};

export default function TestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // Basic state
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});

  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // UI state
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simple storage key
  const storageKey = `test_${testId}`;

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Load test data
  useEffect(() => {
    if (!session || status === 'loading') return;

    const fetchTestData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tests/${testId}`);
        const apiResponse: APIResponse = await response.json();

        if (apiResponse.success && apiResponse.data) {
          setTestData(apiResponse.data);

          // Initialize answers
          const initialAnswers: Record<string, UserAnswer> = {};
          apiResponse.data.questions.forEach((q) => {
            initialAnswers[q.id] = {
              selectedAnswer: null,
              isAnswered: false,
              isFlagged: false
            };
          });
          setUserAnswers(initialAnswers);

          // Try to restore from localStorage
          restoreTestState();
        } else {
          setError(apiResponse.error?.error || 'Failed to load test');
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        setError('Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, session, status]);

  // Simple state restoration (only on page load)
  const restoreTestState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      const state = JSON.parse(saved);

      // Only restore if test was in progress
      if (state.testStarted && !state.testCompleted) {
        setTestStarted(true);
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setUserAnswers(state.userAnswers || {});
        setTimerEnabled(state.timerEnabled || false);
        setTestStartTime(state.testStartTime || Date.now());
        setShowInstructions(false);

        if (state.timerEnabled && testData) {
          const elapsed = Math.floor((Date.now() - state.testStartTime) / 1000);
          const remaining = Math.max(0, (testData.timeLimit * 60) - elapsed);
          setTimeRemaining(remaining);
        } else {
          // Initialize elapsed time for no-timer tests
          const elapsed = Math.floor((Date.now() - state.testStartTime) / 1000);
          setElapsedTime(elapsed);
        }

        hideNavbarFooter();
      }
    } catch (error) {
      console.error('Error restoring state:', error);
    }
  };

  // Simple state saving
  const saveTestState = () => {
    if (!testStarted || testCompleted) return;

    try {
      const state = {
        testStarted: true,
        testCompleted: false,
        currentQuestionIndex,
        userAnswers,
        timerEnabled,
        testStartTime,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // Simple timer - only runs when enabled
  useEffect(() => {
    if (!testStarted || testCompleted || !timerEnabled || timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) return; // Already running

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          handleSubmitTest();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [testStarted, testCompleted, timerEnabled, timeRemaining > 0]);

  // Elapsed time counter for no-timer tests
  useEffect(() => {
    if (!testStarted || testCompleted || timerEnabled) {
      return; // Don't run elapsed timer if test hasn't started, is completed, or timer is enabled
    }

    const elapsedTimerRef = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(elapsedTimerRef);
    };
  }, [testStarted, testCompleted, timerEnabled, testStartTime]);

  // Save state whenever important state changes
  useEffect(() => {
    if (testStarted) {
      saveTestState();
    }
  }, [testStarted, currentQuestionIndex, userAnswers]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      showNavbarFooter();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTest = (enableTimer: boolean) => {
    setTestStarted(true);
    setShowInstructions(false);
    setTimerEnabled(enableTimer);
    setTestStartTime(Date.now());

    if (enableTimer && testData) {
      setTimeRemaining(testData.timeLimit * 60);
    } else {
      setElapsedTime(0); // Start elapsed time from 00:00:00
    }

    hideNavbarFooter();

    // Clear any previous state
    localStorage.removeItem(storageKey);
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
        isFlagged: !prev[questionId]?.isFlagged
      }
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (testData?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmitTest = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const timeSpent = timerEnabled ? (testData?.timeLimit || 0) * 60 - timeRemaining : elapsedTime;

      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: userAnswers,
          timeSpent: timeSpent
        })
      });

      const apiResponse: APIResponse = await response.json();

      if (response.ok && apiResponse.success) {
        setTestCompleted(true);
        setShowSubmitDialog(false);
        localStorage.removeItem(storageKey);
        showNavbarFooter();
        router.push(`/tests/${testId}/results`);
      } else {
        setError(apiResponse.error?.error || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitTest = () => {
    setTestCompleted(true);
    localStorage.removeItem(storageKey);
    showNavbarFooter();
    router.push('/tests');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count answered and flagged questions
  const answeredCount = Object.values(userAnswers).filter(a => a.isAnswered).length;
  const flaggedCount = Object.values(userAnswers).filter(a => a.isFlagged).length;

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
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

  // Show instructions with timer option
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{testData.title}</h1>
              <p className="text-blue-100">{testData.description}</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📊 Test Details</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>Questions: <span className="font-medium">{testData.totalQuestions}</span></li>
                    <li>Category: <span className="font-medium">{testData.category}</span></li>
                    <li>Difficulty: <span className="font-medium">{testData.difficulty}</span></li>
                    {testData.timeLimit && (
                      <li>Suggested Time: <span className="font-medium">{testData.timeLimit} minutes</span></li>
                    )}
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Instructions</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Select one answer per question</li>
                    <li>• You can flag questions for review</li>
                    <li>• Navigate freely between questions</li>
                    <li>• Click Submit when finished</li>
                  </ul>
                </div>
              </div>

              {/* Timer Option */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-amber-800 mb-4">⏰ Time Limit Option</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="timer-enabled"
                      name="timer-option"
                      value="enabled"
                      onChange={() => setTimerEnabled(true)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <label htmlFor="timer-enabled" className="text-amber-800">
                      <span className="font-medium">Enable Timer</span> - Test will auto-submit after {testData.timeLimit} minutes
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="timer-disabled"
                      name="timer-option"
                      value="disabled"
                      onChange={() => setTimerEnabled(false)}
                      defaultChecked
                      className="w-4 h-4 text-amber-600"
                    />
                    <label htmlFor="timer-disabled" className="text-amber-800">
                      <span className="font-medium">No Timer</span> - Take as much time as you need
                    </label>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => router.push('/tests')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Tests
                  </button>
                  <button
                    onClick={() => startTest(timerEnabled)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
                  >
                    🚀 Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion.id];

  // Main test interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with timer - Optimized for Mobile */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          {/* Mobile Layout - Single Row */}
          <div className="flex lg:hidden items-center justify-between gap-2">
            {/* Left: Timer */}
            <div className="flex items-center gap-2 min-w-0">
              {timerEnabled ? (
                <div className={`font-mono text-sm font-bold px-2 py-1 rounded-lg shadow-sm ${timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : timeRemaining < 900 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              ) : (
                <div className="font-mono text-sm font-bold px-2 py-1 rounded-lg shadow-sm bg-green-100 text-green-700">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatTime(elapsedTime)}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-600 whitespace-nowrap">
                Q{currentQuestionIndex + 1}/{testData.totalQuestions}
              </div>
            </div>

            {/* Right: Submit/Exit Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowSubmitDialog(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-xs flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Submit
              </button>
              <button
                onClick={() => setShowExitDialog(true)}
                className="px-3 py-1.5 bg-red-100 border border-red-200 text-red-600 rounded-md hover:bg-red-200 text-xs flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Exit
              </button>
            </div>
          </div>

          {/* Desktop Layout - Original */}
          <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{testData.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Q{currentQuestionIndex + 1}/{testData.totalQuestions}</span>
                <span>•</span>
                <span>{answeredCount} Answered</span>
                {flaggedCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{flaggedCount} Flagged</span>
                  </>
                )}
              </div>
            </div>

            {timerEnabled ? (
              <div className={`font-mono text-lg font-bold px-4 py-2 rounded-xl shadow-md ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' :
                timeRemaining < 900 ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            ) : (
              <div className="font-mono text-lg font-bold px-4 py-2 rounded-xl shadow-md bg-green-100 text-green-700">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatTime(elapsedTime)}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentQuestionIndex + 1) / testData.totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / testData.totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Test Title */}
      <div className="lg:hidden bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-b">
        <h1 className="text-lg font-bold text-gray-900 truncate">{testData.title}</h1>
        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
          <span>{answeredCount} Answered</span>
          {flaggedCount > 0 && (
            <>
              <span>•</span>
              <span>{flaggedCount} Flagged</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Question {currentQuestion.questionNumber}
                    </span>
                    {currentAnswer?.isFlagged && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                        Flagged
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      currentAnswer?.isFlagged
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={currentAnswer?.isFlagged ? 'Remove flag' : 'Flag for review'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8">
                {/* Question */}
                <div className="mb-8">
                  <p className="text-xl text-gray-900 leading-relaxed font-medium">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([option, text]) => (
                    <div key={option}>
                      <label
                        className={`group flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          currentAnswer?.selectedAnswer === option
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
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

                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 mt-1 ${
                          currentAnswer?.selectedAnswer === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                          {currentAnswer?.selectedAnswer === option && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                              currentAnswer?.selectedAnswer === option
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 group-hover:bg-blue-100'
                            }`}>
                              {option}
                            </span>
                          </div>
                          <p className="text-base leading-relaxed text-gray-700">
                            {text}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="bg-gray-50 p-6 mt-8 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </button>
                    </div>

                    <div className="text-sm text-gray-500">
                      {currentQuestionIndex + 1} of {testData.totalQuestions}
                    </div>

                    <div className="flex space-x-3">
                      {currentQuestionIndex < testData.questions.length - 1 && (
                        <button
                          onClick={() => goToQuestion(currentQuestionIndex + 1)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                        >
                          Next
                          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigator Sidebar - Hidden on Mobile */}
          <div className="lg:col-span-1 order-2 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Questions ({answeredCount}/{testData.totalQuestions})
                </h3>
              </div>

              <div className="p-3">
                {/* Question grid */}
                <div className={`grid gap-1 mb-3 ${
                  testData.totalQuestions <= 25 ? 'grid-cols-5' :
                  testData.totalQuestions <= 50 ? 'grid-cols-7 sm:grid-cols-10' :
                  testData.totalQuestions <= 100 ? 'grid-cols-8 sm:grid-cols-10 lg:grid-cols-12' :
                  'grid-cols-10 sm:grid-cols-12 lg:grid-cols-15'
                }`}>
                  {testData.questions.map((question, index) => {
                    const answer = userAnswers[question.id];
                    const isAnswered = answer?.isAnswered;
                    const isFlagged = answer?.isFlagged;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative ${
                          testData.totalQuestions <= 25 ? 'w-10 h-10 text-xs' :
                          testData.totalQuestions <= 50 ? 'w-8 h-8 text-xs' :
                          testData.totalQuestions <= 100 ? 'w-7 h-7 text-[10px]' :
                          'w-6 h-6 text-[8px]'
                        } rounded-md font-bold transition-all duration-200 hover:scale-105 ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : isAnswered && isFlagged
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : isAnswered
                            ? 'bg-green-500 text-white'
                            : isFlagged
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={`Question ${index + 1}${isAnswered ? ' - Answered' : ''}${isFlagged ? ' - Flagged' : ''}`}
                      >
                        {index + 1}
                        {/* Status indicators */}
                        {isAnswered && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        )}
                        {isFlagged && (
                          <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-yellow-500 rounded-full border border-white"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                  <div className="text-center p-1 bg-green-50 rounded">
                    <div className="font-bold text-green-600 text-sm">{answeredCount}</div>
                    <div className="text-green-700">Done</div>
                  </div>
                  <div className="text-center p-1 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-600 text-sm">{flaggedCount}</div>
                    <div className="text-yellow-700">Flag</div>
                  </div>
                  <div className="text-center p-1 bg-gray-50 rounded">
                    <div className="font-bold text-gray-600 text-sm">{testData.totalQuestions - answeredCount}</div>
                    <div className="text-gray-700">Left</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-bold text-gray-800">{Math.round((answeredCount / testData.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(answeredCount / testData.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Submit and Exit Buttons */}
                <div className="mt-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowSubmitDialog(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Submit Test
                    </button>
                    <button
                      onClick={() => setShowExitDialog(true)}
                      className="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 hover:border-red-300 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Exit Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  <span className="font-medium">{answeredCount}/{testData.totalQuestions}</span>
                </div>
                {timerEnabled ? (
                  <div className="flex justify-between">
                    <span>Time Remaining:</span>
                    <span className="font-medium">{formatTime(timeRemaining)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>Elapsed Time:</span>
                    <span className="font-medium">{formatTime(elapsedTime)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Flagged Questions:</span>
                  <span className="font-medium">{flaggedCount}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {answeredCount < testData.totalQuestions &&
                  `You have ${testData.totalQuestions - answeredCount} unanswered questions. `
                }
                Are you sure you want to submit your test?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
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

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M7 12a5 5 0 1010 0 5 5 0 00-10 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Test?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your progress will be lost and you won't receive a score. Are you sure you want to exit the test?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitTest}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Exit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}