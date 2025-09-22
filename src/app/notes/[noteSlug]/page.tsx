"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Note {
  id: string;
  title: string;
  description?: string;
  category: string;
  slug: string;
  pdfFile?: string;
}

export default function NoteDetailPage() {
  const { noteSlug } = useParams<{ noteSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch note by slug from API
  useEffect(() => {
    if (!noteSlug || status === "loading") return;

    async function fetchNote() {
      try {
        setLoading(true);
        setError("");

        // Better: Create a specific API endpoint for single note
        const res = await fetch(`/api/notes/slug/${noteSlug}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError("Note not found");
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const noteData = await res.json();
        setNote(noteData);

      } catch (err) {
        console.error("Failed to fetch note:", err);
        setError("Failed to load note. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    // Fixed: Better condition handling
    if (session) {
      fetchNote();
    } else if (status === "unauthenticated") {
      // User is definitely not authenticated
      setLoading(false);
    }
  }, [noteSlug, session, status]);

  // Handle PDF download with authentication
  const handleDownload = async () => {
    if (!note?.pdfFile) return;

    try {
      const response = await fetch(note.pdfFile, {
        method: 'GET',
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Handle PDF in new tab
  const handleOpenInNewTab = () => {
    if (!note?.pdfFile) return;
    window.open(note.pdfFile, '_blank');
  };

  // Loading state - show while NextAuth is loading OR while fetching note
  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Not authenticated - only show when we know user is unauthenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
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

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">{error}</h2>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard/notes")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No note found (but authenticated and done loading)
  if (!note && status === "authenticated" && !loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  // Main content - only show when authenticated and note is loaded
  if (status === "authenticated" && note) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{note.title}</h1>
          {note.category && (
            <span className="inline-block text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {note.category}
            </span>
          )}
          {note.description && (
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">{note.description}</p>
          )}
        </div>

        {/* PDF Viewer */}
        {note.pdfFile && (
          <div className="mb-8">
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Document</h3>
                <p className="text-gray-600 mb-4">
                  Click the buttons below to view or download the PDF file.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Notes
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here, but return loading just in case
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">Loading...</div>
    </div>
  );
}
