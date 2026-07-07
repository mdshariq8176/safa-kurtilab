import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const METADATA_FILE = path.join(process.cwd(), 'src/data/sku_metadata.json');

export async function GET() {
  try {
    // 1. Read the metadata JSON file
    let fileContent: string;
    try {
      fileContent = await fs.readFile(METADATA_FILE, 'utf-8');
    } catch {
      return NextResponse.json({ error: 'SKU Metadata file not found on disk. Did you run the extraction script?' }, { status: 404 });
    }

    const skuProducts = JSON.parse(fileContent);
    if (!Array.isArray(skuProducts) || skuProducts.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty metadata array.' }, { status: 400 });
    }

    let insertCount = 0;
    let skipCount = 0;

    // 2. Insert products into the database
    for (const item of skuProducts) {
      const { title, code, price, sizes, category, image, description } = item;

      // Prevent duplication by checking if a product with the same code exists in the description
      const existing = await prisma.product.findFirst({
        where: {
          description: {
            contains: code
          }
        }
      });

      if (existing) {
        if (existing.title !== title || existing.description !== description) {
          await prisma.product.update({
            where: { id: existing.id },
            data: { title, description }
          });
          insertCount++;
        } else {
          skipCount++;
        }
        continue;
      }

      // Generate unique slug
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      // Insert inside a transaction
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            title,
            slug,
            description,
            basePrice: price,
            images: image,
            category,
            discount: 0
          }
        });

        // Generate size variants for each size listed
        const variantPayload = sizes.map((size: string) => ({
          productId: product.id,
          size,
          color: 'Default',
          stock: 50
        }));

        await tx.variant.createMany({
          data: variantPayload
        });
      });

      insertCount++;
    }

    return NextResponse.json({
      success: true,
      message: `SKU products import complete. Inserted ${insertCount} products, skipped ${skipCount} existing duplicates.`,
      inserted: insertCount,
      skipped: skipCount
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown SKU ingestion error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
