// src/app/tests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // ✅ ADD THIS MISSING IMPORT
import Link from 'next/link';

interface TestSeries {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  totalQuestions: number;
  timeLimit: number;
  passingScore: number;
  userAttempts?: number;
  bestScore?: number | null;
  createdAt: string;
}

export default function TestSeriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter(); // ✅ NOW THIS WILL WORK
  
  const [tests, setTests] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // ✅ IMPROVED LOGIN RESTRICTION
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login?callbackUrl=' + encodeURIComponent('/tests'));
      return;
    }
    
    fetchTests();
  }, [session, status, router]);

  const fetchTests = async () => {
    try {
      // Replace with actual API call once route is created
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        // Fallback to mock data if API not ready
        setTests(mockTests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Fallback to mock data
      setTests(mockTests);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const mockTests: TestSeries[] = [
    {
      id: "1",
      title: "Constitutional Law Fundamentals",
      description: "Test your knowledge of constitutional principles, fundamental rights, and constitutional interpretation.",
      category: "Constitutional Law",
      difficulty: "MEDIUM",
      totalQuestions: 50,
      timeLimit: 60,
      passingScore: 70,
      userAttempts: 2,
      bestScore: 85,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2", 
      title: "Criminal Law Essentials",
      description: "Comprehensive test covering criminal offenses, procedures, and legal principles.",
      category: "Criminal Law",
      difficulty: "HARD",
      totalQuestions: 40,
      timeLimit: 45,
      passingScore: 75,
      userAttempts: 1,
      bestScore: 78,
      createdAt: "2024-01-10T09:00:00Z"
    },
    {
      id: "3",
      title: "Contract Law Basics", 
      description: "Foundation concepts in contract formation, performance, and breach.",
      category: "Contract Law",
      difficulty: "EASY",
      totalQuestions: 30,
      timeLimit: 30,
      passingScore: 65,
      userAttempts: 0,
      bestScore: null,
      createdAt: "2024-01-20T14:00:00Z"
    }
  ];

  // ✅ LOADING STATE DURING AUTH CHECK
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ REDIRECT MESSAGE
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please log in to access tests...</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(tests.map(test => test.category))];
  const difficulties = ['All', 'EASY', 'MEDIUM', 'HARD'];

  const filteredTests = tests.filter(test => {
    const categoryMatch = selectedCategory === 'All' || test.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">📝 Practice Tests</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test your legal knowledge with our comprehensive practice exams. Track your progress and identify areas for improvement.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedDifficulty === difficulty
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {difficulty === 'All' ? 'All Levels' : difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{filteredTests.length}</div>
            <div className="text-gray-600">Available Tests</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {tests.filter(t => (t.userAttempts || 0) > 0).length}
            </div>
            <div className="text-gray-600">Tests Attempted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {tests.filter(t => t.bestScore && t.bestScore >= t.passingScore).length}
            </div>
            <div className="text-gray-600">Tests Passed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {tests.reduce((sum, t) => sum + (t.userAttempts || 0), 0)}
            </div>
            <div className="text-gray-600">Total Attempts</div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{test.category}</span>
                  </div>
                  {test.bestScore && (
                    <div className={`text-right ${getScoreColor(test.bestScore, test.passingScore)}`}>
                      <div className="text-lg font-bold">{test.bestScore}%</div>
                      <div className="text-xs">Best Score</div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {test.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {test.description}
                </p>
              </div>

              {/* Card Stats */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {test.totalQuestions} Questions
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {test.timeLimit} Minutes
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Pass: {test.passingScore}%
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {test.userAttempts || 0} Attempts
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6">
                <Link
                  href={`/tests/${test.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  {test.userAttempts && test.userAttempts > 0 ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake Test
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 100 5H9m4.5-5.5H15m0 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Start Test
                    </>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more tests.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}