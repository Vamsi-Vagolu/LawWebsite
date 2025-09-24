// Make sure you have this file:
// filepath: c:\Users\vamsi\law-firm-site\src\app\api\maintenance-check\route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    let maintenance = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (!maintenance) {
      return NextResponse.json({ isEnabled: false });
    }

    // Auto-disable if end time has passed
    if (maintenance.endTime && new Date() > maintenance.endTime) {
      maintenance = await prisma.maintenanceSettings.update({
        where: { id: maintenance.id },
        data: { isEnabled: false, endTime: null },
      });
    }

    return NextResponse.json({ 
      isEnabled: maintenance.isEnabled || false 
    });
  } catch (error) {
    console.error('Error checking maintenance:', error);
    return NextResponse.json({ isEnabled: false });
  }
}