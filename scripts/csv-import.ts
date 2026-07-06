// scripts/csv-import.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const CSV_FILE = path.join(process.cwd(), 'src/data/products.csv');

async function main() {
  try {
    // 1. Check if the CSV file exists
    try {
      await fs.access(CSV_FILE);
    } catch {
      console.log(`📂 Products CSV not found at: ${CSV_FILE}. Run the parser script first!`);
      return;
    }

    const rawData = await fs.readFile(CSV_FILE, 'utf-8');
    const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length <= 1) {
      console.log('📂 CSV file is empty or only contains the header row.');
      return;
    }

    console.log(`📦 Starting database ingestion for ${lines.length - 1} products from CSV...`);
    const targetSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    await prisma.$transaction(async (tx) => {
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(',');
        if (cols.length < 9) {
          console.log(`⚠️ Skipping malformed line ${i + 1}: ${line}`);
          continue;
        }

        const title = cols[0];
        const vendor = cols[1];
        const baseRate = parseFloat(cols[2]);
        const listingPrice = parseFloat(cols[3]);
        const fabric = cols[4];
        const category = cols[5];
        const sizesStr = cols[6]; // e.g. "S,M,L,XL,XXL"
        const imagesStr = cols[7]; // semicolon-separated URLs
        const status = cols[8];

        console.log(`Syncing Product: ${title} (${vendor})`);

        // Slugify helper
        const baseSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        // Add random suffix to ensure unique slug constraint
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        // Get first image as primary, fallback to placeholder
        const imageList = imagesStr ? imagesStr.split(';') : [];
        const primaryImage = imageList[0] || 'https://res.cloudinary.com/safakurtilab/image/upload/placeholder.jpg';

        // 1. Core Product Table Entry
        const createdProduct = await tx.product.create({
          data: {
            title: title,
            slug: slug,
            description: `Premium B2B wholesale ${category}. Fabricated from ${fabric}. Crafted for comfortable fits and long-lasting durability. Listed under vendor ${vendor}.`,
            basePrice: listingPrice,
            images: primaryImage, // DB model expects a single string URL
            category: category,
            discount: 0,
          }
        });

        // 2. Size Variant Auto-Generation (S to XXL)
        const variantPayload = targetSizes.map(size => ({
          productId: createdProduct.id,
          size: size,
          color: 'Default',
          stock: 50, // Default B2B stock per variant
        }));

        await tx.variant.createMany({
          data: variantPayload
        });

        console.log(`  └─ ✅ Product synced with slug '${slug}' and 5 variants (S-XXL) bound successfully.`);
      }
    });

    console.log('🎉 Supabase inventory import complete from CSV!');
  } catch (error) {
    console.error('❌ Ingestion pipeline failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
