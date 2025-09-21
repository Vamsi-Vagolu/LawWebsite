import { NextRequest, NextResponse } from "next/server";

let quizzes: any[] = []; // Replace with DB connection

export async function GET() {
  return NextResponse.json(quizzes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  quizzes.push({ id: Date.now().toString(), ...data });
  return NextResponse.json(data, { status: 201 });
}
