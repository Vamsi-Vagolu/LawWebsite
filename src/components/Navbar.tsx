"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FIRM_NAME } from "../config";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Check login status on mount
  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
    router.push("/login");
    setMenuOpen(false);
  };

  // Close mobile menu after clicking a link
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-700">
            {FIRM_NAME}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-700">Home</Link>
            <Link href="/notes" className="text-gray-700 hover:text-blue-700">Notes</Link>
            <Link href="/quizzes" className="text-gray-700 hover:text-blue-700">Quizzes</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-700">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-700">Contact</Link>

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
                  className="text-white bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 transition w-max"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition w-max"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 rounded"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/" onClick={handleLinkClick} className="block text-gray-700 hover:text-blue-700">Home</Link>
            <Link href="/notes" onClick={handleLinkClick} className="block text-gray-700 hover:text-blue-700">Notes</Link>
            <Link href="/quizzes" onClick={handleLinkClick} className="block text-gray-700 hover:text-blue-700">Quizzes</Link>
            <Link href="/blog" onClick={handleLinkClick} className="block text-gray-700 hover:text-blue-700">Blog</Link>
            <Link href="/contact" onClick={handleLinkClick} className="block text-gray-700 hover:text-blue-700">Contact</Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="block mx-auto text-white bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="block mx-auto text-white bg-blue-700 px-6 py-2 rounded hover:bg-blue-800 transition w-max"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={handleLinkClick}
                  className="block mx-auto text-white bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition w-max mt-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
