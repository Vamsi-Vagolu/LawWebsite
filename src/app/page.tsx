"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FIRM_NAME } from "../config";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const [tests, setTests] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    difficulty?: string;
    totalQuestions: number;
    timeLimit?: number;
    bestScore?: number | null;
    createdAt: string;
  }>>([]);
  const [bareActs, setBareActs] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    slug: string;
    order: number;
    createdAt: string;
  }>>([]);
  
  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  // ✅ Dynamic greeting based on current time
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good afternoon");
      } else if (currentHour >= 17 && currentHour < 22) {
        setGreeting("Good evening");
      } else {
        setGreeting("Welcome back");
      }
    };

    // Update greeting immediately
    updateGreeting();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch tests and bareacts data for all users (public API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests
        const testsResponse = await fetch('/api/tests/public');
        if (testsResponse.ok) {
          const testsResult = await testsResponse.json();
          setTests(testsResult.data?.slice(0, 6) || []); // Show first 6 tests
        }

        // Fetch bareacts
        const bareActsResponse = await fetch('/api/bareacts');
        if (bareActsResponse.ok) {
          const bareActsResult = await bareActsResponse.json();
          setBareActs(bareActsResult.data?.slice(0, 6) || []); // Show first 6 bareacts
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const stats = {
    testsAvailable: tests.length || 0
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-2xl">{FIRM_NAME.charAt(0)}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">{FIRM_NAME}</h1>
            </div>
            
            {isLoggedIn ? (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  {greeting}, {userName}! 🙏
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                  Ready to continue your legal education journey? Access your personalized dashboard with study materials, progress tracking, and practice tests tailored just for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/notes"
                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Continue Reading
                  </Link>
                  <Link
                    href="/tests"
                    className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-slate-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Take Practice Test
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                  Master Law with Simple, Clear Explanations
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                  Transform complex legal concepts into easy-to-understand language. Access comprehensive study materials, practice tests, and educational resources designed for law students and legal professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Start Learning Free
                  </Link>
                  <Link
                    href="/notes"
                    className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-slate-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Browse Notes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Adaptive based on auth status */}
      {isLoggedIn ? (
        // Dashboard Content for Logged-in Users
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-green-800">{stats.testsAvailable}</p>
                    <p className="text-green-600 font-medium">Tests Available</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-blue-800">Notes</p>
                    <p className="text-blue-600 font-medium">Study Materials</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Search Notes */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes, subjects, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button className="absolute right-3 top-3 text-gray-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quick Access */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/notes"
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">Notes</span>
                  </Link>
                  <Link
                    href="/tests"
                    className="p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Tests</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Available Tests */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Practice Tests</h3>
                <Link href="/tests" className="text-green-600 hover:text-green-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {tests.length > 0 ? tests.slice(0, 3).map((test) => (
                  <Link key={test.id} href={`/tests/${test.id}`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{test.title}</h4>
                      <p className="text-sm text-gray-600">
                        {test.category} • {test.totalQuestions} questions
                        {test.difficulty && ` • ${test.difficulty}`}
                      </p>
                      {test.bestScore !== null && (
                        <p className="text-xs text-green-600 font-medium mt-1">Best Score: {test.bestScore}%</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No tests available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available BareActs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Available BareActs</h3>
                {bareActs.length > 3 && (
                  <span className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All →
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {bareActs.length > 0 ? bareActs.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{act.title}</h4>
                      <p className="text-sm text-gray-600">
                        {act.category} • {act.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No BareActs available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Marketing Content for Non-logged Users
        <>
          {/* Features Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Why Choose {FIRM_NAME}?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The most comprehensive legal education platform designed for students, professionals, and anyone seeking to understand law in simple terms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Simplified Notes</h3>
                  <p className="text-gray-600 text-sm">
                    Complex legal concepts explained in simple, understandable language with real examples.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Practice Tests</h3>
                  <p className="text-gray-600 text-sm">
                    Test your knowledge with comprehensive quizzes and track your learning progress.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Progress Tracking</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your study progress with detailed analytics and personalized insights.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">100% Free</h3>
                  <p className="text-gray-600 text-sm">
                    All educational content and features are completely free for students and learners.
                  </p>
                </div>
              </div>

              {/* Key Benefits Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Everything You Need to Excel in Law</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Constitutional Law & Fundamental Rights</h4>
                        <p className="text-gray-600 text-sm">Comprehensive coverage of constitutional principles and civil liberties</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Criminal Law & Procedure</h4>
                        <p className="text-gray-600 text-sm">Criminal offenses, procedures, and legal principles explained clearly</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Contract Law & Business Law</h4>
                        <p className="text-gray-600 text-sm">Contract formation, business regulations, and commercial law</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Legal Research & Writing</h4>
                        <p className="text-gray-600 text-sm">Essential skills for legal analysis and professional writing</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-4">Join Our Community</h4>
                    <p className="text-gray-600 mb-6">Learning law has never been this simple and accessible. Start your journey today!</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">Notes</div>
                        <div className="text-sm text-gray-600">Study Materials</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">Tests</div>
                        <div className="text-sm text-gray-600">Practice Available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Tests Preview for Non-logged Users */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  ✨ Featured Practice Tests
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Challenge yourself with our expertly crafted practice tests. Each test is designed to reinforce key concepts and prepare you for real-world applications. <span className="text-amber-600 font-semibold">Create a free account to start testing your knowledge!</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {tests.length > 0 ? tests.slice(0, 6).map((test) => (
                  <div key={test.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {test.difficulty && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          test.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                          test.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {test.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{test.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{test.description || 'Comprehensive practice test to evaluate your knowledge and understanding.'}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">{test.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{test.category}</span>
                      </div>
                      {test.timeLimit && (
                        <div className="flex justify-between">
                          <span>Time Limit:</span>
                          <span className="font-medium">{Math.floor(test.timeLimit / 60)} minutes</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{new Date(test.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-block text-center"
                    >
                      Login to Take Test
                    </Link>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No tests available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* BareActs Section for Non-logged Users */}
          <section className="py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  📚 Essential Legal Documents (BareActs)
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Access key legal documents and acts that form the foundation of legal study. Essential references for students and professionals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {bareActs.length > 0 ? bareActs.slice(0, 6).map((act) => (
                  <div key={act.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        act.category === 'AIBE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {act.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{act.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{act.description || 'Essential legal document for reference and study.'}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{act.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Added:</span>
                        <span className="font-medium">{new Date(act.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-block text-center"
                    >
                      Login to Access
                    </Link>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No BareActs available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 text-white py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">🚀 Start Your Legal Journey Today!</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                  Master law with simple explanations. Get instant access to study materials, practice tests, and progress tracking - completely free!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Simplified Legal Notes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Practice Tests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Progress Tracking</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="px-10 py-4 bg-transparent border-2 border-amber-400 hover:bg-amber-400 text-amber-400 hover:text-slate-800 font-semibold rounded-lg transition-all duration-300 text-lg"
                  >
                    Already have an account? Login
                  </Link>
                </div>

                <p className="text-sm text-gray-300 mt-6">⚡ Takes less than 30 seconds • No credit card required • Instant access</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
