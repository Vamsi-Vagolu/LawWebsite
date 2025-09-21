"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizzesPanel() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    questions: Question[];
  }>({
    title: "",
    description: "",
    questions: [{ question: "", options: ["", ""], answer: "" }],
  });

  const [expandedQuestions, setExpandedQuestions] = useState<boolean[]>([]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Quiz[]>("/api/admin/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      alert("Failed to fetch quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        questions: quiz.questions,
      });
      setExpandedQuestions(new Array(quiz.questions.length).fill(false));
    } else {
      setEditingQuiz(null);
      setFormData({
        title: "",
        description: "",
        questions: [{ question: "", options: ["", ""], answer: "" }],
      });
      setExpandedQuestions([true]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setFormData({
      title: "",
      description: "",
      questions: [{ question: "", options: ["", ""], answer: "" }],
    });
    setExpandedQuestions([]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: string, optionIndex?: number) => {
    const updatedQuestions = [...formData.questions];
    if (field === "question") updatedQuestions[index].question = value;
    if (field === "answer") updatedQuestions[index].answer = value;
    if (field === "option" && optionIndex !== undefined) updatedQuestions[index].options[optionIndex] = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", ""], answer: "" }],
    }));
    setExpandedQuestions((prev) => [...prev, true]);
  };

  const handleAddOption = (questionIndex: number) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      if (updatedQuestions[questionIndex].options.length < 5) {
        updatedQuestions[questionIndex].options.push("");
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) =>
      prev.map((expanded, i) => (i === index ? !expanded : expanded))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        const res = await axios.put<Quiz>(`/api/admin/quizzes/${editingQuiz.id}`, formData);
        setQuizzes((prev) => prev.map((q) => (q.id === editingQuiz.id ? res.data : q)));
      } else {
        const res = await axios.post<Quiz>("/api/admin/quizzes", formData);
        setQuizzes((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save quiz:", err);
      alert("Failed to save quiz.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`/api/admin/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert("Failed to delete quiz.");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quizzes Management</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="px-4 py-2 border rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Quiz
        </button>
      </div>

      {loading ? (
        <p>Loading quizzes...</p>
      ) : filteredQuizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.map((quiz, index) => (
              <tr key={quiz.id || index} className="border-t">
                <td className="p-2">{quiz.title}</td>
                <td className="p-2">{quiz.description}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => openModal(quiz)}
                    className="px-2 py-1 bg-yellow-400 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-2/3 max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingQuiz ? "Edit Quiz" : "Add Quiz"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="title"
                placeholder="Title"
                className="border px-2 py-1 rounded"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                className="border px-2 py-1 rounded"
                value={formData.description}
                onChange={handleChange}
              />

              {formData.questions.map((q, i) => (
                <div key={`question-${i}`} className="border p-2 rounded mb-2">
                  <button
                    type="button"
                    className="w-full text-left font-semibold text-blue-700"
                    onClick={() => toggleQuestion(i)}
                  >
                    Question {i + 1}: {q.question || "New Question"}
                  </button>

                  {expandedQuestions[i] && (
                    <div className="mt-2">
                      <input
                        placeholder="Question"
                        className="w-full mb-1 p-1 border"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
                        required
                      />
                      {q.options.map((opt, j) => (
                        <input
                          key={`q${i}-opt${j}`}
                          placeholder={`Option ${j + 1}${j >= 2 ? " (optional)" : ""}`}
                          className="w-full mb-1 p-1 border"
                          value={opt}
                          onChange={(e) => handleQuestionChange(i, "option", e.target.value, j)}
                          required={j < 2} // first 2 are required
                        />
                      ))}
                      {q.options.length < 5 && (
                        <button
                          type="button"
                          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
                          onClick={() => handleAddOption(i)}
                        >
                          Add Option
                        </button>
                      )}
                      <input
                        placeholder="Answer"
                        className="w-full mb-1 p-1 border"
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(i, "answer", e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddQuestion}>
                  Add Question
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                  {editingQuiz ? "Update Quiz" : "Create Quiz"}
                </button>
                <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
