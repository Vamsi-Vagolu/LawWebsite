"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Quiz {
  id: number;
  title: string;
  category: string;
  questions: string[];
}

const quizzesData: Quiz[] = [
  { id: 1, title: "Constitutional Law Quiz", category: "Constitutional", questions: ["Q1: ...", "Q2: ..."] },
  { id: 2, title: "Criminal Law Quiz", category: "Criminal", questions: ["Q1: ...", "Q2: ..."] },
  { id: 3, title: "Contract Law Quiz", category: "Contract", questions: ["Q1: ...", "Q2: ..."] },
  { id: 4, title: "Civil Procedure Quiz", category: "Civil", questions: ["Q1: ...", "Q2: ..."] },
  { id: 5, title: "Property Law Quiz", category: "Property", questions: ["Q1: ...", "Q2: ..."] },
];

export default function QuizDetailPage() {
  const { quizSlug } = useParams<{ quizSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (quizSlug) {
      const found = quizzesData.find(
        (q) => q.title.toLowerCase().replace(/\s+/g, "-") === quizSlug
      );
      if (!found) {
        router.push("/dashboard/quizzes");
      } else {
        setQuiz(found);
      }
    }
  }, [quizSlug, router]);

  if (status === "loading" || !quiz || !session) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
      <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{quiz.category}</span>

      <div className="mt-6 space-y-4">
        {quiz.questions.map((q, idx) => (
          <div key={idx} className="p-4 bg-white shadow rounded">
            <p className="font-medium">{q}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/dashboard/quizzes")}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        ← Back to Quizzes
      </button>
    </div>
  );
}
