import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return settings without maxUsers limit
    const settings = {
      firmName: "Law Firm Name",
      address: "123 Legal Street, Law City, LC 12345",
      phone: "+1 (555) 123-4567",
      email: "contact@lawfirm.com",
      website: "https://lawfirm.com",
      allowRegistration: true,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await req.json();

    // Here you would save settings to database or config file
    // For now, just return the updated settings
    console.log("Updated settings:", settings);

    return NextResponse.json({ message: "Settings updated", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}