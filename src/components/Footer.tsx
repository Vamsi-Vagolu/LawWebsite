import Link from "next/link";
import { FIRM_NAME } from "../config";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{FIRM_NAME}</h3>
            <p>Trying to present legal language in simple words.</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul>
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/notes" className="hover:text-white">Notes</Link></li>
              <li><Link href="/quizzes" className="hover:text-white">Quizzes</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <p>Email: info@vvlawassociates.com</p>
            <p>Phone: +91 9000366626</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} {FIRM_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
