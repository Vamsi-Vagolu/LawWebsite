import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';
import { trackAnalyticsEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, category } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return ErrorResponses.BAD_REQUEST('Missing required fields');
    }

    // Map category to uppercase enum value
    const categoryMap: Record<string, string> = {
      'general': 'GENERAL',
      'support': 'SUPPORT',
      'feedback': 'FEEDBACK',
      'partnership': 'PARTNERSHIP',
      'other': 'OTHER'
    };

    const validCategory = categoryMap[category?.toLowerCase()] || 'GENERAL';

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        category: validCategory,
      },
    });

    // Track analytics event
    await trackAnalyticsEvent({
      eventType: 'USER_ACTION',
      eventName: 'contact_form_submitted',
      properties: {
        category,
        hasPhone: !!phone,
      },
      request,
    });

    return createSuccessResponse({
      id: submission.id,
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint is for admin to view contact submissions
    // Add authentication check here
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent 20 submissions
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    return createSuccessResponse(submissions);

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return ErrorResponses.INTERNAL_ERROR();
  }
}