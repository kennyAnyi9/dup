import { NextRequest, NextResponse } from 'next/server';
import { getPublicPastesPaginated } from '@/features/paste/actions/paste.actions';
import { getCurrentUser } from "@/shared/lib/auth-server";
import { withRateLimit } from "@/shared/lib/advanced-rate-limit";

export async function GET(request: NextRequest) {
  // Get current user for rate limiting
  const user = await getCurrentUser();
  
  return withRateLimit("PUBLIC_PASTES", async () => {
    try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);

    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      return NextResponse.json(
        { error: 'Pagination parameters must be integers' },
        { status: 400 },
      );
    }

    // Range validation
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

      const result = await getPublicPastesPaginated(page, limit);
      
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }, { userId: user?.id || null });
}