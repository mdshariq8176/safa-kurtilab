// src/app/api/admin/migrate/route.ts
// Migration & Taxonomy Backfill endpoint for Supabase Production Database

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

function classifyProduct(title: string, category: string = '', description: string = '') {
  const text = `${title} ${category} ${description}`.toLowerCase();

  let hubLocation = 'RAJASTHAN_JAIPUR';
  let industrialCluster = 'Sanganer';

  if (text.includes('chikankari') || text.includes('lucknow') || text.includes('modal') || text.includes('mukaish')) {
    hubLocation = 'UTTAR_PRADESH_LUCKNOW';
    industrialCluster = 'Chowk';
  } else if (text.includes('surat') || text.includes('rayon') || text.includes('georgette') || text.includes('organza') || text.includes('sharara') || text.includes('pakistani') || text.includes('foil')) {
    hubLocation = 'GUJARAT_SURAT';
    industrialCluster = 'Millennium Market';
  } else if (text.includes('jaipur') || text.includes('sanganer') || text.includes('block print') || text.includes('cotton') || text.includes('cambric')) {
    hubLocation = 'RAJASTHAN_JAIPUR';
    industrialCluster = 'Sanganer';
  }

  let fabricType = 'Cotton';
  let fabricGrade = 'PURE_CAMBRIC_6060';
  let yarnSpecGsm = '60s x 60s / 115 GSM';

  if (text.includes('pakistani') || text.includes('lawn')) {
    fabricType = 'Pakistani Lawn Cotton';
    fabricGrade = 'PAKISTANI_LAWN_COTTON_80S';
    yarnSpecGsm = '80s x 80s / 90 GSM';
  } else if (text.includes('rayon') || text.includes('14kg') || text.includes('18kg')) {
    fabricType = 'Rayon';
    fabricGrade = text.includes('18kg') ? 'HEAVY_RAYON_18KG' : 'HEAVY_RAYON_14KG';
    yarnSpecGsm = '150D x 30s / 160 GSM';
  } else if (text.includes('modal') || text.includes('silk')) {
    fabricType = 'Modal Silk';
    fabricGrade = 'PURE_MODAL_145GSM';
    yarnSpecGsm = '100% Modal / 145 GSM';
  } else if (text.includes('georgette') || text.includes('fox')) {
    fabricType = 'Georgette';
    fabricGrade = 'FOX_GEORGETTE_60G';
    yarnSpecGsm = '75D x 75D / 120 GSM';
  }

  let patternCut = 'STRAIGHT_SET';
  let topLengthInches = 42;
  let dupattaMeters: number | null = null;

  if (text.includes('cord') || text.includes('co-ord') || text.includes('coord')) {
    patternCut = 'CO_ORD_SET';
    topLengthInches = 32;
  } else if (text.includes('pakistani')) {
    patternCut = 'PAKISTANI_LONG_PANEL';
    topLengthInches = 46;
    dupattaMeters = 2.25;
  } else if (text.includes('anarkali') || text.includes('flared')) {
    patternCut = 'ANARKALI_FLARED';
    topLengthInches = 48;
    dupattaMeters = 2.25;
  } else if (text.includes('tunic') || text.includes('short kurti') || text.includes('top')) {
    patternCut = 'SHORT_TUNIC';
    topLengthInches = 30;
  } else if (text.includes('sharara') || text.includes('peplum')) {
    patternCut = 'SHARARA_SET';
    topLengthInches = 30;
  }

  const tags: string[] = [];
  if (patternCut === 'CO_ORD_SET') tags.push('CO_ORD_SETS');
  if (patternCut === 'PAKISTANI_LONG_PANEL') tags.push('PAKISTANI_SUITS');
  if (hubLocation === 'UTTAR_PRADESH_LUCKNOW') tags.push('CHIKANKARI_HERITAGE');
  if (tags.length === 0) tags.push('DAILYWEAR_BUDGET');

  return {
    hubLocation, industrialCluster, fabricType, fabricGrade, yarnSpecGsm,
    qualityGrade: 'GRADE_AA', patternCut, topLengthInches,
    dupattalengthMeters: dupattaMeters, collectionTags: tags.join(','),
  };
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.MIGRATE_SECRET || 'safa-migrate-2026';
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results: string[] = [];
    const ddlStatements = MIGRATION_SQL.split(';').map((s) => s.trim()).filter((s) => s.length > 0);

    for (const stmt of ddlStatements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
        results.push(`✅ Executed: ${stmt.substring(0, 40)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push(`⏭️ Skipped: ${stmt.substring(0, 40)}... (${msg.substring(0, 50)})`);
      }
    }

    // Run Bulk Fast Taxonomy Classification on ALL products via raw SQL batch
    const updateSql = `
      UPDATE "Product" SET 
        "hubLocation" = CASE 
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'chikankari|lucknow|modal|mukaish' THEN 'UTTAR_PRADESH_LUCKNOW'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'surat|rayon|georgette|organza|sharara|pakistani|foil' THEN 'GUJARAT_SURAT'
          ELSE 'RAJASTHAN_JAIPUR'
        END,
        "industrialCluster" = CASE 
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'chikankari|lucknow|modal|mukaish' THEN 'Chowk'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'surat|rayon|georgette|organza|sharara|pakistani|foil' THEN 'Millennium Market'
          ELSE 'Sanganer'
        END,
        "fabricType" = CASE 
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'pakistani|lawn' THEN 'Pakistani Lawn Cotton'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'rayon|14kg|18kg' THEN 'Rayon'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'modal|silk' THEN 'Modal Silk'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'georgette|fox' THEN 'Georgette'
          ELSE 'Cotton'
        END,
        "patternCut" = CASE 
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'cord|co-ord|coord' THEN 'CO_ORD_SET'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'pakistani' THEN 'PAKISTANI_LONG_PANEL'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'anarkali|flared' THEN 'ANARKALI_FLARED'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'tunic|short kurti|top' THEN 'SHORT_TUNIC'
          WHEN LOWER(title || ' ' || COALESCE(category,'') || ' ' || COALESCE(description,'')) ~ 'sharara|peplum' THEN 'SHARARA_SET'
          ELSE 'STRAIGHT_SET'
        END,
        "b2bSetPrice" = CASE WHEN "b2bSetPrice" IS NULL OR "b2bSetPrice" = 0 THEN CASE WHEN "basePrice" < 500 THEN "basePrice" * 4 ELSE "basePrice" END ELSE "b2bSetPrice" END;
    `;

    const priceSql = `
      UPDATE "Product" SET 
        "perPiecePrice" = ROUND(CAST("b2bSetPrice" / COALESCE("setPcs", 4) AS NUMERIC), 2),
        "msrpRetailPrice" = COALESCE("msrpRetailPrice", ROUND(CAST(("b2bSetPrice" / COALESCE("setPcs", 4)) * 2.2 AS NUMERIC), 0));
    `;

    const marginSql = `
      UPDATE "Product" SET
        "retailerMarginPct" = ROUND(CAST((("msrpRetailPrice" - "perPiecePrice") / GREATEST("perPiecePrice", 1)) * 100 AS NUMERIC), 0);
    `;

    const classifiedCount = await prisma.$executeRawUnsafe(updateSql);
    await prisma.$executeRawUnsafe(priceSql);
    await prisma.$executeRawUnsafe(marginSql);

    return NextResponse.json({
      success: true,
      migration: results,
      totalClassified: classifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
