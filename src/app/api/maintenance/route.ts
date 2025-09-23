import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Get maintenance settings
    let maintenance = await prisma.maintenanceMode.findFirst();
    
    if (!maintenance) {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isEnabled: false,
          message: "We're currently performing scheduled maintenance. Please check back soon!",
        },
      });
    }

    // ✅ Get actual counts from database
    const [totalUsers, totalAdmins, totalNotes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: {
            in: ['ADMIN', 'OWNER']
          }
        }
      }),
      prisma.note.count()
    ]);

    // ✅ Return maintenance data with real counts
    return NextResponse.json({
      ...maintenance,
      totalUsers,
      totalAdmins,
      totalNotes
    });

  } catch (error) {
    console.error('Error fetching maintenance settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Only owners can toggle maintenance
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { isEnabled, message, endTime } = await request.json();

    // Update or create maintenance settings
    let maintenance = await prisma.maintenanceMode.findFirst();
    
    if (maintenance) {
      maintenance = await prisma.maintenanceMode.update({
        where: { id: maintenance.id },
        data: {
          isEnabled,
          message: message || "We're currently performing scheduled maintenance. Please check back soon!",
          endTime: endTime ? new Date(endTime) : null,
          updatedAt: new Date(),
        },
      });
    } else {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isEnabled,
          message: message || "We're currently performing scheduled maintenance. Please check back soon!",
          endTime: endTime ? new Date(endTime) : null,
        },
      });
    }

    // ✅ Get updated counts after maintenance toggle
    const [totalUsers, totalAdmins, totalNotes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: {
            in: ['ADMIN', 'OWNER']
          }
        }
      }),
      prisma.note.count()
    ]);

    return NextResponse.json({
      ...maintenance,
      totalUsers,
      totalAdmins,
      totalNotes
    });

  } catch (error) {
    console.error('Error updating maintenance settings:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance settings' },
      { status: 500 }
    );
  }
}