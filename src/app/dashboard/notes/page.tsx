"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample notes data
const notesData = [
  { id: 1, title: "Constitutional Law", description: "Key concepts, case studies, and summaries.", category: "Constitutional" },
  { id: 2, title: "Criminal Law", description: "Important acts, sections, and landmark judgments.", category: "Criminal" },
  { id: 3, title: "Contract Law", description: "Essentials of contracts and case examples.", category: "Contract" },
  { id: 4, title: "Civil Procedure", description: "Rules, case examples, and revisions.", category: "Civil" },
  { id: 5, title: "Property Law", description: "Ownership, transfer, and key acts.", category: "Property" },
];

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center transform transition duration-500 ease-out scale-95 opacity-0 animate-scale-fade-in">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">You must be logged in to access the law notes.</p>
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const filteredNotes = notesData.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Law Notes</h1>
      <p className="text-gray-700 mb-8">
        Browse detailed law notes categorized for easy learning and revision.
      </p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center">No notes found.</p>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-xl">{note.title}</h2>
                <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{note.category}</span>
              </div>
              <p className="text-gray-700 mb-4">{note.description}</p>
              <Link
                href={`/dashboard/notes/${note.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-blue-700 font-medium hover:underline"
              >
                View Note
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
