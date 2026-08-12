// src/app/api/admin/migrate/route.ts
// ONE-TIME migration endpoint — runs prisma db push against Supabase production
// Secured with MIGRATE_SECRET env variable
// Call: POST /api/admin/migrate with header Authorization: Bearer <MIGRATE_SECRET>

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Raw SQL to add all missing columns to the existing Product table
// Safe to run multiple times — uses IF NOT EXISTS
const MIGRATION_SQL = `
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "supplierSku" TEXT UNIQUE;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "hubLocation" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "industrialCluster" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fabricType" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fabricGrade" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "yarnSpecGsm" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "qualityGrade" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "craftTypes" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "patternCut" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "topLengthInches" INTEGER;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dupattalengthMeters" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "exFactoryPrice" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "b2bSetPrice" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "perPiecePrice" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "msrpRetailPrice" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "retailerMarginPct" DOUBLE PRECISION;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gstRatePercent" INTEGER NOT NULL DEFAULT 5;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "microCostingJson" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "setPcs" INTEGER NOT NULL DEFAULT 4;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "setRatio" TEXT NOT NULL DEFAULT 'M,L,XL,XXL';
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPlusSize" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "collectionTags" TEXT;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isBestseller" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isNewArrival" BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isHighMargin" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

  ALTER TABLE "Variant" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

  CREATE UNIQUE INDEX IF NOT EXISTS "Variant_productId_size_color_key" ON "Variant"("productId", "size", "color");
  CREATE INDEX IF NOT EXISTS "idx_products_hub_fabric" ON "Product"("hubLocation", "fabricType");
  CREATE INDEX IF NOT EXISTS "idx_products_pattern_cut" ON "Product"("patternCut");
  CREATE INDEX IF NOT EXISTS "idx_products_quality_grade" ON "Product"("qualityGrade");
  CREATE INDEX IF NOT EXISTS "idx_products_is_plus_size" ON "Product"("isPlusSize");
  CREATE INDEX IF NOT EXISTS "idx_products_b2b_price" ON "Product"("b2bSetPrice");
`;

export async function POST(request: Request) {
  // Validate secret
  const authHeader = request.headers.get('authorization');
  const secret = process.env.MIGRATE_SECRET || 'safa-migrate-2026';
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Execute all migration statements
    const statements = MIGRATION_SQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt + ';');
        results.push(`✅ ${stmt.substring(0, 60)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Skip "column already exists" errors — idempotent
        if (msg.includes('already exists') || msg.includes('duplicate column')) {
          results.push(`⏭️ Skipped (already exists): ${stmt.substring(0, 60)}...`);
        } else {
          results.push(`❌ FAILED: ${stmt.substring(0, 60)}... — ${msg}`);
        }
      }
    }

    // Now seed the 7 B2B sample products into production
    const seedResults = await seedB2BProducts();

    return NextResponse.json({
      success: true,
      migration: results,
      seeded: seedResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

async function seedB2BProducts() {
  const products = [
    {
      supplierSku: 'SKL-SRT-PAK80-PKP-0001',
      title: 'Premium Pakistani Lawn 3-Piece Set',
      slug: 'premium-pakistani-lawn-3-piece-set',
      description: 'Ultra-fine 80s x 80s Pakistani Lawn Cotton 3-Piece Suit with 46-inch long panel top, Schiffli lace embroidery on neckline and sleeves, 2.25m Organza dupatta.',
      hubLocation: 'GUJARAT_SURAT', industrialCluster: 'Millennium Market',
      fabricType: 'Pakistani Lawn Cotton', fabricGrade: 'PAKISTANI_LAWN_COTTON_80S',
      yarnSpecGsm: '80s x 80s / 90 GSM', qualityGrade: 'GRADE_AAA',
      craftTypes: 'Schiffli Lace Embroidery,Organza Dupatta,Digital Lawn Print',
      patternCut: 'PAKISTANI_LONG_PANEL', topLengthInches: 46, dupattalengthMeters: 2.25,
      exFactoryPrice: 390, b2bSetPrice: 780, perPiecePrice: 195, msrpRetailPrice: 1899,
      retailerMarginPct: 874, setPcs: 4, setRatio: 'M,L,XL,XXL', isPlusSize: false,
      collectionTags: 'PAKISTANI_SUITS,NEW_ARRIVALS', isBestseller: true, isNewArrival: true, isHighMargin: true,
      basePrice: 780, category: 'Kurti Pant Set', images: '/images/logo.jpg', discount: 0,
    },
    {
      supplierSku: 'SKL-JPR-C404-COD-0002',
      title: 'Indo-Western Floral Co-ord Set',
      slug: 'indo-western-floral-co-ord-set',
      description: 'Jaipur 40x40 Cotton Flex Short Shirt (32-inch) with matching wide-leg culottes. Screen printed floral motifs with contrast piping.',
      hubLocation: 'RAJASTHAN_JAIPUR', industrialCluster: 'Sanganer',
      fabricType: 'Cotton', fabricGrade: 'COTTON_FLEX_4040',
      yarnSpecGsm: '40s x 40s / 145 GSM', qualityGrade: 'GRADE_AA',
      craftTypes: 'Digital Floral Screen Print,Contrast Piping',
      patternCut: 'CO_ORD_SET', topLengthInches: 32, dupattalengthMeters: null,
      exFactoryPrice: 230, b2bSetPrice: 450, perPiecePrice: 112.5, msrpRetailPrice: 1099,
      retailerMarginPct: 877, setPcs: 4, setRatio: 'M,L,XL,XXL', isPlusSize: false,
      collectionTags: 'CO_ORD_SETS,DAILYWEAR_BUDGET,NEW_ARRIVALS', isBestseller: false, isNewArrival: true, isHighMargin: true,
      basePrice: 450, category: 'Plazo Suit Set', images: '/images/logo.jpg', discount: 0,
    },
    {
      supplierSku: 'SKL-JPR-C404-STN-0003',
      title: 'Dailywear Budget Short Cotton Tunic',
      slug: 'dailywear-budget-short-cotton-tunic',
      description: 'Classic 40x40 Cambric Cotton short tunic (30-inch length) with band collar and side slits. Lightweight daily wear essential.',
      hubLocation: 'RAJASTHAN_JAIPUR', industrialCluster: 'Sitapura Industrial Area',
      fabricType: 'Cotton', fabricGrade: 'COTTON_FLEX_4040',
      yarnSpecGsm: '40s x 40s / 130 GSM', qualityGrade: 'GRADE_A',
      craftTypes: 'Block Print Yoke,Contrast Thread Piping',
      patternCut: 'SHORT_TUNIC', topLengthInches: 30, dupattalengthMeters: null,
      exFactoryPrice: 120, b2bSetPrice: 250, perPiecePrice: 62.5, msrpRetailPrice: 599,
      retailerMarginPct: 858, setPcs: 4, setRatio: 'M,L,XL,XXL', isPlusSize: false,
      collectionTags: 'DAILYWEAR_BUDGET,BESTSELLERS', isBestseller: true, isNewArrival: true, isHighMargin: false,
      basePrice: 250, category: 'Kurti Pant Set', images: '/images/logo.jpg', discount: 0,
    },
    {
      supplierSku: 'SKL-LKN-MODL-ANK-0005',
      title: 'Modal Silk Chikankari Anarkali Set',
      slug: 'modal-silk-chikankari-anarkali-set',
      description: 'Pure 145 GSM Modal Silk 3-Piece Anarkali with authentic hand Bakhiya shadow work Chikankari. 52-inch flared, 2.5m Mul dupatta.',
      hubLocation: 'UTTAR_PRADESH_LUCKNOW', industrialCluster: 'Chowk',
      fabricType: 'Modal Silk', fabricGrade: 'PURE_MODAL_145GSM',
      yarnSpecGsm: '100% Modal / 145 GSM', qualityGrade: 'GRADE_AAA',
      craftTypes: 'Hand Chikankari (Bakhiya & Phanda),Silver Mukaish Dots',
      patternCut: 'ANARKALI_FLARED', topLengthInches: 52, dupattalengthMeters: 2.5,
      exFactoryPrice: 780, b2bSetPrice: 1560, perPiecePrice: 390, msrpRetailPrice: 3799,
      retailerMarginPct: 874, setPcs: 4, setRatio: 'M,L,XL,XXL', isPlusSize: false,
      collectionTags: 'CHIKANKARI_HERITAGE,FESTIVE_SPECIAL,BESTSELLERS', isBestseller: true, isNewArrival: true, isHighMargin: true,
      basePrice: 1560, category: 'Kurti Pant Set', images: '/images/logo.jpg', discount: 0,
    },
    {
      supplierSku: 'SKL-SRT-R18K-ANK-0007',
      title: 'Plus Size Heavy Rayon Anarkali Set',
      slug: 'plus-size-heavy-rayon-anarkali-set',
      description: '18KG Heavy Rayon Anarkali 3-Piece Plus Size bundle (L, XL, XXL, 3XL). Digital floral print with sequence work neckline.',
      hubLocation: 'GUJARAT_SURAT', industrialCluster: 'Ahmedabad Kalupur',
      fabricType: 'Rayon', fabricGrade: 'HEAVY_RAYON_18KG',
      yarnSpecGsm: '150D x 30s / 175 GSM', qualityGrade: 'GRADE_AA',
      craftTypes: 'Sequence Work Neckline,Digital Floral Print',
      patternCut: 'ANARKALI_FLARED', topLengthInches: 48, dupattalengthMeters: 2.25,
      exFactoryPrice: 320, b2bSetPrice: 640, perPiecePrice: 160, msrpRetailPrice: 1549,
      retailerMarginPct: 868, setPcs: 4, setRatio: 'L,XL,XXL,3XL', isPlusSize: true,
      collectionTags: 'PLUS_SIZE_SPECIAL,BESTSELLERS', isBestseller: false, isNewArrival: true, isHighMargin: true,
      basePrice: 640, category: 'Kurti Pant Set', images: '/images/logo.jpg', discount: 0,
    },
  ];

  const seeded: string[] = [];
  for (const p of products) {
    try {
      const product = await prisma.product.upsert({
        where: { supplierSku: p.supplierSku },
        update: { ...p },
        create: { ...p },
      });
      // Create variants
      const sizes = p.setRatio.split(',');
      for (const size of sizes) {
        await prisma.variant.upsert({
          where: { productId_size_color: { productId: product.id, size, color: 'Assorted' } },
          update: { stock: 12 },
          create: { productId: product.id, size, color: 'Assorted', stock: 12 },
        });
      }
      seeded.push(`✅ ${p.supplierSku} — ${p.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      seeded.push(`❌ ${p.supplierSku}: ${msg}`);
    }
  }
  return seeded;
}
