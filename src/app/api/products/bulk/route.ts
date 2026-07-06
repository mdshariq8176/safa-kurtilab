import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

const CSV_FILE = path.join(process.cwd(), 'src/data/products.csv');

export async function POST() {
  try {
    // 1. Check if the CSV exists
    try {
      await fs.access(CSV_FILE);
    } catch {
      return NextResponse.json({ error: 'Products CSV file not found on disk.' }, { status: 404 });
    }

    // 2. Read and parse lines
    const rawData = await fs.readFile(CSV_FILE, 'utf-8');
    const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length <= 1) {
      return NextResponse.json({ message: 'CSV file is empty or only contains the header row.', count: 0 });
    }

    const headers = lines[0].split(',');
    const importedProducts: Array<{ title: string; slug: string; price: number }> = [];
    const updatedLines: string[] = [lines[0]]; // Start with header row

    const targetSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    let importCount = 0;

    // 3. Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',');
      if (cols.length < 9) {
        updatedLines.push(line);
        continue;
      }

      const title = cols[0];
      const vendor = cols[1];
      const baseRate = parseFloat(cols[2]);
      const listingPrice = parseFloat(cols[3]);
      const fabric = cols[4];
      const category = cols[5];
      const sizesStr = cols[6];
      const imagesStr = cols[7];
      const status = cols[8];

      // Only import "Draft" status products
      if (status.trim() === 'Draft') {
        console.log(`[B2B Ingestion API] Processing Draft Product: ${title}`);
        
        // Generate unique slug
        const baseSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        const imageList = imagesStr ? imagesStr.split(';') : [];
        const primaryImage = imageList[0] || 'https://res.cloudinary.com/safakurtilab/image/upload/placeholder.jpg';

        // Insert inside transaction
        await prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: {
              title,
              slug,
              description: `Premium B2B wholesale ${category}. Fabricated from ${fabric}. Crafted for comfortable fits and long-lasting durability. Listed under vendor ${vendor}.`,
              basePrice: listingPrice,
              images: primaryImage,
              category,
              discount: 0,
            }
          });

          // Generate size variants
          const variantPayload = targetSizes.map(size => ({
            productId: product.id,
            size,
            color: 'Default',
            stock: 50,
          }));

          await tx.variant.createMany({
            data: variantPayload
          });

          importedProducts.push({ title, slug, price: listingPrice });
        });

        importCount++;
        // Update status column to 'Published'
        cols[8] = 'Published';
        updatedLines.push(cols.join(','));
      } else {
        // Keep row unchanged
        updatedLines.push(line);
      }
    }

    // 4. Write updated statuses back to the CSV file to prevent double ingestion
    if (importCount > 0) {
      await fs.writeFile(CSV_FILE, updatedLines.join('\n') + '\n', 'utf-8');
      console.log(`[B2B Ingestion API] Ingested ${importCount} new products. CSV statuses updated to 'Published'.`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${importCount} new products into the database.`,
      count: importCount,
      products: importedProducts
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown ingestion server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
