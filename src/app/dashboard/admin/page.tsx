"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import NotesPanel from "./NotesPanel";
import QuizzesPanel from "./QuizzesPanel";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"notes" | "quizzes">("notes");

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;
  if (!session || session.user?.email !== "v.vamsi3666@gmail.com") {
    return <p className="p-8 text-center text-red-500">Unauthorized</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      {/* Mode Selection */}
      <div className="flex gap-4 mb-12">
        <button
          className={`px-4 py-2 rounded ${
            mode === "notes" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("notes")}
        >
          Manage Notes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "quizzes" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("quizzes")}
        >
          Manage Quizzes
        </button>
      </div>

      {/* Panels */}
      {mode === "notes" ? <NotesPanel /> : <QuizzesPanel />}
    </div>
  );
}
