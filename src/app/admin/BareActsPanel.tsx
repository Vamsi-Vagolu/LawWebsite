"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import FileUpload from "./FileUpload";
import MultiFileUpload from "./MultiFileUpload";

interface BareAct {
  id: string;
  title: string;
  description?: string;
  category: "AIBE" | "ALL";
  pdfFile: string;
  slug: string;
  order: number;
  createdAt: string;
}

export default function BareActsPanel() {
  const [bareActs, setBareActs] = useState<BareAct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingBareAct, setEditingBareAct] = useState<BareAct | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: "AIBE" | "ALL";
    order: number;
    pdfFile: File | null;
  }>({
    title: "",
    description: "",
    category: "ALL",
    order: 0,
    pdfFile: null,
  });

  const [titleAutoPopulated, setTitleAutoPopulated] = useState(false);

  const [bulkFormData, setBulkFormData] = useState<{
    category: "AIBE" | "ALL";
    description: string;
    files: { file: File; title: string }[];
  }>({
    category: "ALL",
    description: "",
    files: [],
  });

  const fetchBareActs = async () => {
    try {
      setLoading(true);
      const res = await axios.get<BareAct[]>("/api/admin/bare-acts");
      setBareActs(res.data);
    } catch (err) {
      console.error("Failed to fetch bare acts:", err);
      alert("Failed to fetch bare acts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBareActs();
  }, []);

  const openModal = (bareAct?: BareAct) => {
    setTitleAutoPopulated(false);
    if (bareAct) {
      setEditingBareAct(bareAct);
      setFormData({
        title: bareAct.title,
        description: bareAct.description || "",
        category: bareAct.category,
        order: bareAct.order,
        pdfFile: null,
      });
    } else {
      setEditingBareAct(null);
      setFormData({
        title: "",
        description: "",
        category: "ALL",
        order: 0,
        pdfFile: null,
      });
    }
    setShowModal(true);
  };

  const openBulkModal = () => {
    setBulkFormData({
      category: "ALL",
      description: "",
      files: [],
    });
    setShowBulkModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowBulkModal(false);
    setEditingBareAct(null);
    setTitleAutoPopulated(false);
    setFormData({
      title: "",
      description: "",
      category: "ALL",
      order: 0,
      pdfFile: null,
    });
    setBulkFormData({
      category: "ALL",
      description: "",
      files: [],
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleBulkChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("order", formData.order.toString());

      if (formData.pdfFile) {
        form.append("pdfFile", formData.pdfFile);
      }

      const url = editingBareAct
        ? `/api/admin/bare-acts/${editingBareAct.id}`
        : "/api/admin/bare-acts";

      const method = editingBareAct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          alert(`Validation Error:\n${data.details.join('\n')}`);
        } else {
          alert(`Error: ${data.error || 'Something went wrong'}`);
        }
        return;
      }

      alert(`Bare act ${editingBareAct ? 'updated' : 'created'} successfully!`);
      fetchBareActs();
      closeModal();

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (bulkFormData.files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    try {
      const form = new FormData();
      form.append("category", bulkFormData.category);
      form.append("description", bulkFormData.description);

      bulkFormData.files.forEach((fileData, index) => {
        form.append(`files[${index}]`, fileData.file);
        form.append(`titles[${index}]`, fileData.title);
      });

      const res = await fetch("/api/admin/bare-acts", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || 'Something went wrong'}`);
        return;
      }

      alert(data.message || `Successfully uploaded ${bulkFormData.files.length} files!`);
      fetchBareActs();
      closeModal();

    } catch (error) {
      console.error("Error submitting bulk form:", error);
      alert("Network error. Please try again.");
    }
  };

  const deleteBareAct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bare act?")) return;

    try {
      await axios.delete(`/api/admin/bare-acts/${id}`);
      setBareActs((prev) => prev.filter((ba) => ba.id !== id));
      alert("Bare act deleted successfully!");
    } catch (err) {
      console.error("Failed to delete bare act:", err);
      alert("Failed to delete bare act.");
    }
  };

  const filteredBareActs = bareActs.filter((bareAct) => {
    const matchesSearch = bareAct.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || bareAct.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const aibeBareActs = filteredBareActs.filter(ba => ba.category === "AIBE");
  const allBareActs = filteredBareActs.filter(ba => ba.category === "ALL");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Bare Acts Management</h2>

      <div className="mb-4 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search bare acts..."
          className="px-4 py-2 border rounded flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="AIBE">AIBE</option>
          <option value="ALL">All Bare Acts</option>
        </select>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Single Act
        </button>
        <button
          onClick={openBulkModal}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Bulk Upload
        </button>
      </div>

      {loading ? (
        <p>Loading bare acts...</p>
      ) : (
        <div className="space-y-6">
          {/* AIBE Bare Acts */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              AIBE Bare Acts ({aibeBareActs.length})
            </h3>
            {aibeBareActs.length === 0 ? (
              <p className="text-gray-500 italic">No AIBE bare acts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 bg-white rounded-lg">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3 text-left">Title</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-center">Order</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aibeBareActs.map((bareAct) => (
                      <tr key={bareAct.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{bareAct.title}</td>
                        <td className="p-3 text-gray-600">{bareAct.description || "—"}</td>
                        <td className="p-3 text-center">{bareAct.order}</td>
                        <td className="p-3 flex gap-2 justify-center">
                          <button
                            onClick={() => openModal(bareAct)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteBareAct(bareAct.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Bare Acts */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">
              All Bare Acts ({allBareActs.length})
            </h3>
            {allBareActs.length === 0 ? (
              <p className="text-gray-500 italic">No bare acts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 bg-white rounded-lg">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="p-3 text-left">Title</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-center">Order</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBareActs.map((bareAct) => (
                      <tr key={bareAct.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{bareAct.title}</td>
                        <td className="p-3 text-gray-600">{bareAct.description || "—"}</td>
                        <td className="p-3 text-center">{bareAct.order}</td>
                        <td className="p-3 flex gap-2 justify-center">
                          <button
                            onClick={() => openModal(bareAct)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteBareAct(bareAct.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBareAct ? "Edit Bare Act" : "Add Bare Act"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className={`border px-3 py-2 rounded transition-all duration-500 ${
                    titleAutoPopulated
                      ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                      : "border-gray-300"
                  }`}
                  value={formData.title}
                  onChange={(e) => {
                    handleChange(e);
                    // Clear the auto-populated flag when user starts typing
                    if (titleAutoPopulated) {
                      setTitleAutoPopulated(false);
                    }
                  }}
                  placeholder="Title will be auto-filled from PDF filename"
                />
                {!editingBareAct && !titleAutoPopulated && (
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Title will be automatically populated from the PDF filename. You can edit it before saving.
                  </p>
                )}
                {titleAutoPopulated && (
                  <p className="text-sm text-green-600 mt-1 animate-pulse">
                    ✨ Title auto-populated from filename! You can edit it if needed.
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="font-semibold">Description</label>
                <textarea
                  name="description"
                  className="border px-3 py-2 rounded"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold">Category *</label>
                  <select
                    name="category"
                    required
                    className="border px-3 py-2 rounded"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="ALL">All Bare Acts</option>
                    <option value="AIBE">AIBE</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Order</label>
                  <input
                    type="number"
                    name="order"
                    min="0"
                    className="border px-3 py-2 rounded"
                    value={formData.order}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <FileUpload
                file={formData.pdfFile}
                setFile={(f) => {
                  setFormData((prev) => {
                    // Auto-populate title from filename only when adding new bare act and title is empty
                    const shouldAutoPopulate = !editingBareAct && !prev.title;

                    if (f && shouldAutoPopulate) {
                      // Extract filename without extension and clean it up
                      const fileName = f.name.replace(/\.pdf$/i, '');
                      const cleanTitle = fileName
                        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
                        .replace(/\b\w/g, (char) => char.toUpperCase()) // Title case
                        .trim();

                      // Set flag to show visual feedback
                      setTitleAutoPopulated(true);
                      setTimeout(() => setTitleAutoPopulated(false), 2000); // Clear after 2 seconds

                      return { ...prev, pdfFile: f, title: cleanTitle };
                    }

                    return { ...prev, pdfFile: f };
                  });
                }}
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBareAct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl mx-auto max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Bulk Upload Bare Acts</h3>
            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold">Category *</label>
                  <select
                    name="category"
                    required
                    className="border px-3 py-2 rounded"
                    value={bulkFormData.category}
                    onChange={handleBulkChange}
                  >
                    <option value="ALL">All Bare Acts</option>
                    <option value="AIBE">AIBE</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Description (for all files)</label>
                  <textarea
                    name="description"
                    className="border px-3 py-2 rounded"
                    value={bulkFormData.description}
                    onChange={handleBulkChange}
                  />
                </div>
              </div>

              <MultiFileUpload
                files={bulkFormData.files}
                setFiles={(files) => setBulkFormData(prev => ({ ...prev, files }))}
                category={bulkFormData.category}
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkFormData.files.length === 0}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Upload {bulkFormData.files.length} Files
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}