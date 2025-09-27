import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

interface AnalyticsEventData {
  eventType: 'PAGE_VIEW' | 'USER_ACTION' | 'SYSTEM_EVENT';
  eventName: string;
  userId?: string;
  sessionId?: string;
  page?: string;
  referrer?: string;
  properties?: Record<string, any>;
  request?: NextRequest;
}

export async function trackAnalyticsEvent(data: AnalyticsEventData) {
  try {
    let userId = data.userId;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    // Extract user info from request if provided
    if (data.request) {
      // Get user from session
      if (!userId) {
        try {
          const token = await getToken({
            req: data.request as any,
            secret: process.env.NEXTAUTH_SECRET
          });
          userId = token?.sub;
        } catch (error) {
          // Ignore auth errors for anonymous tracking
        }
      }

      // Get IP and user agent
      ipAddress = getClientIP(data.request);
      userAgent = data.request.headers.get('user-agent') || undefined;
    }

    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        eventName: data.eventName,
        userId,
        sessionId: data.sessionId,
        ipAddress,
        userAgent,
        page: data.page,
        referrer: data.referrer,
        properties: data.properties ? JSON.stringify(data.properties) : null,
      },
    });

    // Update daily analytics in background
    updateDailyAnalytics(new Date(), data.eventType, data.eventName).catch(() => {});

  } catch (error) {
    // Don't throw to avoid breaking the main flow
  }
}

export async function trackUserActivity(
  userId: string,
  activity: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        activity: activity as any, // Cast to enum
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Silent fail
  }
}

export async function trackPageView(request: NextRequest, page: string) {
  const referrer = request.headers.get('referer');

  await trackAnalyticsEvent({
    eventType: 'PAGE_VIEW',
    eventName: 'page_view',
    page,
    referrer,
    request,
    properties: {
      timestamp: new Date().toISOString(),
    },
  });
}

async function updateDailyAnalytics(date: Date, eventType: string, eventName: string) {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  try {
    const existing = await prisma.dailyAnalytics.findUnique({
      where: { date: dateOnly },
    });

    if (existing) {
      // Update existing record
      const updates: any = {};

      if (eventType === 'PAGE_VIEW') {
        updates.totalPageViews = { increment: 1 };
      }

      if (Object.keys(updates).length > 0) {
        await prisma.dailyAnalytics.update({
          where: { date: dateOnly },
          data: updates,
        });
      }
    } else {
      // Create new record
      await prisma.dailyAnalytics.create({
        data: {
          date: dateOnly,
          totalPageViews: eventType === 'PAGE_VIEW' ? 1 : 0,
        },
      });
    }
  } catch (error) {
    // Silent fail
  }
}

function getClientIP(request: NextRequest): string {
  // Try different headers for IP address
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;

  return 'unknown';
}

export async function getAnalyticsSummary(days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Get daily analytics
    const dailyStats = await prisma.dailyAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get total events
    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get unique users
    const uniqueUsers = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Get top pages
    const topPagesData = await prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: {
        eventType: 'PAGE_VIEW',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        page: { not: null },
      },
      _count: { page: true },
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    });

    return {
      summary: {
        totalPageViews: dailyStats.reduce((sum, day) => sum + day.totalPageViews, 0),
        totalEvents,
        uniqueUsers: uniqueUsers.length,
        days,
      },
      dailyStats,
      topPages: topPagesData.map(item => ({
        page: item.page,
        views: item._count.page,
      })),
    };
  } catch (error) {
    throw error;
  }
}