"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotesPanel from "./NotesPanel";
import TestsPanel from "./TestsPanel";
import BareActsPanel from "./BareActsPanel";
import ContactPanel from "./ContactPanel";
import BlogPanel from "./BlogPanel";
import MetricsPanel from "./MetricsPanel";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notes' | 'tests' | 'bare-acts' | 'contact' | 'blogs' | 'metrics'>('notes');

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'OWNER')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-gray-600">Manage site content and settings</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'notes'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 3a1 1 0 000 2h6a1 1 0 100-2H9zm0 4a1 1 0 100 2h6a1 1 0 100-2H9z" />
            </svg>
            Notes
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'tests'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
            </svg>
            Tests
          </button>
          <button
            onClick={() => setActiveTab('bare-acts')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'bare-acts'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h1a1 1 0 001-1V3a2 2 0 012 2v6h-2a2 2 0 100 4h2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Bare Acts
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'contact'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'blogs'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
            </svg>
            Blogs
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'metrics'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Metrics
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'notes' && <NotesPanel />}
          {activeTab === 'tests' && <TestsPanel />}
          {activeTab === 'bare-acts' && <BareActsPanel />}
          {activeTab === 'contact' && <ContactPanel />}
          {activeTab === 'blogs' && <BlogPanel />}
          {activeTab === 'metrics' && <MetricsPanel />}
        </div>
      </div>
    </div>
  );
}
