"use client";

import { useSession } from "next-auth/react";
import NotesPanel from "./NotesPanel";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="p-8 text-center">Loading...</p>;
  if (!session || session.user?.email !== "v.vamsi3666@gmail.com") {
    return <p className="p-8 text-center text-red-500">Unauthorized</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
      {/* Only Notes Panel is shown */}
      <NotesPanel />
      {/* Or, if you want a placeholder for future panels: */}
      {/* <div className="mt-8 text-gray-500 text-center">No other panels available.</div> */}
    </div>
  );
}
