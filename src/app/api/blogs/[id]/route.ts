import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';
import { trackAnalyticsEvent, trackUserActivity } from '@/lib/analytics';

// GET /api/blogs/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    const isAdmin = token?.role === 'ADMIN' || token?.role === 'OWNER';

    const blog = await prisma.blogPost.findUnique({
      where: { id },
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
    });

    if (!blog) {
      return ErrorResponses.NOT_FOUND('Blog post not found');
    }

    // Check if user can access this blog
    if (!isAdmin && (blog.status !== 'PUBLISHED' || (blog.publishedAt && blog.publishedAt > new Date()))) {
      return ErrorResponses.NOT_FOUND('Blog post not found');
    }

    // Track blog view
    if (blog.status === 'PUBLISHED') {
      // Track view in BlogView table
      await prisma.blogView.create({
        data: {
          blogId: blog.id,
          userId: token?.sub,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          userAgent: request.headers.get('user-agent'),
        },
      });

      // Track analytics event
      try {
        await trackAnalyticsEvent({
          eventType: 'USER_ACTION',
          eventName: 'blog_viewed',
          userId: token?.sub,
          properties: {
            blogId: blog.id,
            blogTitle: blog.title,
            category: blog.category,
          },
          request,
        });

        // Track user activity if logged in
        if (token?.sub) {
          await trackUserActivity(
            token.sub,
            'BLOG_VIEW',
            'blog',
            blog.id,
            { title: blog.title }
          );
        }
      } catch (error) {
        // Analytics tracking shouldn't break blog viewing
      }
    }

    return createSuccessResponse(blog);

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}

// PUT /api/blogs/[id] - Update blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Validate required fields if they are provided
    if (title !== undefined && !title?.trim()) {
      return ErrorResponses.BAD_REQUEST('Title cannot be empty');
    }
    if (content !== undefined && !content?.trim()) {
      return ErrorResponses.BAD_REQUEST('Content cannot be empty');
    }

    // Check if blog exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return ErrorResponses.NOT_FOUND('Blog post not found');
    }

    // Check if slug is unique (excluding current blog)
    if (slug && slug !== existingBlog.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return ErrorResponses.BAD_REQUEST('A blog post with this slug already exists');
      }
    }

    const updateData: Record<string, unknown> = {};

    if (title) updateData.title = title.trim();
    if (slug) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || null;
    if (content) updateData.content = content.trim();
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage || null;
    if (status) {
      updateData.status = status;
      // Set publishedAt if publishing for the first time
      if (status === 'PUBLISHED' && !existingBlog.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      } else if (status === 'PUBLISHED' && publishedAt) {
        updateData.publishedAt = new Date(publishedAt);
      } else if (status !== 'PUBLISHED') {
        updateData.publishedAt = null;
      }
    }
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (tags) updateData.tags = tags;

    const blog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
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
    });

    // Track analytics event
    try {
      await trackAnalyticsEvent({
        eventType: 'USER_ACTION',
        eventName: 'blog_updated',
        userId: token.sub,
        properties: {
          blogId: blog.id,
          status: blog.status,
          wasPublished: status === 'PUBLISHED' && existingBlog.status !== 'PUBLISHED',
        },
        request,
      });
    } catch (error) {
      // Analytics tracking shouldn't break blog update
    }

    return createSuccessResponse(blog);

  } catch (error) {
    return ErrorResponses.INTERNAL_ERROR();
  }
}

// DELETE /api/blogs/[id] - Delete blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub || (token.role !== 'ADMIN' && token.role !== 'OWNER')) {
      return ErrorResponses.FORBIDDEN();
    }

    // Check if blog exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return ErrorResponses.NOT_FOUND('Blog post not found');
    }

    // Delete blog post (cascade will handle related views)
    await prisma.blogPost.delete({
      where: { id },
    });

    // Track analytics event
    try {
      await trackAnalyticsEvent({
        eventType: 'USER_ACTION',
        eventName: 'blog_deleted',
        userId: token.sub,
        properties: {
          blogId: id,
          blogTitle: existingBlog.title,
        },
        request,
      });
    } catch (error) {
      // Analytics tracking shouldn't break blog deletion
    }

    return createSuccessResponse(null);

  } catch (error) {
    return ErrorResponses.INTERNAL_ERROR();
  }
}