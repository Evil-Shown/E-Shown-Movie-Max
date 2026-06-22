import { NextResponse } from 'next/server';
import { getHomeCatalog } from '@/lib/movie-service';

export async function GET() {
  try {
    const catalog = await getHomeCatalog();
    return NextResponse.json(catalog);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load home catalog' },
      { status: 500 }
    );
  }
}
