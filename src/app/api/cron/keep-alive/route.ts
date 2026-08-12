import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a lightweight database query to keep Supabase database active & prevent auto-pausing
    const productCount = await prisma.product.count();
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase database keep-alive ping successful',
      timestamp,
      productCount,
    });
  } catch (error) {
    console.error('Keep-alive database query failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to query database for keep-alive',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
