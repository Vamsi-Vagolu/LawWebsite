"use client";

import { useState, useEffect } from 'react';
import { FIRM_NAME } from "../config";

interface MaintenancePageProps {
  message?: string;
  estimatedEndTime?: string;
}

function FormattedDate({ dateString }: { dateString: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>Loading completion time...</span>;
  }

  return <span>{new Date(dateString).toLocaleString()}</span>;
}

export default function MaintenancePage({ message, estimatedEndTime }: MaintenancePageProps) {
  useEffect(() => {
    // ✅ Force full-screen maintenance mode
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  return (
    <div className="maintenance-page maintenance-content">
      {/* ✅ Full-screen overlay to cover everything */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-gray-100 z-50 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          
          {/* Brand Header */}
          <div className="inline-flex items-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">{FIRM_NAME?.charAt(0) || 'L'}</span>
            </div>
            <span className="text-3xl font-bold text-slate-800">{FIRM_NAME || 'Law Firm'}</span>
          </div>

          {/* Maintenance Animation */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          </div>

          {/* Main Message */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Under Maintenance</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {message || "We're currently performing scheduled maintenance. Please check back soon!"}
            </p>
            <p className="text-slate-500 mt-4">We'll be back online shortly. Thank you for your patience!</p>
          </div>

          {/* Estimated Time */}
          {estimatedEndTime && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-700 font-medium">
                  Expected completion: <FormattedDate dateString={estimatedEndTime} />
                </span>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Need Immediate Assistance?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:support@lawfirmedu.com" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@lawfirmedu.com
              </a>
              <a 
                href="tel:+919876543210" 
                className="flex items-center text-green-600 hover:text-green-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 98765 43210
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}