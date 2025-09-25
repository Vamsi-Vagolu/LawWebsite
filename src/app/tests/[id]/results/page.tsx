"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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

interface TestResult {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  test: {
    title: string;
    passingScore: number;
  };
  // optional detailed fields if API returns them
  questions?: Question[];
  answers?: Record<
    string,
    { selectedAnswer: string | null; isAnswered?: boolean; isFlagged?: boolean }
  >;
}

export default function TestResultsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [results, setResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, testId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tests/${testId}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error('Failed to fetch results:', response.status);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!results) return <div className="min-h-screen flex items-center justify-center">Results not found</div>;

  const percentage = Math.round(results.score);
  const passed = percentage >= results.test.passingScore;

  // Helpers for detailed display
  const questionList = results.questions || [];
  const answers = results.answers || {};

  const optionLabel = (opt: 'A' | 'B' | 'C' | 'D') => opt;
  const optionText = (q: Question | undefined, opt: 'A' | 'B' | 'C' | 'D') =>
    q ? q.options[opt] : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">{results.test.title}</p>
        </div>

        {/* Score Card */}
        <div className={`bg-white rounded-2xl shadow-xl border-2 p-8 mb-8 ${
          passed ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${
              passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {percentage}%
            </div>
            <div className={`text-xl font-semibold mb-2 ${
              passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {passed ? '🎉 Congratulations! You Passed!' : '😞 You Need More Practice'}
            </div>
            <p className="text-gray-600">
              You scored {results.correctCount} out of {results.totalQuestions} questions correctly
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{results.correctCount}</div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-gray-600">Time Spent</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'PASS' : 'FAIL'}
            </div>
            <div className="text-gray-600">Result</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h2>
            <div className="text-sm text-gray-600">Questions: {results.totalQuestions}</div>
          </div>

          {questionList.length === 0 ? (
            <div className="text-sm text-gray-600">Detailed question data not available.</div>
          ) : (
            <ol className="space-y-4">
              {questionList.map((q) => {
                const user = answers[q.id];
                const userChoice = user?.selectedAnswer as 'A' | 'B' | 'C' | 'D' | null | undefined;
                const correct = q.correctAnswer;
                const isCorrect = userChoice === correct;

                return (
                  <li key={q.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm text-gray-500">Q{q.questionNumber}</div>
                        <div className="font-medium text-gray-900">{q.question}</div>
                      </div>
                      <div className="text-sm">
                        {isCorrect ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Correct</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Incorrect</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Your Answer</div>
                        {userChoice ? (
                          <div className="p-3 bg-gray-50 rounded">
                            <div className="flex items-start">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3 ${
                                isCorrect ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {optionLabel(userChoice)}
                              </div>
                              <div>
                                <div className="font-medium">{optionText(q, userChoice)}</div>
                                <div className="text-xs text-gray-500">({userChoice})</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No answer provided</div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Correct Answer</div>
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3 bg-green-600 text-white">
                              {optionLabel(correct)}
                            </div>
                            <div>
                              <div className="font-medium">{optionText(q, correct)}</div>
                              <div className="text-xs text-gray-500">({correct})</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {q.correctAnswer && userChoice && userChoice !== q.correctAnswer && (
                      <div className="mt-3 text-sm text-gray-600">
                        Explanation not available. {/* future: show q.explanation if provided */}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/tests/${testId}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            Retake Test
          </Link>
          <Link
            href="/tests"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
          >
            Browse More Tests
          </Link>
        </div>
      </div>
    </div>
  );
}