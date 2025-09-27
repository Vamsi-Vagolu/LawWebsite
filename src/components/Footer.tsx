"use client";

import Link from "next/link";
import { useState } from "react";
import { FIRM_NAME } from "../config";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus("success");
      setIsSubscribing(false);
      setEmail("");
      
      // Reset status after 3 seconds
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 relative">
      {/* Remove the background pattern div completely */}
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* About & Social */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">{FIRM_NAME.charAt(0)}</span>
                </div>
                <h3 className="text-white font-bold text-xl">{FIRM_NAME}</h3>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Empowering law students with comprehensive study materials and providing reliable legal services to clients.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-9 h-9 bg-slate-800 hover:bg-amber-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Navigation
              </h3>
              <ul className="space-y-2">
                {[
                  {
                    name: "Home",
                    href: "/"
                  },
                  {
                    name: "Notes",
                    href: "/notes"
                  },
                  {
                    name: "Blog",
                    href: "/blog"
                  },
                  {
                    name: "Contact",
                    href: "/contact"
                  }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-amber-400 hover:pl-1 transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Get Updates
              </h3>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-slate-800 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:info@vvlawassociates.com" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                    info@vvlawassociates.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-slate-800 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href="tel:+919000366626" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                    +91 9000366626
                  </a>
                </div>
              </div>

              {/* Simple Newsletter */}
              <div>
                <p className="text-slate-400 text-sm mb-3">
                  Subscribe for new notes and legal updates
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-slate-400 text-sm transition-all duration-300"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-md transition-all duration-300 text-sm"
                  >
                    {isSubscribing ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
                
                {subscribeStatus === "success" && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-700/50 rounded-md">
                    <span className="text-green-400 text-xs">Successfully subscribed!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-slate-400">
                &copy; {currentYear} {FIRM_NAME}. All rights reserved.
              </div>
              <div className="flex space-x-4 text-xs">
                <Link href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top - Simple */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-10 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center z-50"
          aria-label="Back to top"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </footer>
  );
}