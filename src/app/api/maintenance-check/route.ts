// Make sure you have this file:
// filepath: c:\Users\vamsi\law-firm-site\src\app\api\maintenance-check\route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ isEnabled: settings?.isEnabled || false });
  } catch (error) {
    console.error('Maintenance check error:', error);
    return NextResponse.json({ isEnabled: false });
  }
}