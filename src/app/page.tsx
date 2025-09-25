"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FIRM_NAME } from "../config";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const [tests, setTests] = useState([]);
  const [notes, setNotes] = useState([]);
  
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
        setGreeting("Good night");
      }
    };

    // Update greeting immediately
    updateGreeting();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch tests data for all users
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/tests');
        if (response.ok) {
          const result = await response.json();
          setTests(result.data?.slice(0, 6) || []); // Show first 6 tests
        }
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      }
    };

    fetchTests();
  }, []);

  // Mock data for logged-in users
  const recentNotes = [
    { id: 1, title: "Constitutional Law Basics", subject: "Constitutional Law", date: "2024-01-15" },
    { id: 2, title: "Contract Formation", subject: "Contract Law", date: "2024-01-12" },
    { id: 3, title: "Criminal Procedure", subject: "Criminal Law", date: "2024-01-10" }
  ];

  const stats = {
    notesCompleted: 45,
    studyStreak: 7,
    testsCompleted: tests.length || 0
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
                  {greeting}, {userName}!
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                  Continue your legal education journey with our comprehensive study materials and resources.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                  Empowering Legal Excellence
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                  Comprehensive study materials for law students and professional legal services for clients.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Start Learning Today
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-slate-800 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Legal Services
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-800">{stats.notesCompleted}</p>
                    <p className="text-gray-600">Notes Completed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-800">{stats.testsCompleted}</p>
                    <p className="text-gray-600">Tests Available</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-800">{stats.studyStreak}</p>
                    <p className="text-gray-600">Day Streak</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Notes */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">Continue Reading</h3>
                  <Link href="/notes" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{note.title}</h4>
                        <p className="text-sm text-gray-600">{note.subject} • {note.date}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Tests */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">Practice Tests</h3>
                  <Link href="/tests" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {tests.length > 0 ? tests.slice(0, 3).map((test) => (
                    <Link key={test.id} href={isLoggedIn ? `/tests/${test.id}` : '/login'} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Comprehensive legal education resources and professional services tailored for your success.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Comprehensive Study Materials</h3>
                  <p className="text-gray-600">
                    Access detailed notes, case studies, and practice questions covering all major legal subjects.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Interactive Learning</h3>
                  <p className="text-gray-600">
                    Test your knowledge with interactive quizzes and track your progress with detailed analytics.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Professional Legal Services</h3>
                  <p className="text-gray-600">
                    Expert legal consultation and services for individuals and businesses across various practice areas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Available Tests Preview for Non-logged Users */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Practice Tests Available
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Test your knowledge with our comprehensive practice tests. Login to access them.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-gray-600 text-sm mb-4">{test.description || 'Practice test to evaluate your knowledge.'}</p>
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

          {/* CTA Section */}
          <section className="bg-slate-800 text-white py-16">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Legal Journey?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of law students and legal professionals who trust {FIRM_NAME} for their education and legal needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent border-2 border-amber-500 hover:bg-amber-500 text-amber-500 hover:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Login to Continue
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
