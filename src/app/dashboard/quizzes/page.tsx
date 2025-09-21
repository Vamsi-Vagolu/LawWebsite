"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Quiz {
  id: string; // Ensure this matches Prisma model (cuid)
  title: string;
  description?: string;
  category?: string;
}

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">You must be logged in to access quizzes.</p>
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Quiz[]>("/api/admin/quizzes");
        console.log("DB quizzes:", res.data); // ✅ Debug
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to fetch quizzes from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Quizzes</h1>
      <p className="text-gray-700 mb-8">Test your knowledge with interactive quizzes.</p>

      <input
        type="text"
        placeholder="Search quizzes..."
        className="w-full md:w-1/2 px-4 py-2 border rounded mb-8"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading quizzes...</p>
      ) : filteredQuizzes.length === 0 ? (
        <p className="text-center text-gray-500">No quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 bg-blue-50 rounded shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-xl">{quiz.title}</h2>
                {quiz.category && (
                  <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                    {quiz.category}
                  </span>
                )}
              </div>
              {quiz.description && <p className="text-gray-700 mb-4">{quiz.description}</p>}
              <button
                onClick={() =>
                  router.push(`/dashboard/quizzes/${quiz.title.toLowerCase().replace(/\s+/g, "-")}`)
                }
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
