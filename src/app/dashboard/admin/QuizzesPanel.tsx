"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizzesPanel() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [{ question: "", options: ["", ""], answer: "" }],
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const res = await axios.get<Quiz[]>("/api/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddQuestion() {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", ""], answer: "" }],
    }));
  }

  function handleQuestionChange(index: number, field: string, value: any) {
    const updatedQuestions = [...formData.questions];
    if (field === "question") updatedQuestions[index].question = value;
    if (field.startsWith("option")) {
      const optIndex = Number(field.split("-")[1]);
      updatedQuestions[index].options[optIndex] = value;
    }
    if (field === "answer") updatedQuestions[index].answer = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  }

  async function handleSubmit() {
    try {
      if (editingQuiz) {
        await axios.put(`/api/admin/quizzes/${editingQuiz.id}`, formData);
      } else {
        await axios.post("/api/admin/quizzes", formData);
      }
      setShowForm(false);
      setEditingQuiz(null);
      setFormData({
        title: "",
        description: "",
        questions: [{ question: "", options: ["", ""], answer: "" }],
      });
      fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`/api/admin/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(quiz: Quiz) {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
    });
    setShowForm(true);
  }

  return (
    <div>
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => setShowForm(true)}
      >
        Add Quiz
      </button>

      {showForm && (
        <div className="p-6 border rounded bg-gray-50 mb-6">
          <input
            className="mb-2 p-2 border w-full"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            className="mb-2 p-2 border w-full"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {formData.questions.map((q, i) => (
            <div key={i} className="mb-4 border p-2 rounded">
              <input
                placeholder="Question"
                value={q.question}
                className="w-full mb-1 p-1 border"
                onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
              />
              {q.options.map((opt, j) => (
                <input
                  key={j}
                  placeholder={`Option ${j + 1}`}
                  value={opt}
                  className="w-full mb-1 p-1 border"
                  onChange={(e) => handleQuestionChange(i, `option-${j}`, e.target.value)}
                />
              ))}
              <input
                placeholder="Answer"
                value={q.answer}
                className="w-full mb-1 p-1 border"
                onChange={(e) => handleQuestionChange(i, "answer", e.target.value)}
              />
            </div>
          ))}

          <button className="px-4 py-2 bg-blue-600 text-white rounded mr-2" onClick={handleAddQuestion}>
            Add Question
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded mr-2" onClick={handleSubmit}>
            {editingQuiz ? "Update Quiz" : "Create Quiz"}
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading quizzes...</p>
      ) : quizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p className="text-gray-700 mb-2">{quiz.description}</p>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(quiz)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(quiz.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
