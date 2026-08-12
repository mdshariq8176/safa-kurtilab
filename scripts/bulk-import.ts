import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const csvFilePath = path.join(process.cwd(), 'catalog_import_template.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV File not found at: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`🚀 Starting Bulk Catalog Import from: ${csvFilePath}`);
  const content = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length <= 1) {
    console.log('⚠️ No data rows found in CSV file.');
    return;
  }

  const headers = parseCSVLine(lines[0]);
  console.log(`📋 Found ${headers.length} columns in CSV header.`);

  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;

    const [
      supplier_sku,
      title,
      description,
      hub_location,
      industrial_cluster,
      fabric_type,
      fabric_grade,
      yarn_spec_gsm,
      quality_grade,
      craft_types,
      pattern_cut,
      ex_factory_price,
      b2b_price,
      msrp,
      images,
      category,
      is_bestseller,
      is_new_arrival,
      is_high_margin,
      stock_m,
      stock_l,
      stock_xl,
      stock_xxl,
    ] = row;

    const b2bPriceNum = parseFloat(b2b_price) || 800;
    const msrpNum = parseFloat(msrp) || 1999;
    const perPieceNum = b2bPriceNum / 4;
    const marginPctNum = parseFloat((((msrpNum - perPieceNum) / perPieceNum) * 100).toFixed(2));

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const product = await prisma.product.upsert({
      where: { supplierSku: supplier_sku },
      update: {
        title,
        description,
        hubLocation: hub_location,
        industrialCluster: industrial_cluster,
        fabricType: fabric_type,
        fabricGrade: fabric_grade,
        yarnSpecGsm: yarn_spec_gsm,
        qualityGrade: quality_grade,
        craftTypes: craft_types,
        patternCut: pattern_cut,
        exFactoryPrice: parseFloat(ex_factory_price) || undefined,
        b2bSetPrice: b2bPriceNum,
        perPiecePrice: perPieceNum,
        msrpRetailPrice: msrpNum,
        retailerMarginPct: marginPctNum,
        basePrice: b2bPriceNum,
        images,
        category,
        isBestseller: is_bestseller === 'true',
        isNewArrival: is_new_arrival === 'true',
        isHighMargin: is_high_margin === 'true',
      },
      create: {
        supplierSku: supplier_sku,
        title,
        slug,
        description,
        hubLocation: hub_location,
        industrialCluster: industrial_cluster,
        fabricType: fabric_type,
        fabricGrade: fabric_grade,
        yarnSpecGsm: yarn_spec_gsm,
        qualityGrade: quality_grade,
        craftTypes: craft_types,
        patternCut: pattern_cut,
        exFactoryPrice: parseFloat(ex_factory_price) || undefined,
        b2bSetPrice: b2bPriceNum,
        perPiecePrice: perPieceNum,
        msrpRetailPrice: msrpNum,
        retailerMarginPct: marginPctNum,
        basePrice: b2bPriceNum,
        images,
        category,
        isBestseller: is_bestseller === 'true',
        isNewArrival: is_new_arrival === 'true',
        isHighMargin: is_high_margin === 'true',
      },
    });

    // Create / Update 4-Piece Size Variants (M, L, XL, XXL)
    const sizes = [
      { size: 'M', stock: parseInt(stock_m) || 10 },
      { size: 'L', stock: parseInt(stock_l) || 10 },
      { size: 'XL', stock: parseInt(stock_xl) || 10 },
      { size: 'XXL', stock: parseInt(stock_xxl) || 10 },
    ];

    for (const item of sizes) {
      await prisma.variant.upsert({
        where: {
          productId_size_color: {
            productId: product.id,
            size: item.size,
            color: 'Assorted',
          },
        },
        update: { stock: item.stock },
        create: {
          productId: product.id,
          size: item.size,
          color: 'Assorted',
          stock: item.stock,
        },
      });
    }

    importedCount++;
    console.log(`✅ [${importedCount}] Imported SKU: ${supplier_sku} | ${title} (B2B Set: ₹${b2bPriceNum})`);
  }

  console.log(`\n🎉 Successfully processed ${importedCount} products into database!`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing bulk import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
