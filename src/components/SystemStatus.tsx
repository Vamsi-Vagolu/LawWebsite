"use client";

import { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [environmentDisabled, setEnvironmentDisabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEnvironmentStatus();
  }, []);

  const checkEnvironmentStatus = async () => {
    try {
      // Simple check - just see if maintenance API works
      const response = await fetch('/api/maintenance');
      setEnvironmentDisabled(!response.ok && response.status === 503); // Could indicate disabled
    } catch (error) {
      setEnvironmentDisabled(true); // Assume disabled if can't reach
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          🔧 Maintenance System Status
        </h3>
        <div className="animate-pulse">Checking system status...</div>
      </div>
    );
  }

  const isDisabled = process.env.NEXT_PUBLIC_MAINTENANCE_DISABLED === 'true';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        🔧 Maintenance System Status  
      </h3>
      
      <div className="space-y-4">
        {environmentDisabled || isDisabled ? (
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              Environment Disabled
            </span>
            <div className="ml-4 text-sm text-gray-600">
              Perfect performance mode - Zero maintenance overhead
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              System Active
            </span>
            <div className="ml-4 text-sm text-gray-600">
              Maintenance system ready for use
            </div>
          </div>
        )}

        {(environmentDisabled || isDisabled) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Maintenance System Disabled</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Remove <code className="bg-yellow-200 px-1 rounded">DISABLE_MAINTENANCE_CHECKING=true</code> from .env.local and restart server to enable maintenance capabilities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}