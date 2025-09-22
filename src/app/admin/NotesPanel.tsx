"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import FileUpload from "./FileUpload"; // ✅ default import

interface Note {
  id: string;
  title: string;
  description?: string;
  category?: string;
  pdfFile: string;
  slug: string;
}

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    pdfFile: File | null;
  }>({
    title: "",
    description: "",
    category: "",
    pdfFile: null,
  });

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Note[]>("/api/admin/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      alert("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        description: note.description || "",
        category: note.category || "",
        pdfFile: null,
      });
    } else {
      setEditingNote(null);
      setFormData({ title: "", description: "", category: "", pdfFile: null });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: "", description: "", category: "", pdfFile: null });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files) setFormData((prev) => ({ ...prev, pdfFile: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      
      if (formData.pdfFile) {
        form.append("pdfFile", formData.pdfFile);
      }

      const url = editingNote 
        ? `/api/admin/notes/${editingNote.id}` 
        : "/api/admin/notes";
      
      const method = editingNote ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors properly
        if (data.details && Array.isArray(data.details)) {
          alert(`Validation Error:\n${data.details.join('\n')}`);
        } else {
          alert(`Error: ${data.error || 'Something went wrong'}`);
        }
        return;
      }

      // Success
      alert(`Note ${editingNote ? 'updated' : 'created'} successfully!`);
      fetchNotes();
      closeModal();

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error. Please try again.");
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await axios.delete(`/api/admin/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note.");
    }
  };

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
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Note
        </button>
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
                    onClick={() => openModal(note)}
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingNote ? "Edit Note" : "Add Note"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="border px-2 py-1 rounded"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold">Description</label>
                <textarea
                  name="description"
                  className="border px-2 py-1 rounded"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold">Category</label>
                <input
                  type="text"
                  name="category"
                  className="border px-2 py-1 rounded"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <FileUpload
                file={formData.pdfFile}
                setFile={(f) =>
                  setFormData((prev) => ({ ...prev, pdfFile: f }))
                }
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-400 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg"
                >
                  {editingNote ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
