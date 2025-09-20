"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  pdfFile: string;
}

const notesData: Note[] = [
  { id: 1, title: "Constitutional Law", description: "Key concepts, case studies, and summaries.", category: "Constitutional", pdfFile: "/pdfs/constitutional-law.pdf" },
  { id: 2, title: "Criminal Law", description: "Important acts, sections, and landmark judgments.", category: "Criminal", pdfFile: "/pdfs/criminal-law.pdf" },
  { id: 3, title: "Contract Law", description: "Essentials of contracts and case examples.", category: "Contract", pdfFile: "/pdfs/contract-law.pdf" },
  { id: 4, title: "Civil Procedure", description: "Rules, case examples, and revisions.", category: "Civil", pdfFile: "/pdfs/civil-procedure.pdf" },
  { id: 5, title: "Property Law", description: "Ownership, transfer, and key acts.", category: "Property", pdfFile: "/pdfs/property-law.pdf" },
  { id: 6, title: "Constitutional Law 2", description: "Rights of arrested person.", category: "Constitutional", pdfFile: "/pdfs/rights-of-arrested-person-notes.pdf"},
];

export default function NoteDetailPage() {
  const { noteSlug } = useParams<{ noteSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);

  // ✅ Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // ✅ Find the note by slug
  useEffect(() => {
    if (noteSlug) {
      const found = notesData.find(
        (n) => n.title.toLowerCase().replace(/\s+/g, "-") === noteSlug
      );
      if (!found) {
        router.push("/dashboard/notes"); // fallback if note not found
      } else {
        setNote(found);
      }
    }
  }, [noteSlug, router]);

  if (status === "loading" || !note || !session) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">{note.title}</h1>
      <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{note.category}</span>
      <p className="text-gray-600 mt-2 mb-6">{note.description}</p>

      {/* PDF Viewer */}
      <div className="w-full h-[600px] border rounded-lg shadow mb-6">
        <iframe
          src={note.pdfFile}
          className="w-full h-full"
          title={note.title}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
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
