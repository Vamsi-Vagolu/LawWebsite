"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FIRM_NAME } from "../../config";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally, you would validate credentials here
    localStorage.setItem("loggedIn", "true");

    // Dispatch event to notify Navbar
    window.dispatchEvent(new Event("loginStatusChanged"));

    router.push("/notes"); // redirect after login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6 py-10 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{FIRM_NAME} Login</h1>

        <form className="space-y-4" onSubmit={handleLogin}>
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

          <div className="flex justify-between items-center text-sm">
            <Link href="/forgot-password" className="text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-700 text-white font-medium rounded hover:bg-blue-800 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-700 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
