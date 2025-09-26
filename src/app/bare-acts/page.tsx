"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface BareAct {
  id: string;
  title: string;
  description?: string;
  category: "AIBE" | "ALL";
  pdfFile: string;
  slug: string;
  createdAt: string;
}

export default function BareActsPage() {
  const [bareActs, setBareActs] = useState<BareAct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"ALL" | "AIBE" | "">("");
  const [search, setSearch] = useState("");

  const fetchBareActs = async (category?: string) => {
    try {
      setLoading(true);
      const url = category ? `/api/bare-acts?category=${category}` : "/api/bare-acts";
      const res = await axios.get<BareAct[]>(url);
      setBareActs(res.data);
    } catch (err) {
      console.error("Failed to fetch bare acts:", err);
      setBareActs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBareActs(activeCategory || undefined);
  }, [activeCategory]);

  const filteredBareActs = bareActs.filter((bareAct) =>
    bareAct.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sort alphabetically by title
  const sortedFilteredBareActs = [...filteredBareActs].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const aibeBareActs = sortedFilteredBareActs.filter(ba => ba.category === "AIBE");
  // For "All Acts" section, always show all bare acts regardless of category
  const allBareActs = sortedFilteredBareActs;

  const handlePdfView = (pdfFile: string, title: string) => {
    if (pdfFile) {
      window.open(pdfFile, '_blank');
    } else {
      alert("PDF file not available for this bare act.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bare Acts Collection
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access comprehensive collection of legal documents including AIBE specific acts and general bare acts.
              All documents are available for immediate viewing and download.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bare acts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory("")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === ""
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setActiveCategory("AIBE")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === "AIBE"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                AIBE Acts
              </button>
              <button
                onClick={() => setActiveCategory("ALL")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === "ALL"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Acts
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* AIBE Bare Acts */}
            {(activeCategory === "" || activeCategory === "AIBE") && aibeBareActs.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h1a1 1 0 001-1V3a2 2 0 012 2v6h-2a2 2 0 100 4h2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">AIBE Bare Acts</h2>
                    <p className="text-gray-600">Essential acts for All India Bar Examination preparation</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {aibeBareActs.length} Acts
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {aibeBareActs.map((bareAct) => (
                    <div key={bareAct.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {bareAct.title}
                          </h3>
                          {bareAct.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {bareAct.description}
                            </p>
                          )}
                        </div>
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          AIBE
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Added {new Date(bareAct.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handlePdfView(bareAct.pdfFile, bareAct.title)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={!bareAct.pdfFile}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Bare Acts */}
            {(activeCategory === "" || activeCategory === "ALL") && allBareActs.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">All Bare Acts</h2>
                    <p className="text-gray-600">Complete collection of all available bare acts from all categories</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {allBareActs.length} Acts
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allBareActs.map((bareAct) => (
                    <div key={bareAct.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {bareAct.title}
                          </h3>
                          {bareAct.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {bareAct.description}
                            </p>
                          )}
                        </div>
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bareAct.category === "AIBE" ? "AIBE" : "General"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Added {new Date(bareAct.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handlePdfView(bareAct.pdfFile, bareAct.title)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          disabled={!bareAct.pdfFile}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredBareActs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h1a1 1 0 001-1V3a2 2 0 012 2v6h-2a2 2 0 100 4h2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bare Acts Found</h3>
                <p className="text-gray-600 mb-4">
                  {search ? `No acts match your search "${search}".` : "No acts are currently available in this category."}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Bare Acts</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>All bare acts are provided for educational and reference purposes. These documents are freely available and can be accessed anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}