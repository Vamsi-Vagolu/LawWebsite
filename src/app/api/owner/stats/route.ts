import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Only owners can access stats
    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Get real counts from your database
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
      totalUsers,
      totalAdmins,
      totalNotes
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        totalUsers: 0,
        totalAdmins: 0,
        totalNotes: 0 
      }
    );
  }
}