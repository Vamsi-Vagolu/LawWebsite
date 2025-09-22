"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  description?: string;
  category: string;
  slug: string;
  pdfFile?: string;
  createdAt: string;
}

// ✅ Simple PDF Viewer using iframe (your original working version)
const SimplePDFViewer = ({ pdfUrl, title, onDownload }: { 
  pdfUrl: string; 
  title: string; 
  onDownload: () => void;
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
      {/* PDF Controls Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{title}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              title="Open in New Tab"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </div>

      {/* Simple iframe PDF Display */}
      <div className="bg-gray-50" style={{ height: '80vh' }}>
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          className="w-full h-full border-0"
          title={title}
          loading="lazy"
        />
      </div>
    </div>
  );
};

// Loading skeleton
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-10 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-slate-200 rounded-full w-32 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="h-96 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-12 bg-slate-200 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function NoteDetailPage() {
  const params = useParams<{ noteSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const noteSlug = params?.noteSlug;

  // Fetch note by slug from API
  useEffect(() => {
    if (!noteSlug || status === "loading") return;

    async function fetchNote() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/notes/slug/${noteSlug}`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view this note");
            return;
          }
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

    if (status === "authenticated" && session) {
      fetchNote();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Please log in to view this note");
    }
  }, [noteSlug, session, status]);

  // PDF download function
  const handleDownload = async () => {
    if (!note?.pdfFile || downloading) return;

    try {
      setDownloading(true);
      const response = await fetch(note.pdfFile, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (status === "loading" || (loading && status === "authenticated")) {
    return <NoteDetailSkeleton />;
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view this study material.</p>
          <button
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
            onClick={() => router.push(`/login?callbackUrl=/notes/${noteSlug}`)}
          >
            Sign In to Continue
          </button>
          <div className="text-sm text-gray-500">
            New to our platform?{" "}
            <button
              className="text-amber-600 hover:text-amber-700 font-medium underline"
              onClick={() => router.push(`/signup?callbackUrl=/notes/${noteSlug}`)}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <Link
              href="/notes"
              className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No note found
  if (!note && status === "authenticated" && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Note Not Found</h2>
          <p className="text-gray-600 mb-6">The requested study material could not be found.</p>
          <Link
            href="/notes"
            className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Main content with simple iframe PDF viewer
  if (status === "authenticated" && note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-slate-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/notes" className="text-gray-400 hover:text-slate-600 transition-colors">
                    Notes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-slate-700 font-medium truncate max-w-xs">
                  {note.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                    {note.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                  {note.title}
                </h1>
                {note.description && (
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {note.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Simple PDF Viewer Section (your original working version) */}
          {note.pdfFile ? (
            <SimplePDFViewer 
              pdfUrl={note.pdfFile}
              title={note.title}
              onDownload={handleDownload}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 mb-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No PDF Available</h3>
              <p className="text-gray-600">This note doesn't have an attached PDF document.</p>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Link
                href="/notes"
                className="inline-flex items-center px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Notes
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
            
            {/* Study Progress (Future feature placeholder) */}
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Study Session Active
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return <NoteDetailSkeleton />;
}
