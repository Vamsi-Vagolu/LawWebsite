import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check environment first
    const environmentDisabled = process.env.DISABLE_MAINTENANCE_CHECKING === 'true';
    
    if (environmentDisabled) {
      return NextResponse.json({
        environmentDisabled: true,
        isEnabled: false,
        message: 'Maintenance system disabled by environment variable',
        startTime: null,
        endTime: null
      });
    }

    // Normal maintenance check
    const maintenance = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      environmentDisabled: false,
      id: maintenance?.id || '1',
      isEnabled: maintenance?.isEnabled || false,
      message: maintenance?.message || '',
      startTime: maintenance?.startTime || null,
      endTime: maintenance?.endTime || null
    });
  } catch (error) {
    console.error('Error fetching maintenance settings:', error);
    return NextResponse.json({
      environmentDisabled: process.env.DISABLE_MAINTENANCE_CHECKING === 'true',
      id: '1',
      isEnabled: false,
      message: '',
      startTime: null,
      endTime: null
    });
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
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}