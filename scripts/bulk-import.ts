// scripts/bulk-import.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const DATA_FILE = path.join(process.cwd(), 'products.json');

interface IncomingProduct {
  name: string; // Maps to title
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  stockPerSize: number;
  color?: string; // Maps to color, defaults to 'Default'
}

async function main() {
  try {
    // Check if the data file exists
    try {
      await fs.access(DATA_FILE);
    } catch {
      console.log(`📂 Creating template products.json file at: ${DATA_FILE}...`);
      const templateData: IncomingProduct[] = [
        {
          name: "Luxury Georgette Anarkali Kurti",
          description: "Premium ethnic wear with detailed embroidery work perfect for festivals.",
          basePrice: 1499,
          imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234/sample.jpg",
          category: "Anarkali",
          stockPerSize: 50,
          color: "Emerald"
        }
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(templateData, null, 2), 'utf-8');
      console.log('💡 Created dummy template. Please edit products.json and run this script again!');
    }

    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const products: IncomingProduct[] = JSON.parse(rawData);
    
    console.log(`📦 Starting database ingestion for ${products.length} catalog products...`);

    const targetSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    await prisma.$transaction(async (tx) => {
      for (const item of products) {
        console.log(`Syncing Product: ${item.name}`);

        // Slugify helper
        const baseSlug = item.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        // Add randomness suffix to guarantee unique constraint compliance
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        // 1. Core Product Table Entry
        const createdProduct = await tx.product.create({
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

        // 2. Size Variant Auto-Generation (S to XXL)
        const variantPayload = targetSizes.map(size => ({
          productId: createdProduct.id,
          size: size,
          color: item.color || 'Default',
          stock: Number(item.stockPerSize),
        }));

        await tx.variant.createMany({
          data: variantPayload
        });

        console.log(`  └─ ✅ Product created with slug '${slug}' and 5 size variants (S-XXL) bound successfully.`);
      }
    });

    console.log('🎉 Supabase inventory sync operation completed without errors!');
  } catch (error) {
    console.error('❌ Ingestion pipeline failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
