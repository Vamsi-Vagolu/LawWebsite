"use client";

import { useState } from "react";
import Link from "next/link";

// Sample blog data
const blogPosts = [
  { id: 1, title: "How to Prepare for Law Exams", description: "Effective strategies, time management tips, and recommended resources.", category: "Exam Tips" },
  { id: 2, title: "Important Landmark Judgments", description: "Summaries of recent key judgments and their implications.", category: "Judgments" },
  { id: 3, title: "Career Paths in Law", description: "Explore different legal careers and how to pursue them.", category: "Career" },
  { id: 4, title: "Top Law Books to Read", description: "Recommended books for law students and aspirants.", category: "Resources" },
  { id: 5, title: "Effective Case Study Analysis", description: "Tips on analyzing and presenting case studies.", category: "Study Skills" },
];

export default function BlogPage() {
  const [search, setSearch] = useState("");

  // Filter posts based on search input
  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
      <p className="text-gray-700 mb-8">
        Read articles, tips, and insights for law students and aspiring lawyers.
      </p>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search blog posts..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center">No posts found.</p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-xl">{post.title}</h2>
                <span className="text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{post.category}</span>
              </div>
              <p className="text-gray-700 mb-4">{post.description}</p>
              <Link
                href={`/blog/${post.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-blue-700 font-medium hover:underline"
              >
                Read More
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
