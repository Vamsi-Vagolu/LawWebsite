"use client";

import { useState, useEffect } from "react";

interface AnalyticsSummary {
  summary: {
    totalPageViews: number;
    totalEvents: number;
    uniqueUsers: number;
    days: number;
  };
  dailyStats: Array<{
    date: string;
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
  }>;
}

interface ContactAnalytics {
  submissions: any[];
  summary: {
    total: number;
    statusBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  };
}

interface UserActivityAnalytics {
  activityBreakdown: Record<string, number>;
  mostActiveUsers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    activityCount: number;
  }>;
}

interface BlogAnalytics {
  summary: {
    totalBlogs: number;
    publishedBlogs: number;
    totalViews: number;
  };
  topBlogs: Array<{
    blog: {
      id: string;
      title: string;
      slug: string;
      category: string;
      publishedAt: string;
    };
    views: number;
  }>;
}

export default function MetricsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [contactAnalytics, setContactAnalytics] = useState<ContactAnalytics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityAnalytics | null>(null);
  const [blogAnalytics, setBlogAnalytics] = useState<BlogAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contact' | 'activity' | 'blogs'>('overview');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [
        analyticsRes,
        contactRes,
        activityRes,
        blogRes,
      ] = await Promise.all([
        fetch(`/api/analytics?days=${timeRange}`),
        fetch(`/api/analytics?type=contact-submissions&days=${timeRange}`),
        fetch(`/api/analytics?type=user-activity&days=${timeRange}`),
        fetch(`/api/analytics?type=blog-analytics&days=${timeRange}`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.data);
      }

      if (contactRes.ok) {
        const data = await contactRes.json();
        setContactAnalytics(data.data);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setUserActivity(data.data);
      }

      if (blogRes.ok) {
        const data = await blogRes.json();
        setBlogAnalytics(data.data);
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Metrics</h2>
          <p className="text-gray-600">Monitor website performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'contact', label: 'Contact Forms' },
          { id: 'activity', label: 'User Activity' },
          { id: 'blogs', label: 'Blog Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.summary.totalPageViews)}</p>
                  <p className="text-gray-600 font-medium">Page Views</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.summary.uniqueUsers)}</p>
                  <p className="text-gray-600 font-medium">Unique Users</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.summary.totalEvents)}</p>
                  <p className="text-gray-600 font-medium">Total Events</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics.summary.days}</p>
                  <p className="text-gray-600 font-medium">Days Period</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
            </div>
            <div className="p-6">
              {analytics.topPages.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-900">{page.page || 'Unknown'}</span>
                      <span className="text-gray-600 font-medium">{formatNumber(page.views)} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No page data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Analytics Tab */}
      {activeTab === 'contact' && contactAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Submissions</h3>
              <p className="text-3xl font-bold text-orange-600">{contactAnalytics.summary.total}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(contactAnalytics.summary.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-gray-600">{status.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(contactAnalytics.summary.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === 'activity' && userActivity && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(userActivity.activityBreakdown).map(([activity, count]) => (
                  <div key={activity} className="flex justify-between">
                    <span className="text-gray-600">{activity.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
              <div className="space-y-3">
                {userActivity.mostActiveUsers.slice(0, 5).map((userStat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{userStat.user.name || userStat.user.email}</p>
                      <p className="text-sm text-gray-500">{userStat.user.role}</p>
                    </div>
                    <span className="text-gray-600 font-medium">{userStat.activityCount} actions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Analytics Tab */}
      {activeTab === 'blogs' && blogAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Blogs</h3>
              <p className="text-3xl font-bold text-blue-600">{blogAnalytics.summary.totalBlogs}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Blogs</h3>
              <p className="text-3xl font-bold text-green-600">{blogAnalytics.summary.publishedBlogs}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Views</h3>
              <p className="text-3xl font-bold text-purple-600">{formatNumber(blogAnalytics.summary.totalViews)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Blog Posts</h3>
            </div>
            <div className="p-6">
              {blogAnalytics.topBlogs.length > 0 ? (
                <div className="space-y-4">
                  {blogAnalytics.topBlogs.map((blogStat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{blogStat.blog.title}</h4>
                        <p className="text-sm text-gray-500">
                          {blogStat.blog.category} • Published {new Date(blogStat.blog.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-gray-600 font-medium">{formatNumber(blogStat.views)} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No blog data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}