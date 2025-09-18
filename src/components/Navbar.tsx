"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FIRM_NAME } from "../config";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check login status and listen for changes
  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
    };

    updateLoginStatus(); // initial check
    window.addEventListener("loginStatusChanged", updateLoginStatus);

    return () => {
      window.removeEventListener("loginStatusChanged", updateLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");

    // Dispatch event to update Navbar
    window.dispatchEvent(new Event("loginStatusChanged"));

    router.push("/login"); // redirect to login page
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-700">
              {FIRM_NAME}
            </Link>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-700">Home</Link>
            <Link href="/notes" className="text-gray-700 hover:text-blue-700">Notes</Link>
            <Link href="/quizzes" className="text-gray-700 hover:text-blue-700">Quizzes</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-700">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-700">Contact</Link>

            {/* Auth links */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
