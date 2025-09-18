import Link from "next/link";
import { FIRM_NAME } from "../config";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left md:max-w-lg">
            <h1 className="text-5xl font-extrabold mb-6">
              Welcome to {FIRM_NAME}
            </h1>
            <p className="text-gray-200 mb-8">
              Your one-stop platform for law notes, quizzes, and educational resources for aspiring lawyers. Learn, practice, and excel in your legal journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/notes"
                className="px-6 py-3 bg-yellow-500 text-blue-900 font-semibold rounded hover:bg-yellow-400 transition"
              >
                Explore Notes
              </Link>
              <Link
                href="/quizzes"
                className="px-6 py-3 bg-white text-blue-900 font-semibold rounded hover:bg-gray-200 transition"
              >
                Take Quizzes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Why Choose {FIRM_NAME}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Comprehensive Notes</h3>
              <p className="text-gray-600">Detailed law notes covering all major subjects for students and aspirants.</p>
            </div>
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600">Test your knowledge with quizzes designed to improve retention and understanding.</p>
            </div>
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Learn from curated resources and insights from legal professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Started Today</h2>
          <p className="text-gray-200 mb-8">Join thousands of students using {FIRM_NAME} to prepare for exams and improve legal knowledge.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/notes"
              className="px-6 py-3 bg-yellow-500 text-blue-900 font-semibold rounded hover:bg-yellow-400 transition"
            >
              Explore Notes
            </Link>
            <Link
              href="/quizzes"
              className="px-6 py-3 bg-white text-blue-900 font-semibold rounded hover:bg-gray-200 transition"
            >
              Take Quizzes
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
