"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FIRM_NAME } from "../../config";

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCancelled, setRedirectCancelled] = useState(false); // Add this line

  // Auto-redirect countdown
  useEffect(() => {
    if (redirectCancelled) return; // Don't start timer if cancelled

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectCancelled]); // Add redirectCancelled as dependency

  const handleLoginRedirect = () => {
    setIsRedirecting(true);
  };

  // Add this function after handleLoginRedirect:
  const cancelRedirect = () => {
    setRedirectCancelled(true);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Firm Logo with Animation */}
        <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="mx-auto w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">
              {FIRM_NAME.charAt(0)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">{FIRM_NAME}</h1>
        </div>

        {/* Main Logout Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Successfully Logged Out
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for using {FIRM_NAME}. Your session has been securely
            terminated. You can log in again anytime to continue your legal
            studies.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/login"
              onClick={handleLoginRedirect}
              className={`w-full flex items-center justify-center space-x-2 text-white bg-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl ${
                isRedirecting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isRedirecting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Login Again</span>
                </>
              )}
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center space-x-2 text-gray-700 bg-gray-100 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Auto-redirect Notice */}
          {!redirectCancelled ? (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center space-x-2 text-blue-700 mb-3">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">
                  Auto-redirecting to home in{" "}
                  <span className="font-bold text-blue-800">{countdown}</span>{" "}
                  seconds
                </span>
              </div>
              <button
                onClick={cancelRedirect}
                className="w-full px-3 py-2 text-sm text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Cancel Auto-redirect
              </button>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12m-12.728 0L12 18"
                  />
                </svg>
                <span className="text-sm">Auto-redirect cancelled</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000">
          {/* Contact Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3 mx-auto">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Need Help?
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              Contact our support team
            </p>
            <a
              href="tel:+919000366626"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              +91-9000366626
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-3 mx-auto">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Email Support
            </h3>
            <p className="text-xs text-gray-600 mb-2">Get help via email</p>
            <a
              href="mailto:info@vvlawassociates.com"
              className="text-xs text-green-600 hover:text-green-800 font-medium break-all"
            >
              info@vvlawassociates.com
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-xs text-gray-500 animate-in fade-in-0 slide-in-from-bottom-16 duration-1200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Your session was securely terminated</span>
          </div>
          <p>
            For your security, please close all browser windows if you're on a
            shared computer.
          </p>
        </div>
      </div>
    </div>
  );
}
