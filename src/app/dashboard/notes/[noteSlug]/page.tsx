"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

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

  // Fetch note by slug from API
  useEffect(() => {
    if (!noteSlug) return;

    async function fetchNote() {
      try {
        const res = await axios.get<Note[]>("/api/notes");
        const found = res.data.find(
          (n) => n.slug === noteSlug
        );

        if (!found) {
          router.push("/dashboard/notes"); // fallback if note not found
        } else {
          setNote(found);
        }
      } catch (err) {
        console.error("Failed to fetch note:", err);
        router.push("/dashboard/notes");
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [noteSlug, router]);

  if (status === "loading" || loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!session) {
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

  if (!note) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">{note.title}</h1>
      <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{note.category}</span>
      <p className="text-gray-600 mt-2 mb-6">{note.description}</p>

      {/* PDF Viewer */}
      {note.pdfFile && (
        <div className="w-full h-[900px] border rounded-lg shadow mb-6">
          <iframe
            src={note.pdfFile}
            className="w-full h-full"
            title={note.title}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {note.pdfFile && (
          <>
            <a
              href={note.pdfFile}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Open in New Tab
            </a>
            <a
              href={note.pdfFile}
              download
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Download PDF
            </a>
          </>
        )}
        <button
          onClick={() => router.push("/dashboard/notes")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Back to Notes
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
