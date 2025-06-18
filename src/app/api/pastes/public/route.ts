import { NextRequest, NextResponse } from 'next/server';
import { getPublicPastesPaginated } from '@/features/paste/actions/paste.actions';

export async function GET(request: NextRequest) {
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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}