"use client";

import { useState, useEffect } from 'react';
import { FIRM_NAME } from "../config";

interface MaintenancePageProps {
  message?: string;
  estimatedEndTime?: string | null;
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
    const originalOverflow = document.body.style.overflow;
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-gray-100 z-50 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          
          <div className="inline-flex items-center space-x-3 mb-12 animate-fade-in">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-xl">{FIRM_NAME?.charAt(0) || 'V'}</span>
            </div>
            <span className="text-2xl font-semibold text-slate-800">{FIRM_NAME || 'VV Law Associates'}</span>
          </div>

          <div className="flex justify-center items-center mb-8">
            <div className="relative w-24 h-24 animate-fade-in-slow">
              <div className="absolute inset-0 w-24 h-24 border border-amber-300/30 rounded-full animate-spin">
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full transform -translate-x-1/2 -translate-y-0.5 animate-pulse"></div>
              </div>
              <div className="absolute top-6 left-6 w-12 h-12 animate-spin">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Under Maintenance</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {message || "We're currently performing scheduled maintenance to improve your experience."}
            </p>
            <p className="text-slate-500 mt-4">We'll be back online shortly. Thank you for your patience!</p>
          </div>

          {estimatedEndTime && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping mr-3"></div>
                <span className="text-slate-700 font-medium">
                  Expected completion: <FormattedDate dateString={estimatedEndTime} />
                </span>
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Need Immediate Assistance?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:support@lawfirmedu.com" className="flex items-center text-blue-600 hover:text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                support@lawfirmedu.com
              </a>
              <a href="tel:+919876543210" className="flex items-center text-green-600 hover:text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                +91 98765 43210
              </a>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-fade-in-slow { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}