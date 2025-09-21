"use client";

import Link from "next/link";
import { FIRM_NAME } from "../../config";

export default function LogoutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Firm Logo */}
      <h1 className="text-3xl font-bold text-blue-700 mb-4">{FIRM_NAME}</h1>

      {/* Logout Message */}
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          You have been logged out
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for visiting. You can log in again or contact us if you need
          assistance.
        </p>

        {/* Login Again Button */}
        <Link
          href="/login"
          className="text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-800 transition inline-block"
        >
          Login Again
        </Link>

        {/* Contact Details Placeholder */}
        <div className="mt-6 text-sm text-gray-500">
          <p>📞 Contact: +91-9876543210</p>
          <p>📧 Email: support@lawfirm.com</p>
        </div>
      </div>
    </div>
  );
}
