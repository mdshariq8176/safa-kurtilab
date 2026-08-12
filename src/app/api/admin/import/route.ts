// src/app/api/admin/import/route.ts
// Production Visual Admin Import API Route
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeVendorRow } from '@/lib/ai-schema-normalizer';
import { sanitizeAndValidateRecord } from '@/lib/data-sanitizer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rows, defaultVendor } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No rows provided for import.' }, { status: 400 });
    }

    console.log(`📦 Visual Admin Import: Processing ${rows.length} vendor rows...`);

    const sanitizedRecords = rows.map((row, idx) => {
      const normalized = normalizeVendorRow(row, defaultVendor || 'Jaipur_Vendor');
      return sanitizeAndValidateRecord(normalized, idx);
    });

    let successCount = 0;
    let failCount = 0;

    // Process records in transactions
    for (const record of sanitizedRecords) {
      try {
        await prisma.product.create({
          data: {
            title: record.title,
            slug: record.slug,
            description: `${record.fabric} ${record.category} manufactured at ${record.vendor}. 100% Export Grade Quality.`,
            basePrice: record.listingPrice,
            discount: 0,
            images: record.images.join(';'),
            category: record.category,
            supplierSku: `SKU-${record.slug.substring(0, 10).toUpperCase()}`,
            hubLocation: record.hubLocation,
            industrialCluster: record.hubLocation === 'GUJARAT_SURAT' ? 'Millennium Market' : record.hubLocation === 'UTTAR_PRADESH_LUCKNOW' ? 'Chowk Cluster' : 'Sanganer Cluster',
            fabricType: record.fabric,
            qualityGrade: record.qualityGrade,
            patternCut: record.patternCut,
            b2bSetPrice: record.listingPrice,
            perPiecePrice: record.perPiecePrice,
            msrpRetailPrice: record.msrpRetailPrice,
            retailerMarginPct: 120.0,
            variants: {
              create: record.sizes.map((size) => ({
                size,
                color: 'Default',
                stock: 100,
              })),
            },
          },
        });
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`❌ Import failed for ${record.title}:`, err);
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Batch import complete. Successfully synced ${successCount} products (${failCount} skipped/failed).`,
      totalRows: rows.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error('Visual Admin Import API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Import pipeline execution failed.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
