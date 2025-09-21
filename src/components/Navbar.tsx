"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FIRM_NAME } from "../config";

type AppRoutes =
  | "/"
  | "/dashboard"
  | "/dashboard/notes"
  | "/dashboard/quizzes"
  | "/blog"
  | "/contact"
  | "/login"
  | "/signup"
  | "/dashboard/admin"; // admin panel route

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as "OWNER" | "ADMIN" | "USER" | undefined;

  // Base nav links
  const navLinks: { name: string; href: AppRoutes }[] = [
    {name: "Admin Panel", href: "/dashboard/admin"},
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Notes", href: "/dashboard/notes" },
    { name: "Quizzes", href: "/dashboard/quizzes" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  // Add Admin Panel link only for OWNER or ADMIN
  if (isLoggedIn && (userRole === "OWNER" || userRole === "ADMIN")) {
    navLinks.push({ name: "Admin Panel", href: "/dashboard/admin" });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setMenuOpen(false);
  };

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-medium px-1 py-1 ${
                  isActive(link.href)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-700"
                }`}
              >
                {link.name}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-blue-600 transition-all duration-300 ${
                    isActive(link.href) ? "w-full" : "w-0"
                  }`}
                ></span>
              </Link>
            ))}

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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`block font-medium px-2 py-1 rounded ${
                  isActive(link.href)
                    ? "text-blue-600 bg-blue-100"
                    : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="block mx-auto mt-2 text-white bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="block mx-auto mt-2 text-white bg-blue-700 px-6 py-2 rounded hover:bg-blue-800 transition w-max"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={handleLinkClick}
                  className="block mx-auto mt-2 text-white bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition w-max"
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
