"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type NavLink = { name: string; href: AppRoutes };

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as "OWNER" | "ADMIN" | "USER" | undefined;

  // Base nav links
  const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Notes", href: "/dashboard/notes" },
    { name: "Quizzes", href: "/dashboard/quizzes" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  // Insert Admin Panel before Dashboard for OWNER or ADMIN
  if (isLoggedIn && (userRole === "OWNER" || userRole === "ADMIN")) {
    navLinks.splice(1, 0, { name: "Admin Panel", href: "/dashboard/admin" });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setMenuOpen(false);
  };

  const handleLinkClick = () => setMenuOpen(false);

  const renderLinks = (links: NavLink[]) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={handleLinkClick}
        className={`font-medium px-2 py-1 rounded ${
          isActive(link.href)
            ? "text-blue-600 bg-blue-100"
            : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
        }`}
      >
        {link.name}
      </Link>
    ));

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
            {renderLinks(navLinks)}

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
        <div className="md:hidden bg-white shadow-lg px-4 pt-4 pb-6 flex flex-col space-y-2 rounded-b-lg transition-all duration-300">
          <div className="flex flex-col space-y-2">
            {renderLinks(navLinks)}
          </div>
          <hr className="my-2 border-gray-200" />
          <div className="flex flex-col space-y-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full text-white bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="w-full text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-800 transition text-center"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={handleLinkClick}
                  className="w-full text-white bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 transition text-center"
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
