import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

// GET /api/owner/admin-metrics - Get admin activity metrics (owner only)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub || token.role !== 'OWNER') {
      return ErrorResponses.FORBIDDEN();
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'OWNER'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Get admin activity counts
    const adminActivities = await Promise.all(
      admins.map(async (admin) => {
        // Get recent activities
        const activities = await prisma.userActivity.findMany({
          where: {
            userId: admin.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        // Get activity breakdown
        const activityBreakdown = await prisma.userActivity.groupBy({
          by: ['activity'],
          where: {
            userId: admin.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: { activity: true },
        });

        // Get content created by admin
        const [notesCreated, testsCreated, blogPostsCreated, contactResponsesCount] = await Promise.all([
          prisma.note.count({
            where: {
              userId: admin.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          prisma.test.count({
            where: {
              createdBy: admin.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          prisma.blogPost.count({
            where: {
              authorId: admin.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          prisma.contactSubmission.count({
            where: {
              respondedBy: admin.id,
              respondedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
        ]);

        return {
          admin,
          totalActivities: activities.length,
          recentActivities: activities.slice(0, 5),
          activityBreakdown: activityBreakdown.reduce((acc, item) => {
            acc[item.activity] = item._count.activity;
            return acc;
          }, {} as Record<string, number>),
          contentStats: {
            notesCreated,
            testsCreated,
            blogPostsCreated,
            contactResponsesCount,
          },
        };
      })
    );

    // Get overall admin statistics
    const totalAdminActivities = await prisma.userActivity.count({
      where: {
        userId: { in: admins.map(a => a.id) },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get most active admins
    const mostActiveAdmins = adminActivities
      .sort((a, b) => b.totalActivities - a.totalActivities)
      .slice(0, 5);

    // Get recent admin actions across all admins
    const recentAdminActions = await prisma.userActivity.findMany({
      where: {
        userId: { in: admins.map(a => a.id) },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get admin login analytics
    const adminLogins = await prisma.analyticsEvent.count({
      where: {
        eventName: 'login',
        userId: { in: admins.map(a => a.id) },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return createSuccessResponse({
      admins: adminActivities,
      summary: {
        totalAdmins: admins.length,
        totalAdminActivities,
        adminLogins,
        timeRangeDays: days,
      },
      mostActiveAdmins,
      recentAdminActions: recentAdminActions.map(action => ({
        id: action.id,
        activity: action.activity,
        entityType: action.entityType,
        entityId: action.entityId,
        metadata: action.metadata,
        createdAt: action.createdAt,
        user: action.user,
      })),
    });

  } catch (error) {
    return ErrorResponses.INTERNAL_ERROR();
  }
}