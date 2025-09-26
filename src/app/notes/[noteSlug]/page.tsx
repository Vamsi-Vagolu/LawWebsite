"use client";

import { useEffect, useState, useRef } from "react";
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

// Modern PDF Viewer with advanced controls
const ModernPDFViewer = ({ pdfUrl, title, onDownload }: {
  pdfUrl: string;
  title: string;
  onDownload: () => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(prev => Math.min(prev + 25, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(prev => Math.max(prev - 25, 50));
    }
  };

  const resetZoom = () => {
    setZoom(100);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-xl shadow-2xl border border-gray-200 mb-8 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Advanced PDF Controls Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <div className="p-2 bg-white/10 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-slate-300 text-sm">PDF Document • Interactive View</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-2 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-50"
                title="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-3 py-1 text-white text-sm font-medium min-w-[4rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-2 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-50"
                title="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="p-2 hover:bg-white/20 text-white rounded transition-colors ml-1"
                title="Reset Zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>

              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
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
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download PDF"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  'Download'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Display with Loading State */}
      <div
        className="relative bg-gray-100"
        style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '85vh' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-transparent mb-4"></div>
              <p className="text-slate-600 font-medium">Loading PDF document...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${zoom}`}
          className="w-full h-full border-0 transition-opacity duration-300"
          title={title}
          loading="eager"
          onLoad={() => setIsLoading(false)}
          style={{
            opacity: isLoading ? 0 : 1,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 px-6 py-3 border-t">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Document loaded successfully</span>
            </div>
            <div className="text-slate-400">•</div>
            <span>Use toolbar controls for navigation</span>
          </div>
          <div className="text-xs bg-slate-200 px-2 py-1 rounded">
            PDF Viewer v2.0
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading skeleton
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="h-12 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* PDF Viewer Skeleton */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-slate-300 h-16"></div>
          <div className="h-96 bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
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

  // Enhanced PDF download function
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Access Required
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please sign in to access this study material and enhance your learning experience.
          </p>
          <button
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">{error}</h2>
          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium shadow-lg"
            >
              Try Again
            </button>
            <Link
              href="/notes"
              className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-all duration-300 font-medium shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Note Not Found
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The requested study material could not be found in our database.
          </p>
          <Link
            href="/notes"
            className="inline-flex items-center px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  // Main content with modern PDF viewer
  if (status === "authenticated" && note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Enhanced Breadcrumb Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center justify-between" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-slate-700 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/notes" className="text-gray-500 hover:text-slate-700 transition-colors font-medium">
                    Study Notes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-slate-800 font-semibold truncate max-w-xs">
                  {note.title}
                </li>
              </ol>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  {note.category}
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                      {note.category}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6l4 4v4.5" />
                      </svg>
                      Published {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-6 leading-tight">
                    {note.title}
                  </h1>
                  {note.description && (
                    <p className="text-xl text-slate-600 leading-relaxed max-w-4xl">
                      {note.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modern PDF Viewer Section */}
          {note.pdfFile ? (
            <ModernPDFViewer
              pdfUrl={note.pdfFile}
              title={note.title}
              onDownload={handleDownload}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-16 mb-8 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No PDF Available</h3>
              <p className="text-slate-600 text-lg">This note doesn't have an attached PDF document yet.</p>
            </div>
          )}

          {/* Enhanced Navigation Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex gap-3">
              <Link
                href="/notes"
                className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Notes
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-slate-800 border-2 border-slate-200 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>

            {/* Study Progress Indicator */}
            <div className="flex items-center text-sm text-slate-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">Study Session Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return <NoteDetailSkeleton />;
}