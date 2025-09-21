"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";

const notesData = [
	{
		id: 1,
		title: "Constitutional Law",
		category: "Constitutional",
		description: "Key concepts, case studies, and summaries.",
	},
	{
		id: 2,
		title: "Criminal Law",
		category: "Criminal",
		description: "Important acts, sections, and landmark judgments.",
	},
	{
		id: 3,
		title: "Contract Law",
		category: "Contract",
		description: "Essentials of contracts and case examples.",
	},
	{
		id: 4,
		title: "Civil Procedure",
		category: "Civil",
		description: "Rules, case examples, and revisions.",
	},
	{
		id: 5,
		title: "Property Law",
		category: "Property",
		description: "Ownership, transfer, and key acts.",
	},
];

interface Note {
	id: string | number;
	title: string;
	category: string;
	description?: string;
	slug?: string;
}

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const [search, setSearch] = useState("");
	const [dbNotes, setDbNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchNotes() {
			try {
				const res = await axios.get("/api/notes");
				setDbNotes(res.data as Note[]);
			} catch (err) {
				console.error("Failed to fetch notes:", err);
				setDbNotes([]);
			} finally {
				setLoading(false);
			}
		}
		fetchNotes();
	}, []);

	if (status === "loading" || loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
				<div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">
					<h2 className="text-2xl font-bold text-red-600 mb-4">
						Access Restricted
					</h2>
					<p className="text-gray-700 mb-6">
						Please login to view this page.
					</p>
					<Link
						href="/login"
						className="text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-800 transition inline-block"
					>
						Login
					</Link>
					<div className="mt-4 text-sm text-gray-500">
						Don&apos;t have an account?{" "}
						<Link href="/signup" className="text-blue-700 underline">
							Sign up
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Combine hardcoded and fetched notes
	const allNotes: Note[] = [
		...notesData,
		...dbNotes.map((note) => ({
			...note,
			id: note.id,
			title: note.title,
			category: note.category,
			description: note.description,
			slug: note.slug,
		})),
	];

	const filteredNotes = allNotes.filter((note) =>
		note.title.toLowerCase().includes(search.toLowerCase())
	);

	const categories = Array.from(new Set(allNotes.map((n) => n.category)));

	return (
		<div className="max-w-7xl mx-auto px-4 py-16">
			{/* Welcome section */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900">
					Welcome, {session.user?.name}
				</h1>
				<p className="text-gray-600">{session.user?.email}</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
				<div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow">
					<h2 className="text-xl font-semibold">Total Notes</h2>
					<p className="text-3xl font-bold mt-2">{allNotes.length}</p>
				</div>
				<div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow">
					<h2 className="text-xl font-semibold">Categories</h2>
					<p className="text-3xl font-bold mt-2">{categories.length}</p>
				</div>
				<div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow">
					<h2 className="text-xl font-semibold">Recent Note</h2>
					<p className="text-2xl mt-2">
						{allNotes[allNotes.length - 1]?.title}
					</p>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mb-8">
				<input
					type="text"
					placeholder="Search notes..."
					className="w-full md:w-1/2 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{/* Notes Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredNotes.length === 0 ? (
					<p className="col-span-full text-gray-500 text-center">
						No notes found.
					</p>
				) : (
					filteredNotes.map((note) => (
						<div
							key={note.id}
							className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1"
						>
							<div className="flex justify-between items-center mb-2">
								<h2 className="font-semibold text-xl">{note.title}</h2>
								<span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
									{note.category}
								</span>
							</div>
							<p className="text-gray-700 mb-4">{note.description}</p>
							<Link
								href={
									note.slug
										? `/dashboard/notes/${note.slug}`
										: `/dashboard/notes/${note.title
												.toLowerCase()
												.replace(/\s+/g, "-")}`
								}
								className="text-blue-700 font-medium hover:underline"
							>
								View Note
							</Link>
						</div>
					))
				)}
			</div>
		</div>
	);
}
