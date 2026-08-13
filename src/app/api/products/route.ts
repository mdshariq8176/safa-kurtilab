import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const hub = searchParams.get('hub');
    const fabricType = searchParams.get('fabricType');
    const category = searchParams.get('category');
    const qualityGrade = searchParams.get('qualityGrade') || searchParams.get('quality');
    const craftTypes = searchParams.get('craftTypes');
    const patternCuts = searchParams.get('patternCuts');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minMargin = searchParams.get('minMargin');
    const isBestseller = searchParams.get('isBestseller');
    const isNewArrival = searchParams.get('isNewArrival');
    const isHighMargin = searchParams.get('isHighMargin');
    const search = searchParams.get('search') || searchParams.get('q');
    const sortBy = searchParams.get('sortBy');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '48');
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = { contains: category };
    }

    if (hub) {
      where.hubLocation = hub;
    }

    if (fabricType) {
      where.fabricType = { contains: fabricType };
    }

    if (qualityGrade) {
      const grades = qualityGrade.split(',').map((g) => g.trim());
      where.qualityGrade = { in: grades };
    }

    if (craftTypes) {
      where.craftTypes = { contains: craftTypes };
    }

    if (minMargin) {
      where.retailerMarginPct = { gte: parseFloat(minMargin) };
    }

    if (patternCuts) {
      const cuts = patternCuts.split(',').map((c) => c.trim());
      where.patternCut = { in: cuts };
    }

    if (isBestseller === 'true') {
      where.isBestseller = true;
    }

    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }

    if (isHighMargin === 'true') {
      where.isHighMargin = true;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { fabricType: { contains: search } },
        { craftTypes: { contains: search } },
        { patternCut: { contains: search } },
      ];
    }

    // Determine sorting order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    } else if (sortBy === 'popularity') {
      orderBy = { isBestseller: 'desc' };
    } else if (sortBy === 'margin_desc') {
      orderBy = { retailerMarginPct: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip,
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
