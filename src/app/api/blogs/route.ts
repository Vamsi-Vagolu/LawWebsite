import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';
import { trackAnalyticsEvent } from '@/lib/analytics';

// GET /api/blogs - Fetch published blogs (public) or all blogs (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user is admin for private access
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });
    const isAdmin = token?.role === 'ADMIN' || token?.role === 'OWNER';

    const where: any = {};

    // Public users can only see published blogs
    if (!isAdmin) {
      where.status = 'PUBLISHED';
      where.publishedAt = { lte: new Date() };
    } else {
      // Admin can filter by status
      if (status) {
        where.status = status;
      }
    }

    if (category) {
      where.category = category;
    }

    const blogs = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.blogPost.count({ where });

    return createSuccessResponse({
      blogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}

// POST /api/blogs - Create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub || (token.role !== 'ADMIN' && token.role !== 'OWNER')) {
      return ErrorResponses.FORBIDDEN();
    }

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      category,
      tags,
      publishedAt,
    } = await request.json();

    // Validate required fields
    if (!title || !content) {
      return ErrorResponses.BAD_REQUEST('Title and content are required');
    }

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug: finalSlug },
    });

    if (existingBlog) {
      return ErrorResponses.BAD_REQUEST('A blog post with this slug already exists');
    }

    const blog = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt?.trim(),
        content: content.trim(),
        featuredImage,
        status: status || 'DRAFT',
        category: category?.trim(),
        tags: tags || [],
        authorId: token.sub,
        publishedAt: status === 'PUBLISHED' && publishedAt ? new Date(publishedAt) :
                     status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Track analytics event
    try {
      await trackAnalyticsEvent({
        eventType: 'USER_ACTION',
        eventName: 'blog_created',
        userId: token.sub,
        properties: {
          blogId: blog.id,
          status: blog.status,
          category: blog.category,
        },
        request,
      });
    } catch (error) {
      // Analytics tracking shouldn't break blog creation
    }

    return createSuccessResponse(blog);

  } catch (error) {
    return ErrorResponses.INTERNAL_ERROR();
  }
}