"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FIRM_NAME } from "../config";

type AppRoutes =
  | "/"
  | "/notes"
  | "/tests"  // ✅ Added missing route
  | "/blog"   // ✅ Added missing route  
  | "/contact" // ✅ Added missing route
  | "/login"
  | "/signup"
  | "/admin"
  | "/owner";

type NavLink = {
  name: string;
  href: AppRoutes;
  icon?: React.ReactNode;
  badge?: string;
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as "OWNER" | "ADMIN" | "USER" | undefined;
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated nav links - Removed dashboard, kept only essential navigation
  const navLinks: NavLink[] = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Notes",
      href: "/notes",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "Tests",
      href: "/tests",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      name: "Blog",
      href: "/blog",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
    {
      name: "Contact",
      href: "/contact",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2.22 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    await signOut({ redirect: false });
    window.location.href = `${window.location.origin}/logout`;
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderLinks = (links: NavLink[], isMobile = false) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={handleLinkClick}
        className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 relative group ${
          isActive(link.href)
            ? "text-blue-600 bg-blue-50 shadow-sm"
            : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
        } ${isMobile ? "w-full justify-start" : ""}`}
      >
        {link.icon && <span className="flex-shrink-0">{link.icon}</span>}
        <span>{link.name}</span>
        {link.badge && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              link.badge === "Owner"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {link.badge}
          </span>
        )}
        {/* Active indicator */}
        {isActive(link.href) && !isMobile && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
        )}
      </Link>
    ));

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-blue-700">
              {FIRM_NAME}
            </Link>
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Enhanced Navbar */}
      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-lg backdrop-blur-md bg-white/95" : "shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Enhanced Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{FIRM_NAME.charAt(0)}</span>
              </div>
              <span>{FIRM_NAME}</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-1 items-center">
              {renderLinks(navLinks)}

              {/* Notifications (if logged in) */}
              {isLoggedIn && (
                <div className="relative ml-4">
                  <button className="relative p-2 text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5-5-5h5zm0 0V7a7.972 7.972 0 01.586-3H15M15 17V7a7.972 7.972 0 00-.586-3H15m0 10V7m0 10h5m-5 0H10"
                      />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* User Menu or Auth Buttons */}
              {isLoggedIn ? (
                <div className="relative ml-4" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium truncate max-w-32">{userName}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(userRole)}`}>
                        {userRole?.toLowerCase() || "user"}
                      </div>
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu - WITH ADMIN/OWNER PANELS */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in slide-in-from-top-5">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
                        <div className="text-sm text-gray-500 truncate">{userEmail}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleColor(userRole)}`}>
                          {userRole?.toLowerCase() || "user"}
                        </div>
                      </div>

                      {/* ADMIN PANEL - Show for ADMIN and OWNER */}
                      {(userRole === "ADMIN" || userRole === "OWNER") && (
                        <Link
                          href="/admin"
                          onClick={handleLinkClick}
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            isActive("/admin")
                              ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Admin Panel</span>
                          <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Admin
                          </span>
                        </Link>
                      )}

                      {/* OWNER PANEL - Show only for OWNER */}
                      {userRole === "OWNER" && (
                        <Link
                          href="/owner"
                          onClick={handleLinkClick}
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            isActive("/owner")
                              ? "text-purple-600 bg-purple-50 border-r-2 border-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                          <span>Owner Panel</span>
                          <span className="ml-auto text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            Owner
                          </span>
                        </Link>
                      )}

                      {/* Divider if admin/owner panels are shown */}
                      {(userRole === "ADMIN" || userRole === "OWNER") && (
                        <hr className="my-1 border-gray-200" />
                      )}

                      <Link
                        href="/"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Dashboard
                      </Link>

                      <Link
                        href="/notes"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        My Notes
                      </Link>

                      {/* Add Tests link for logged-in users */}
                      {session && (
                        <Link
                          href="/tests"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                          My Tests
                        </Link>
                      )}

                      <hr className="my-1" />

                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <Link
                    href="/login"
                    className="text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-white bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 transition-all duration-200 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button - FIX THE CLICK HANDLER */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                // ✅ If menu is open (showing X), close it
                // ✅ If menu is closed (showing hamburger), open it
                if (menuOpen) {
                  setMenuOpen(false); // Close menu when X is clicked
                } else {
                  setMenuOpen(true); // Open menu when hamburger is clicked
                }
              }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                // X icon - clicking will close menu
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
                // Hamburger icon - clicking will open menu
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

        {/* Enhanced Mobile Menu */}
        {menuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-white shadow-lg border-t border-gray-100 animate-in slide-in-from-top-5"
          >
            <div className="px-4 pt-4 pb-6 space-y-1">
              {/* User info (mobile) */}
              {isLoggedIn && (
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(userRole)}`}>
                      {userRole?.toLowerCase() || "user"}
                    </div>
                  </div>
                  {notificationCount > 0 && (
                    <div className="ml-auto">
                      <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                        {notificationCount}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                {renderLinks(navLinks, true)}

                {/* ADMIN/OWNER PANELS IN MOBILE MENU */}
                {isLoggedIn && (userRole === "ADMIN" || userRole === "OWNER") && (
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 w-full justify-start ${
                      isActive("/admin")
                        ? "text-blue-600 bg-blue-50 shadow-sm"
                        : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin Panel</span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                      Admin
                    </span>
                  </Link>
                )}

                {isLoggedIn && userRole === "OWNER" && (
                  <Link
                    href="/owner"
                    onClick={handleLinkClick}
                    className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 w-full justify-start ${
                      isActive("/owner")
                        ? "text-purple-600 bg-purple-50 shadow-sm"
                        : "text-gray-700 hover:text-purple-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    <span>Owner Panel</span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                      Owner
                    </span>
                  </Link>
                )}

                {/* Tests link in mobile menu */}
                {session && (
                  <Link
                    href="/tests"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors duration-200"
                    onClick={handleLinkClick}
                  >
                    📝 Tests
                  </Link>
                )}
              </div>

              {/* Auth Section */}
              <hr className="my-4 border-gray-200" />
              <div className="space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center space-x-2 text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={handleLinkClick}
                      className="w-full flex items-center justify-center text-blue-700 font-medium px-4 py-3 rounded-lg border border-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={handleLinkClick}
                      className="w-full flex items-center justify-center text-white bg-blue-700 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-8">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
