"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

// --------------------
// TypeScript types
// --------------------
interface Note {
  id: string;
  title: string;
  description?: string;
  category: string;
  slug: string;
  pdfFile?: string;
}

// Temporary skeleton component
const NoteSkeleton = () => (
  <div className="p-6 bg-blue-50 rounded shadow animate-pulse h-40"></div>
);

// --------------------
// Notes Page Component
// --------------------
export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch API notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await axios.get("/api/notes");
        setNotes(res.data as Note[]);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setNotes([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-700 mb-6">
            Please login to view this page.
          </p>
          <button
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
          <div className="mt-4 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button
              className="text-blue-700 underline"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Law Notes</h1>
      <p className="text-gray-700 mb-8">Made with Love.</p>

      {/* Search */}
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
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NoteSkeleton key={index} />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <p className="text-gray-500 text-center">No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-xl">{note.title}</h2>
                <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                  {note.category}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{note.description}</p>
              <Link
                href={`/dashboard/notes/${note.slug}`}
                className="text-blue-700 font-medium hover:underline"
              >
                View Note
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
