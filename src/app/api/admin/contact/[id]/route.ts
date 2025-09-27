import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';
import { trackAnalyticsEvent } from '@/lib/analytics';

// PUT /api/admin/contact/[id] - Update contact submission (admin only)
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

    const { status, adminNotes } = await request.json();

    // Check if submission exists
    const existingSubmission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return ErrorResponses.NOT_FOUND('Contact submission not found');
    }

    // Update submission
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
      if (status !== 'NEW') {
        updateData.respondedAt = new Date();
        updateData.respondedBy = token.sub;
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: updateData,
      include: {
        responder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Track analytics event
    await trackAnalyticsEvent({
      eventType: 'USER_ACTION',
      eventName: 'contact_submission_updated',
      userId: token.sub,
      properties: {
        submissionId: id,
        newStatus: status,
        hasAdminNotes: !!adminNotes,
      },
      request,
    });

    return createSuccessResponse(updatedSubmission, 'Contact submission updated successfully');

  } catch (error) {
    console.error('Error updating contact submission:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}