// scripts/db-sync-catalog.ts
process.env.DATABASE_URL = "postgresql://postgres.mbgzoflqfnxxohzuwqmd:SafaKurtilabDB_2026!@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const METADATA_FILE = path.join(process.cwd(), 'scripts/products_to_import.json');

async function main() {
  try {
    console.log('📂 Loading products import metadata...');
    let rawData: string;
    try {
      rawData = await fs.readFile(METADATA_FILE, 'utf-8');
    } catch (e) {
      console.error(`❌ Metadata file not found at ${METADATA_FILE}. Make sure python script has finished!`);
      return;
    }

    const products = JSON.parse(rawData);
    console.log(`📦 Found ${products.length} products to import in metadata file.`);

    const targetSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    let importCount = 0;

    console.log('🚀 Starting ingestion of new products (robust sequential mode)...');
    
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      try {
        // Check if product with this title already exists in the database
        const existing = await prisma.product.findFirst({
          where: { title: item.title }
        });

        if (existing) {
          continue;
        }

        // Create unique slug
        const baseSlug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Create product
        const product = await prisma.product.create({
          data: {
            title: item.title,
            slug: slug,
            description: item.description,
            basePrice: Number(item.basePrice),
            images: item.images,
            category: item.category,
            discount: 0,
          }
        });

        // Create S to XXL variants
        const variants = targetSizes.map(size => ({
          productId: product.id,
          size: size,
          color: item.color || 'Default',
          stock: Number(item.stockPerSize || 50),
        }));

        await prisma.variant.createMany({
          data: variants
        });

        importCount++;
        if (importCount % 50 === 0) {
          console.log(`Progress: Ingested ${importCount}/${products.length} products successfully.`);
        }
      } catch (err) {
        console.error(`⚠️ Failed to ingest product '${item.title}':`, err);
      }
    }

    console.log(`\n✅ Ingested ${importCount} new unique products.`);

    // PHASE 2: Description Cleanup for ALL products
    console.log('\n🔍 Scanning all database products to clean up manufacturer/vendor information from descriptions...');
    const allProducts = await prisma.product.findMany();
    let cleanCount = 0;

    for (const p of allProducts) {
      if (!p.description) continue;
      
      let desc = p.description;
      let modified = false;

      // 1. Remove "Listed under vendor [vendor_name]."
      const vendorPattern = /Listed under vendor\s+[A-Za-z0-9_-]+\.?/g;
      if (vendorPattern.test(desc)) {
        desc = desc.replace(vendorPattern, '');
        modified = true;
      }

      // 2. Remove "Origin Factory: [factory_details]"
      const factoryPattern = /Origin Factory:\s+[^.]+\.?/g;
      if (factoryPattern.test(desc)) {
        desc = desc.replace(factoryPattern, '');
        modified = true;
      }
      
      // 3. Remove general mention of manufacturer names
      const brandPatterns = [
        /Jaipur Ethnic/gi,
        /Chavi_Creations/gi,
        /Maaesa_Creations/gi,
        /Maaesa Creations/gi,
        /Chavi Creations/gi
      ];

      for (const pattern of brandPatterns) {
        if (pattern.test(desc)) {
          desc = desc.replace(pattern, 'Safa Couture');
          modified = true;
        }
      }

      // Clean up whitespace/double spaces/double periods
      desc = desc.replace(/\s+/g, ' ').replace(/\.\.+/g, '.').trim();

      if (modified) {
        try {
          await prisma.product.update({
            where: { id: p.id },
            data: { description: desc }
          });
          cleanCount++;
        } catch (err) {
          console.error(`⚠️ Failed to update description for product ID ${p.id}:`, err);
        }
      }
    }

    console.log(`✅ Successfully cleaned descriptions for ${cleanCount} products in the database.`);
    console.log('\n🎉 Complete database sync and cleanup finished!');

  } catch (error) {
    console.error('❌ database sync pipeline failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
