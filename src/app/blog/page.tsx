"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  publishedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    views: number;
  };
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: '/blog' })
      }).catch(console.error);
    }
  }, []);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blogs');
        if (response.ok) {
          const result = await response.json();
          setBlogPosts(result.data.blogs || []);

          // Extract unique categories
          const uniqueCategories = ["All", ...new Set(
            result.data.blogs
              .map((post: BlogPost) => post.category)
              .filter((cat: string) => cat)
          )];
          setCategories(uniqueCategories);
        } else {
          setError('Failed to load blog posts');
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter and sort posts
  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "views") {
        return b._count.views - a._count.views;
      }
      return 0;
    });

  const featuredPosts = filteredPosts.slice(0, 3); // Show top 3 as featured

  const getReadTime = (excerpt?: string) => {
    if (!excerpt) return "5 min read";
    const words = excerpt.split(' ').length;
    const readTime = Math.ceil(words / 200); // Average reading speed
    return `${readTime} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          {/* Enhanced loading animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto opacity-30"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-2 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          </div>

          {/* Loading text with animation */}
          <div className="space-y-3 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 animate-pulse">Loading Blog Posts</h2>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          {/* Loading skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-300 rounded-full w-20 animate-shimmer"></div>
                  <div className="h-3 bg-gray-300 rounded-full w-16 animate-shimmer"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-gray-300 rounded-lg w-full animate-shimmer"></div>
                  <div className="h-5 bg-gray-300 rounded-lg w-4/5 animate-shimmer"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-full animate-shimmer"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-3/4 animate-shimmer"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-5/6 animate-shimmer"></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="h-4 bg-gray-300 rounded-full w-24 animate-shimmer"></div>
                  <div className="h-3 bg-gray-300 rounded-full w-12 animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mt-6 animate-pulse-soft">Fetching the latest articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Blog Posts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 animate-fadeIn">
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
                    <span className="text-xs text-amber-700 font-medium">{getReadTime(post.excerpt)}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm px-3 py-1 bg-white/80 text-amber-800 rounded-full font-medium">
                      {post.category || 'General'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.excerpt || 'Click to read this interesting article...'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>By {post.author.name || post.author.email}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-amber-700 font-semibold hover:text-amber-800 transition-colors"
                    >
                      Read Article
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <span className="text-xs text-gray-500">{post._count.views} views</span>
                  </div>
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
                <option value="views">Sort by Views</option>
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
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                      {post.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{getReadTime(post.excerpt)}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 hover:text-amber-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || 'Click to read this interesting article...'}
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
                    <span>By {post.author.name || post.author.email}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors group"
                    >
                      Read Full Article
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <span className="text-xs text-gray-400">{post._count.views} views</span>
                  </div>
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
