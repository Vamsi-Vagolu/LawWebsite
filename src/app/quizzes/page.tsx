"use client";

import { useState } from "react";

// Sample quizzes data
const quizzesData = [
  { id: 1, title: "Constitutional Law Quiz", description: "10 multiple-choice questions.", category: "Constitutional" },
  { id: 2, title: "Criminal Law Quiz", description: "Test your understanding of key sections.", category: "Criminal" },
  { id: 3, title: "Contract Law Quiz", description: "Assess your knowledge on contracts.", category: "Contract" },
  { id: 4, title: "Civil Procedure Quiz", description: "Questions based on civil procedure rules.", category: "Civil" },
  { id: 5, title: "Property Law Quiz", description: "Quiz on ownership, transfer, and acts.", category: "Property" },
];

export default function QuizzesPage() {
  const [search, setSearch] = useState("");

  // Filter quizzes based on search input
  const filteredQuizzes = quizzesData.filter((quiz) =>
    quiz.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Quizzes</h1>
      <p className="text-gray-700 mb-8">
        Test your knowledge with interactive quizzes across different law subjects.
      </p>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center">No quizzes found.</p>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-xl">{quiz.title}</h2>
                <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{quiz.category}</span>
              </div>
              <p className="text-gray-700 mb-4">{quiz.description}</p>
              <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
                Start Quiz
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
