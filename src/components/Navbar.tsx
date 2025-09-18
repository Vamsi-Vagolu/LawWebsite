import React from "react";
import Link from "next/link";
import { FIRM_NAME } from "../config";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-700">
              <h1>{FIRM_NAME}</h1>
            </Link>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-700">Home</Link>
            <Link href="/notes" className="text-gray-700 hover:text-blue-700">Notes</Link>
            <Link href="/quizzes" className="text-gray-700 hover:text-blue-700">Quizzes</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-700">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-700">Contact</Link>
            <Link href="/login" className="text-white bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
