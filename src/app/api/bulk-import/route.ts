import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Secure key guard to prevent unauthorized trigger
    if (key !== 'safa-bulk-import-9923') {
      return NextResponse.json({ error: 'Unauthorized key.' }, { status: 401 });
    }

    const filePath = path.join(process.cwd(), 'products.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(rawData);

    console.log(`📦 Starting database ingestion for ${products.length} products...`);

    // 1. Clear old entries to keep the catalog clean and aligned with the 50 products matrix
    await prisma.variant.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});

    let productsCount = 0;
    let variantsCount = 0;
    const targetSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    for (const item of products) {
      // Slugify helper
      const baseSlug = item.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      // Ingest Product
      const createdProduct = await prisma.product.create({
        data: {
          title: item.name,
          slug: slug,
          description: item.description,
          basePrice: Number(item.basePrice),
          images: item.imageUrl,
          category: item.category,
          discount: 0,
        }
      });
      productsCount++;

      // Ingest Variants
      for (const size of targetSizes) {
        await prisma.variant.create({
          data: {
            productId: createdProduct.id,
            size: size,
            color: item.color || 'Default',
            stock: Number(item.stockPerSize),
          }
        });
        variantsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ingestion pipeline completed successfully.',
      syncedProducts: productsCount,
      syncedVariants: variantsCount
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Ingestion failed.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
