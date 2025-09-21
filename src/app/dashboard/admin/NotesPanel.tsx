"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Note {
  id: string;
  title: string;
  description: string;
  category: string;
  pdfFile: string;
  slug: string;
}

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Note[]>("/api/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Delete note
  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`/api/admin/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // Filtered notes for search
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Notes Management</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search notes..."
          className="px-4 py-2 border rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Later we can add "Add Note" button here */}
      </div>

      {loading ? (
        <p>Loading notes...</p>
      ) : filteredNotes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.map((note) => (
              <tr key={note.id} className="border-t">
                <td className="p-2">{note.title}</td>
                <td className="p-2">{note.category}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => alert("Edit feature coming soon")}
                    className="px-2 py-1 bg-yellow-400 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
