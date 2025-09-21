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

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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

  if (status === "loading" || loading || !session) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!note) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">{note.title}</h1>
      <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{note.category}</span>
      <p className="text-gray-600 mt-2 mb-6">{note.description}</p>

      {/* PDF Viewer */}
      {note.pdfFile && (
        <div className="w-full h-[600px] border rounded-lg shadow mb-6">
          <iframe
            src={note.pdfFile} // This points to /pdfs/... now
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
      </div>
    </div>
  );
}
