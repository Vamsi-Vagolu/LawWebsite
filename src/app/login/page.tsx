"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save email if Remember Me is checked
    if (rememberMe) {
      localStorage.setItem("rememberEmail", email);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSocialLogin = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Login to Your Account
        </h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700 text-sm">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center w-full py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src="/icons/google.svg"
              alt="Google"
              className="h-5 w-5 mr-2"
            />
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin("facebook")}
            className="flex items-center justify-center w-full py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src="/icons/facebook.svg"
              alt="Facebook"
              className="h-5 w-5 mr-2"
            />
            Continue with Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
