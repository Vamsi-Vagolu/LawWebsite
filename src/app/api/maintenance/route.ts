import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let maintenance = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    if (!maintenance) {
      maintenance = await prisma.maintenanceSettings.create({
        data: {
          isEnabled: false,
          message: "We're currently performing scheduled maintenance. Please check back soon!",
        },
      });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isEnabled, message, endTime } = await request.json();

    let maintenance = await prisma.maintenanceSettings.findFirst();
    
    if (maintenance) {
      maintenance = await prisma.maintenanceSettings.update({
        where: { id: maintenance.id },
        data: {
          isEnabled,
          message: message || "We're currently performing scheduled maintenance. Please check back soon!",
          endTime: endTime ? new Date(endTime) : null,
        },
      });
    } else {
      maintenance = await prisma.maintenanceSettings.create({
        data: {
          isEnabled,
          message: message || "We're currently performing scheduled maintenance. Please check back soon!",
          endTime: endTime ? new Date(endTime) : null,
        },
      });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance settings' },
      { status: 500 }
    );
  }
}