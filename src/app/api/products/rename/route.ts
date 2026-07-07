import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const CSV_FILE = path.join(process.cwd(), 'src/data/products.csv');

export async function GET() {
  try {
    // 1. Read the CSV file
    let rawData: string;
    try {
      rawData = await fs.readFile(CSV_FILE, 'utf-8');
    } catch {
      return NextResponse.json({ error: 'Products CSV file not found on disk.' }, { status: 404 });
    }

    const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      return NextResponse.json({ error: 'CSV file is empty.' }, { status: 400 });
    }

    let matchedCount = 0;
    let updatedCount = 0;

    // 2. Loop through CSV rows and sync database
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',');
      if (cols.length < 9) continue;

      const csvTitle = cols[0];
      const originalVendor = cols[1];
      const fabric = cols[4];
      const category = cols[5];

      // Customer-facing title branded as Safa Couture/Safa
      const targetTitle = csvTitle
        .replace(/Chavi Creations/g, 'Safa Couture')
        .replace(/Chavi/g, 'Safa')
        .replace(/Chhabi/g, 'Safa');

      // Description contains the original vendor name
      const targetDescription = `Premium B2B wholesale ${category}. Fabricated from ${fabric}. Crafted for comfortable fits and long-lasting durability. Listed under vendor ${originalVendor}.`;

      // Check if product exists in database by matching CSV slug or parts of the title
      const baseSlug = targetTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      // We search for products that match either the target title or have the slug starting with the baseSlug
      const dbProducts = await prisma.product.findMany({
        where: {
          OR: [
            { title: targetTitle },
            { slug: { startsWith: baseSlug } }
          ]
        }
      });

      if (dbProducts.length > 0) {
        matchedCount++;
        for (const product of dbProducts) {
          // If title, description, or slug needs updating
          if (product.title !== targetTitle || product.description !== targetDescription) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                title: targetTitle,
                description: targetDescription
              }
            });
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database synchronization complete. Matched ${matchedCount} CSV products in DB, updated description vendors for ${updatedCount} products.`,
      matchedCount,
      updatedCount
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown database synchronization error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
