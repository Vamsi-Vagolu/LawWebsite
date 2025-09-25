"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TestData, UserAnswer, APIResponse } from '@/types/api';

// Custom CSS animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }

  /* Enhanced focus states */
  .enhanced-focus:focus {
    outline: none;
    ring: 2px;
    ring-color: rgb(59 130 246);
    ring-offset: 2px;
  }

  /* Smooth transitions for all interactive elements */
  .smooth-transition {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// Using types from @/types/api instead of local interfaces

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
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Refs for persistence
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastVisibleTime = useRef<number>(Date.now());
  
  // UI state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Simplified visibility handling - just tracks tab state and saves on hide
  useEffect(() => {
    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);

      if (testStarted && !testCompleted && !isVisible) {
        // Tab became hidden - save state immediately
        saveTestState();
      }
    };

    // Prevent page refresh/navigation during test
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testStarted && !testCompleted) {
        // Save state before leaving
        const currentState = {
          userAnswers,
          currentQuestionIndex,
          timeRemaining,
          testStartTime,
          testStarted: true,
          lastSaveTime: Date.now()
        };
        try {
          localStorage.setItem(`test-state-${testId}`, JSON.stringify(currentState));
        } catch (error) {
          console.error('Failed to save state before unload:', error);
        }

        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress has been saved.';
        return e.returnValue;
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, testCompleted, userAnswers, currentQuestionIndex, timeRemaining, testStartTime, testId]);

  // Load test data
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    fetchTestData();
  }, [session, status, testId, router]);

  // Enhanced state management functions
  const saveTestState = () => {
    if (!testStarted || testCompleted) return;

    try {
      setAutoSaveStatus('saving');
      const testState = {
        userAnswers,
        currentQuestionIndex,
        timeRemaining,
        testStartTime,
        testStarted,
        lastSaveTime: Date.now()
      };

      localStorage.setItem(`test-state-${testId}`, JSON.stringify(testState));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error('Failed to save test state:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    }
  };

  const loadTestState = () => {
    try {
      const savedState = localStorage.getItem(`test-state-${testId}`);
      console.log('🔄 Loading test state:', savedState);

      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('📋 Parsed state:', state);

        // Only restore if the test was started but not completed
        if (state.testStarted && state.userAnswers && Object.keys(state.userAnswers).length > 0) {
          console.log('✅ Restoring test state...');

          // Restore all state immediately
          setUserAnswers(state.userAnswers);
          setCurrentQuestionIndex(state.currentQuestionIndex || 0);
          setTestStarted(true);
          setTestStartTime(state.testStartTime);
          setShowInstructions(false);

          // Calculate elapsed time since test started (more accurate than last save time)
          const now = Date.now();
          const testStartTime = state.testStartTime || now;
          const elapsedSinceStart = Math.floor((now - testStartTime) / 1000);
          const originalTimeLimit = testData?.timeLimit ? testData.timeLimit * 60 : 0;

          // Calculate remaining time based on elapsed time since test start
          const newTimeRemaining = Math.max(0, originalTimeLimit - elapsedSinceStart);
          setTimeRemaining(newTimeRemaining);

          console.log('⏰ Time calculation:', {
            originalTimeLimit,
            elapsedSinceStart,
            newTimeRemaining
          });

          if (newTimeRemaining <= 0) {
            // Time expired while away
            console.log('⚠️ Time expired, auto-submitting...');
            setTimeout(() => handleSubmitTest(), 1000);
          }

          console.log(`✅ Test state restored. Elapsed: ${Math.floor(elapsedSinceStart / 60)}:${(elapsedSinceStart % 60).toString().padStart(2, '0')}`);
        }
      }
    } catch (error) {
      console.error('Failed to load test state:', error);
    }
  };

  const clearTestState = () => {
    localStorage.removeItem(`test-state-${testId}`);
    localStorage.removeItem(`answers-${testId}`);
  };

  const fetchTestData = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/tests/${testId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Test not found');
          return;
        }
        throw new Error('Failed to fetch test data');
      }

      const apiResponse: APIResponse<TestData> = await response.json();

      if (apiResponse.success && apiResponse.data) {
        setTestData(apiResponse.data);
      } else {
        setError(apiResponse.error?.error || 'Failed to load test data');
        return;
      }

      // Initialize user answers for all questions
      const initialAnswers: Record<string, UserAnswer> = {};
      apiResponse.data.questions.forEach((q) => {
        initialAnswers[q.id] = {
          selectedAnswer: null,
          isAnswered: false,
          isFlagged: false
        };
      });

      // Set default values
      setUserAnswers(initialAnswers);
      setTimeRemaining(apiResponse.data.timeLimit * 60);

      console.log('✅ Test data loaded, attempting to restore state...');

      // Try to load saved state AFTER test data is loaded
      setTimeout(() => {
        loadTestState();
      }, 100); // Small delay to ensure state is set
      
    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Failed to load test data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fixed timer logic - runs continuously regardless of tab visibility
  useEffect(() => {
    if (!testStarted || testCompleted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    console.log('🕐 Starting timer, current time remaining:', timeRemaining);

    // Start timer - runs continuously regardless of tab visibility
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);

        // Auto-save every 30 seconds
        if (newTime > 0 && newTime % 30 === 0) {
          console.log('💾 Auto-saving at timer tick');
          saveTestState();
        }

        if (newTime <= 0) {
          console.log('⏰ Time expired, auto-submitting');
          // Auto-submit when time runs out
          setTimeout(() => handleSubmitTest(), 100);
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
  }, [testStarted, testCompleted, testId]);

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
    setTestStartTime(Date.now());

    // Clear any previous state and start fresh
    clearTestState();

    // Save initial state
    setTimeout(() => saveTestState(), 1000);
  };

  const selectAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedAnswer: answer,
          isAnswered: true
        }
      };

      // Immediately save to localStorage when answer changes
      const currentState = {
        userAnswers: updated,
        currentQuestionIndex,
        timeRemaining,
        testStartTime,
        testStarted: true,
        lastSaveTime: Date.now()
      };

      try {
        localStorage.setItem(`test-state-${testId}`, JSON.stringify(currentState));
        console.log('💾 Answer saved immediately:', { questionId, answer, updated });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 1500);
      } catch (error) {
        console.error('Failed to save answer:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus(null), 2000);
      }

      return updated;
    });
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

  const handleExitTest = () => {
    // Clear saved state and exit
    clearTestState();
    setTestCompleted(true);
    router.push('/tests');
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

      const apiResponse: APIResponse = await response.json();

      if (response.ok && apiResponse.success) {
        setTestCompleted(true);
        setShowSubmitDialog(false);

        // Clear saved state on successful submission
        clearTestState();

        router.push(`/tests/${testId}/results`);
      } else {
        console.error('Failed to submit test:', apiResponse.error?.error || 'Unknown error');
        setError(apiResponse.error?.error || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Network error occurred while submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up old localStorage entries on component mount
  useEffect(() => {
    const oldAnswers = localStorage.getItem(`answers-${testId}`);
    if (oldAnswers) {
      localStorage.removeItem(`answers-${testId}`);
    }
  }, [testId]);

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
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header with timer and progress */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{testData.title}</h1>
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                <span>Q{currentQuestionIndex + 1}/{testData.totalQuestions}</span>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                  {answeredCount}<span className="hidden sm:inline"> Answered</span>
                </span>
                {flaggedCount > 0 && (
                  <>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                      {flaggedCount}<span className="hidden sm:inline"> Flagged</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Auto-save status */}
              {autoSaveStatus && (
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                  autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Error</span>
                    </>
                  )}
                </div>
              )}

              {/* Enhanced Timer */}
              <div className={`font-mono text-sm sm:text-lg font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-md transition-all duration-300 ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse border-2 border-red-300' :
                timeRemaining < 900 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                'bg-blue-100 text-blue-700 border-2 border-blue-300'
              }`}>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Tab visibility indicator */}
              {!isTabVisible && (
                <div className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-ping"></div>
                    Tab Hidden
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentQuestionIndex + 1) / testData.totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${((currentQuestionIndex + 1) / testData.totalQuestions) * 100}%` }}
              >
                <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Enhanced Question Panel */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Enhanced Question Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        Question {currentQuestion.questionNumber}
                      </span>
                      {currentAnswer?.isAnswered && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {currentAnswer?.isFlagged && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-yellow-200 animate-bounce hidden sm:inline-flex">
                        <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                        </svg>
                        Flagged for Review
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`group relative p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      currentAnswer?.isFlagged
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 shadow-md'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 shadow-sm'
                    }`}
                    title={currentAnswer?.isFlagged ? 'Remove flag' : 'Flag for review'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {currentAnswer?.isFlagged ? 'Remove flag' : 'Flag for review'}
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Enhanced Question */}
                <div className="mb-6 sm:mb-8">
                  <div className="prose prose-base sm:prose-lg max-w-none">
                    <p className="text-lg sm:text-xl text-gray-900 leading-relaxed font-medium">
                      {currentQuestion.question}
                    </p>
                  </div>
                </div>

                {/* Enhanced Options */}
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([option, text], index) => (
                    <div key={option} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                      <label
                        className={`group flex items-start p-3 sm:p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] ${
                          currentAnswer?.selectedAnswer === option
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
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

                        {/* Enhanced Radio Button */}
                        <div className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 mt-1 transition-all duration-200 ${
                          currentAnswer?.selectedAnswer === option
                            ? 'border-blue-500 bg-blue-500 shadow-lg'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                          {currentAnswer?.selectedAnswer === option && (
                            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          )}
                          <div className={`absolute w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                            currentAnswer?.selectedAnswer === option ? 'opacity-100' : 'opacity-0'
                          }`}></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2 sm:mb-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold mr-3 sm:mr-4 transition-colors ${
                              currentAnswer?.selectedAnswer === option
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                            }`}>
                              {option}
                            </span>
                          </div>
                          <p className={`text-sm sm:text-base leading-relaxed transition-colors ${
                            currentAnswer?.selectedAnswer === option
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {text}
                          </p>
                        </div>

                        {/* Selection indicator */}
                        {currentAnswer?.selectedAnswer === option && (
                          <div className="ml-2 sm:ml-4 text-blue-500 animate-fadeIn">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Enhanced Navigation */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 lg:p-6 mt-6 sm:mt-8 rounded-xl border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                    <div className="flex space-x-3 order-2 sm:order-1">
                      <button
                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="group flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:shadow-sm"
                      >
                        <svg className="w-4 h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>

                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 order-1 sm:order-2">
                      <span className="bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                        {currentQuestionIndex + 1} of {testData.totalQuestions}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-end order-3 w-full sm:w-auto">
                      {currentQuestionIndex === testData.questions.length - 1 ? (
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => setShowExitDialog(true)}
                            className="flex items-center justify-center flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                          >
                            <svg className="w-4 h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">Exit Test</span>
                            <span className="sm:hidden">Exit</span>
                          </button>
                          <button
                            onClick={() => setShowSubmitDialog(true)}
                            className="group flex items-center justify-center flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Submit Test
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => goToQuestion(currentQuestionIndex + 1)}
                          className="group flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                        >
                          Next
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Enhanced Question Navigator Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Questions ({answeredCount}/{testData.totalQuestions})
                </h3>
              </div>

              <div className="p-3">
                {/* Responsive question grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-8 gap-1 mb-4">
                  {testData.questions.map((question, index) => {
                    const answer = userAnswers[question.id];
                    const isAnswered = answer?.selectedAnswer !== null;
                    const isFlagged = answer?.isFlagged;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative w-8 h-8 rounded-lg text-[10px] font-bold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-1 ring-blue-400 scale-105'
                            : isAnswered && isFlagged
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm'
                            : isAnswered
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                            : isFlagged
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={`Question ${index + 1}${isAnswered ? ' - Answered' : ''}${isFlagged ? ' - Flagged' : ''}`}
                      >
                        {index + 1}
                        {/* Smaller status indicators */}
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

                {/* Compact Legend */}
                <div className="space-y-1 text-xs mb-4">
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded mr-2"></div>
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <span className="font-bold text-green-600">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded mr-2"></div>
                      <span className="text-gray-600">Flagged</span>
                    </div>
                    <span className="font-bold text-yellow-600">{flaggedCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                      <span className="text-gray-600">Remaining</span>
                    </div>
                    <span className="font-bold text-gray-600">{testData.totalQuestions - answeredCount}</span>
                  </div>
                </div>

                {/* Compact Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-bold text-gray-800">{Math.round((answeredCount / testData.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(answeredCount / testData.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <button
                    onClick={() => setShowSubmitDialog(true)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit Test
                  </button>
                </div>
              </div>
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

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M7 12a5 5 0 1010 0 5 5 0 00-10 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Test?</h3>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{answeredCount}/{testData?.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Your progress will be lost and you won't receive a score. Are you sure you want to exit the test?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitTest}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Exit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
