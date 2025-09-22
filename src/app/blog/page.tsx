"use client";

import { useState } from "react";
import Link from "next/link";
import { FIRM_NAME } from "../../config";

// Enhanced blog data with more details
const blogPosts = [
  {
    id: 1,
    title: "How to Prepare for Law Exams: A Comprehensive Guide",
    description: "Master effective study strategies, time management techniques, and essential resources to excel in your law examinations.",
    category: "Exam Tips",
    author: "Dr. Priya Sharma",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["study-tips", "exams", "preparation"],
    featured: true
  },
  {
    id: 2,
    title: "Important Landmark Judgments of 2024",
    description: "Comprehensive analysis of recent Supreme Court judgments and their far-reaching implications on Indian jurisprudence.",
    category: "Judgments",
    author: "Adv. Rajesh Kumar",
    date: "2024-01-12",
    readTime: "12 min read",
    tags: ["judgments", "supreme-court", "analysis"],
    featured: true
  },
  {
    id: 3,
    title: "Diverse Career Paths in Law: Beyond Traditional Practice",
    description: "Explore unconventional legal careers in corporate law, legal tech, policy-making, and international organizations.",
    category: "Career",
    author: "Prof. Anita Verma",
    date: "2024-01-10",
    readTime: "10 min read",
    tags: ["career", "opportunities", "legal-profession"],
    featured: false
  },
  {
    id: 4,
    title: "Essential Law Books Every Student Must Read",
    description: "Curated list of fundamental legal texts, commentaries, and contemporary works for comprehensive legal education.",
    category: "Resources",
    author: "Librarian Team",
    date: "2024-01-08",
    readTime: "6 min read",
    tags: ["books", "resources", "study-materials"],
    featured: false
  },
  {
    id: 5,
    title: "Mastering Case Study Analysis: A Step-by-Step Approach",
    description: "Learn the art of dissecting complex legal cases and presenting compelling arguments with practical examples.",
    category: "Study Skills",
    author: "Dr. Vikram Singh",
    date: "2024-01-05",
    readTime: "9 min read",
    tags: ["case-study", "analysis", "methodology"],
    featured: false
  },
  {
    id: 6,
    title: "Technology in Legal Practice: The Future is Now",
    description: "Discover how AI, blockchain, and legal tech are revolutionizing the practice of law and what it means for legal professionals.",
    category: "Technology",
    author: "Tech Legal Team",
    date: "2024-01-03",
    readTime: "11 min read",
    tags: ["legal-tech", "ai", "innovation"],
    featured: true
  }
];

const categories = ["All", "Exam Tips", "Judgments", "Career", "Resources", "Study Skills", "Technology"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  // Filter and sort posts
  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Legal Insights & Resources</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Stay updated with the latest legal developments, expert analysis, and practical guidance for law students and professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Featured Articles</h2>
              <p className="text-gray-600">Our most popular and impactful content</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-lg border-2 border-amber-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                      FEATURED
                    </span>
                    <span className="text-xs text-amber-700 font-medium">{post.readTime}</span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm px-3 py-1 bg-white/80 text-amber-800 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>By {post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-amber-700 font-semibold hover:text-amber-800 transition-colors"
                  >
                    Read Article
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Blog Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-12">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles, topics, or tags..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      post.category === 'Exam Tips' ? 'bg-blue-100 text-blue-800' :
                      post.category === 'Judgments' ? 'bg-purple-100 text-purple-800' :
                      post.category === 'Career' ? 'bg-green-100 text-green-800' :
                      post.category === 'Resources' ? 'bg-orange-100 text-orange-800' :
                      post.category === 'Study Skills' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 hover:text-amber-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors group"
                  >
                    Read Full Article
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8">
            Subscribe to our newsletter for the latest legal insights, case updates, and educational resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 font-semibold rounded-lg transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
