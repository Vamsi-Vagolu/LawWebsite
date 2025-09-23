import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // Check if maintenance should auto-disable
    if (settings?.isEnabled && settings.endTime && new Date() > settings.endTime) {
      const updatedSettings = await prisma.maintenanceSettings.update({
        where: { id: settings.id },
        data: { isEnabled: false, endTime: null }
      });
      
      const response = NextResponse.json(updatedSettings);
      // ✅ Set cookie to reflect updated state
      response.cookies.set('maintenance-mode', 'false', {
        httpOnly: false,
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });
      return response;
    }

    const response = NextResponse.json(settings || { isEnabled: false });
    
    // ✅ Set maintenance cookie
    const maintenanceStatus = settings?.isEnabled ? 'true' : 'false';
    response.cookies.set('maintenance-mode', maintenanceStatus, {
      httpOnly: false,
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Maintenance settings error:', error);
    return NextResponse.json({ error: "Failed to fetch maintenance settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true }
    });

    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Owner/Admin access required" }, { status: 401 });
    }

    const { isEnabled, message, durationInMinutes } = await request.json();
    console.log('🔧 Setting maintenance to:', isEnabled); // ✅ Debug log

    let endTime = null;
    if (isEnabled && durationInMinutes && durationInMinutes > 0) {
      endTime = new Date(Date.now() + durationInMinutes * 60 * 1000);
    }

    await prisma.maintenanceSettings.deleteMany({});
    
    const settings = await prisma.maintenanceSettings.create({
      data: {
        isEnabled,
        message: message || "We're currently performing scheduled maintenance. Please check back soon!",
        startTime: isEnabled ? new Date() : null,
        endTime: endTime
      }
    });

    const response = NextResponse.json(settings);
    
    // ✅ Debug cookie setting
    const cookieValue = isEnabled ? 'true' : 'false';
    console.log('🍪 Setting maintenance-mode cookie to:', cookieValue);
    
    response.cookies.set('maintenance-mode', cookieValue, {
      httpOnly: false,
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    console.log('✅ Cookie should be set. Response headers:', response.headers);

    return response;
  } catch (error) {
    console.error('Maintenance update error:', error);
    return NextResponse.json({ error: "Failed to update maintenance settings" }, { status: 500 });
  }
}