"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send email to backend to trigger password reset
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-32 p-6 bg-white shadow rounded text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-700">We have sent password reset instructions to <strong>{email}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-32 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="text-gray-700 mb-6">Enter your email to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
