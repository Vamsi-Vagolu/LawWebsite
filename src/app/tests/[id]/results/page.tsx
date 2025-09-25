"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
  }, [session, testId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
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