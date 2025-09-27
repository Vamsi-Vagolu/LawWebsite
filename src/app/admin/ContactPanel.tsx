"use client";

import { useState, useEffect } from "react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  respondedAt?: string;
  responder?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ContactPanel() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<ContactSubmission['status']>('NEW');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?type=contact-submissions');
      if (response.ok) {
        const result = await response.json();
        setSubmissions(result.data.submissions || []);
      } else {
        setError('Failed to load contact submissions');
      }
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (id: string, updates: Partial<ContactSubmission>) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchSubmissions();
        setSelectedSubmission(null);
        setAdminNotes("");
      } else {
        alert('Failed to update submission');
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      alert('Failed to update submission');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.adminNotes || "");
    setNewStatus(submission.status);
  };

  const handleUpdateSubmission = () => {
    if (!selectedSubmission) return;

    updateSubmission(selectedSubmission.id, {
      status: newStatus,
      adminNotes: adminNotes.trim() || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      case 'SUPPORT': return 'bg-blue-100 text-blue-800';
      case 'FEEDBACK': return 'bg-green-100 text-green-800';
      case 'PARTNERSHIP': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    filterStatus === 'all' || submission.status === filterStatus
  );

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
          onClick={fetchSubmissions}
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
          <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
          <p className="text-gray-600">Manage and respond to contact form submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Submissions ({filteredSubmissions.length})
          </h3>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4M8 6h.01M16 6h.01" />
            </svg>
            <p className="text-gray-500">No contact submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{submission.subject}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(submission.category)}`}>
                        {submission.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{submission.name}</span>
                      <span>{submission.email}</span>
                      {submission.phone && <span>{submission.phone}</span>}
                    </div>
                    <p className="text-gray-700 line-clamp-2">{submission.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()} at {new Date(submission.createdAt).toLocaleTimeString()}
                      </span>
                      {submission.responder && (
                        <span className="text-sm text-gray-500">
                          Handled by {submission.responder.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedSubmission.subject}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                      {selectedSubmission.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedSubmission.category)}`}>
                      {selectedSubmission.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedSubmission.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedSubmission.email}</span>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedSubmission.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedSubmission.createdAt).toLocaleDateString()} at {new Date(selectedSubmission.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              {/* Admin Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Admin Actions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ContactSubmission['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Add notes about this submission..."
                    />
                  </div>

                  {selectedSubmission.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Notes
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        {selectedSubmission.adminNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmission}
                disabled={updating}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}