"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;
  if (!session) return null; // prevent flash before redirect

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Welcome, {session.user?.name || "Law Student"}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => handleNavigate("/dashboard/notes")}
          className="px-6 py-4 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Notes
        </button>
        <button
          onClick={() => handleNavigate("/dashboard/quizzes")}
          className="px-6 py-4 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
        >
          Quizzes
        </button>
      </div>
    </div>
  );
}
