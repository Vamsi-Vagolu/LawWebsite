import { prisma } from '@/lib/prisma';
import { createSuccessResponse, ErrorResponses } from '@/lib/api-utils';

export async function GET() {
  try {
    // Fetch BareActs ordered by category and order
    const bareActs = await prisma.bareAct.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        slug: true,
        order: true,
        createdAt: true,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Format response
    const formattedBareActs = bareActs.map(act => ({
      id: act.id,
      title: act.title,
      description: act.description || '',
      category: act.category,
      slug: act.slug,
      order: act.order,
      createdAt: act.createdAt.toISOString(),
    }));

    return createSuccessResponse(formattedBareActs);

  } catch (err) {
    console.error('Error fetching bare acts:', err);
    return ErrorResponses.INTERNAL_ERROR();
  }
}