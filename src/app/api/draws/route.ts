import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      include: { game: true },
      orderBy: { scheduledAt: 'asc' },
    });
    return NextResponse.json({ success: true, draws });
  } catch (error) {
    console.error('Failed to fetch draws:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}