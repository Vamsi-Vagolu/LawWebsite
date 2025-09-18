"use client";

import { useState } from "react";
import Link from "next/link";

// Sample notes data
const notesData = [
  { id: 1, title: "Constitutional Law", description: "Key concepts, case studies, and summaries.", category: "Constitutional" },
  { id: 2, title: "Criminal Law", description: "Important acts, sections, and landmark judgments.", category: "Criminal" },
  { id: 3, title: "Contract Law", description: "Essentials of contracts and case examples.", category: "Contract" },
  { id: 4, title: "Civil Procedure", description: "Rules, case examples, and revisions.", category: "Civil" },
  { id: 5, title: "Property Law", description: "Ownership, transfer, and key acts.", category: "Property" },
];

export default function NotesPage() {
  const [search, setSearch] = useState("");

  // Filter notes based on search
  const filteredNotes = notesData.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Law Notes</h1>
      <p className="text-gray-700 mb-8">
        Browse detailed law notes categorized for easy learning and revision.
      </p>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notes Grid */}
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
                href={`/notes/${note.title.toLowerCase().replace(/\s+/g, "-")}`}
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
