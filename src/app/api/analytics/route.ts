import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';
import { getAnalyticsSummary } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';

// GET /api/analytics - Get analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub || (token.role !== 'ADMIN' && token.role !== 'OWNER')) {
      return ErrorResponses.FORBIDDEN();
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type') || 'summary';

    if (type === 'summary') {
      const analytics = await getAnalyticsSummary(days);
      return createSuccessResponse(analytics);
    }

    if (type === 'contact-submissions') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const submissions = await prisma.contactSubmission.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          responder: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const statusCounts = await prisma.contactSubmission.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { status: true },
      });

      const categoryCounts = await prisma.contactSubmission.groupBy({
        by: ['category'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { category: true },
      });

      return createSuccessResponse({
        submissions,
        summary: {
          total: submissions.length,
          statusBreakdown: statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          categoryBreakdown: categoryCounts.reduce((acc, item) => {
            acc[item.category] = item._count.category;
            return acc;
          }, {} as Record<string, number>),
        },
      });
    }

    if (type === 'user-activity') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user activity summary
      const activityCounts = await prisma.userActivity.groupBy({
        by: ['activity'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { activity: true },
      });

      // Get most active users
      const activeUsers = await prisma.userActivity.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      });

      // Get user details for active users
      const userIds = activeUsers.map(u => u.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      const activeUsersWithDetails = activeUsers.map(au => {
        const user = users.find(u => u.id === au.userId);
        return {
          user,
          activityCount: au._count.userId,
        };
      });

      return createSuccessResponse({
        activityBreakdown: activityCounts.reduce((acc, item) => {
          acc[item.activity] = item._count.activity;
          return acc;
        }, {} as Record<string, number>),
        mostActiveUsers: activeUsersWithDetails,
      });
    }

    if (type === 'blog-analytics') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get blog view counts
      const blogViews = await prisma.blogView.groupBy({
        by: ['blogId'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { blogId: true },
        orderBy: { _count: { blogId: 'desc' } },
        take: 10,
      });

      // Get blog details
      const blogIds = blogViews.map(bv => bv.blogId);
      const blogs = await prisma.blogPost.findMany({
        where: { id: { in: blogIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          publishedAt: true,
        },
      });

      const topBlogs = blogViews.map(bv => {
        const blog = blogs.find(b => b.id === bv.blogId);
        return {
          blog,
          views: bv._count.blogId,
        };
      });

      // Get total blog stats
      const totalBlogs = await prisma.blogPost.count();
      const publishedBlogs = await prisma.blogPost.count({
        where: { status: 'PUBLISHED' },
      });
      const totalViews = await prisma.blogView.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return createSuccessResponse({
        summary: {
          totalBlogs,
          publishedBlogs,
          totalViews,
        },
        topBlogs,
      });
    }

    return ErrorResponses.BAD_REQUEST('Invalid analytics type');

  } catch (error) {
    return ErrorResponses.INTERNAL_ERROR();
  }
}