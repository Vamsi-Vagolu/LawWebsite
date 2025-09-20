"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  content: string;
}

const notesData: Note[] = [
  { id: 1, title: "Constitutional Law", description: "Key concepts, case studies, and summaries.", category: "Constitutional", content: "Full Constitutional Law notes here..." },
  { id: 2, title: "Criminal Law", description: "Important acts, sections, and landmark judgments.", category: "Criminal", content: "Full Criminal Law notes here..." },
  { id: 3, title: "Contract Law", description: "Essentials of contracts and case examples.", category: "Contract", content: "Full Contract Law notes here..." },
  { id: 4, title: "Civil Procedure", description: "Rules, case examples, and revisions.", category: "Civil", content: "Full Civil Procedure notes here..." },
  { id: 5, title: "Property Law", description: "Ownership, transfer, and key acts.", category: "Property", content: "Full Property Law notes here..." },
];

export default function NoteDetailPage() {
  const { noteSlug } = useParams<{ noteSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (noteSlug) {
      const found = notesData.find(
        (n) => n.title.toLowerCase().replace(/\s+/g, "-") === noteSlug
      );
      if (!found) {
        router.push("/dashboard/notes");
      } else {
        setNote(found);
      }
    }
  }, [noteSlug, router]);

  if (status === "loading" || !note || !session) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-4">{note.title}</h1>
      <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{note.category}</span>
      <p className="text-gray-700 mt-4">{note.content}</p>

      <button
        onClick={() => router.push("/dashboard/notes")}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        ← Back to Notes
      </button>
    </div>
  );
}
