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

// Modern Professional skeleton component
const NoteSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
    <div className="mt-4 h-4 bg-amber-200 rounded w-24"></div>
  </div>
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
    // Only fetch when we have a confirmed session
    if (status === "authenticated" && session?.user) {
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
    } else if (status === "unauthenticated") {
      // Stop loading if not authenticated
      setLoading(false);
    }
  }, [session, status]); // ✅ Add session and status as dependencies

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">Please login to view this page.</p>
          <button
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
            onClick={() => {
              // ✅ Add callbackUrl to return to notes after login
              router.push("/login?callbackUrl=/notes");
            }}
          >
            Login
          </button>
          <div className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button
              className="text-amber-600 hover:text-amber-700 font-medium underline"
              onClick={() => {
                // ✅ Add callbackUrl to return to notes after signup
                router.push("/signup?callbackUrl=/notes");
              }}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header Section with Modern Professional styling */}
      <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-amber-600 rounded-xl flex items-center justify-center mr-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Law Notes
              </h1>
              <p className="text-xl text-gray-200">Made with Love.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Search with Modern Professional styling */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search notes by title..."
              className="w-full md:w-1/2 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {loading ? "Loading..." : `${filteredNotes.length} notes found`}
          </div>
        </div>

        {/* Notes Grid with Modern Professional styling */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <NoteSkeleton key={index} />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Notes Found
            </h3>
            <p className="text-gray-600">
              {search
                ? "Try adjusting your search criteria"
                : "No study materials are currently available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-xl text-slate-800 group-hover:text-amber-600 transition-colors">
                    {note.title}
                  </h2>
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                    {note.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{note.description}</p>
                <Link
                  href={`/notes/${note.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
                >
                  <span>View Note</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
