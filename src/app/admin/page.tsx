"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotesPanel from "./NotesPanel";
import TestsPanel from "./TestsPanel";
import BareActsPanel from "./BareActsPanel";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notes' | 'tests' | 'bare-acts'>('notes');

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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 3a1 1 0 000 2h6a1 1 0 100-2H9zm0 4a1 1 0 100 2h6a1 1 0 100-2H9z" />
            </svg>
            Notes Management
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
            </svg>
            Test Management
          </button>
          <button
            onClick={() => setActiveTab('bare-acts')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'bare-acts'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h1a1 1 0 001-1V3a2 2 0 012 2v6h-2a2 2 0 100 4h2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 100-2 1 1 0 000 2zm0 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Bare Acts Management
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'notes' && <NotesPanel />}
          {activeTab === 'tests' && <TestsPanel />}
          {activeTab === 'bare-acts' && <BareActsPanel />}
        </div>
      </div>
    </div>
  );
}
