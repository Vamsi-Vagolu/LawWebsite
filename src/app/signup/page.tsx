"use client";

import Link from "next/link";
import { FIRM_NAME } from "../../config";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6 py-10 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Create an Account
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>

          <button className="w-full px-4 py-2 bg-blue-700 text-white font-medium rounded hover:bg-blue-800 transition">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
