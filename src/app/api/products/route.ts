// Safa Kurtilab REST API endpoint for Products list JSON
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where: Prisma.ProductWhereInput = {};
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
      },
    });

    return NextResponse.json(products);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal database query failure';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
