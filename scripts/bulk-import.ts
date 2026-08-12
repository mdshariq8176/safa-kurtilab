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

  console.log(`🚀 Safa Kurti Lab — B2B Bulk Catalog Import`);
  console.log(`📂 Source: ${csvFilePath}`);
  const content = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);
  console.log(`📋 Columns: ${headers.length} | Rows: ${lines.length - 1}`);

  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 10) { skippedCount++; continue; }

    const getValue = (colName: string): string => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? (row[idx] || '').trim() : '';
    };

    const supplier_sku    = getValue('supplier_sku');
    const title           = getValue('title');
    const description     = getValue('description');
    const hub_location    = getValue('hub_location');
    const industrial_cluster = getValue('industrial_cluster');
    const fabric_type     = getValue('fabric_type');
    const fabric_grade    = getValue('fabric_grade');
    const yarn_spec_gsm   = getValue('yarn_spec_gsm');
    const quality_grade   = getValue('quality_grade');
    const craft_types     = getValue('craft_types');
    const pattern_cut     = getValue('pattern_cut');
    const top_length_in   = getValue('top_length_inches');
    const dupatta_m       = getValue('dupatta_length_meters');
    const ex_factory      = getValue('ex_factory_price');
    const b2b_price       = getValue('b2b_price');
    const msrp            = getValue('msrp');
    const images          = getValue('images') || '/images/logo.jpg';
    const category        = getValue('category');
    const set_pcs         = getValue('set_pcs');
    const set_ratio       = getValue('set_ratio');
    const is_plus_size    = getValue('is_plus_size');
    const collection_tags = getValue('collection_tags');
    const is_bestseller   = getValue('is_bestseller');
    const is_new_arrival  = getValue('is_new_arrival');
    const is_high_margin  = getValue('is_high_margin');
    const stock_m         = getValue('stock_m');
    const stock_l         = getValue('stock_l');
    const stock_xl        = getValue('stock_xl');
    const stock_xxl       = getValue('stock_xxl');

    if (!supplier_sku || !title) { skippedCount++; continue; }

    const b2bPriceNum     = parseFloat(b2b_price) || 800;
    const msrpNum         = parseFloat(msrp) || 1999;
    const setPcsNum       = parseInt(set_pcs) || 4;
    const perPieceNum     = parseFloat((b2bPriceNum / setPcsNum).toFixed(2));
    const marginPctNum    = parseFloat((((msrpNum - perPieceNum) / perPieceNum) * 100).toFixed(2));
    const slug            = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`;

    try {
      const product = await prisma.product.upsert({
        where: { supplierSku: supplier_sku },
        update: {
          title, description, hubLocation: hub_location,
          industrialCluster: industrial_cluster, fabricType: fabric_type,
          fabricGrade: fabric_grade, yarnSpecGsm: yarn_spec_gsm,
          qualityGrade: quality_grade, craftTypes: craft_types,
          patternCut: pattern_cut,
          topLengthInches: top_length_in ? parseInt(top_length_in) : null,
          dupattalengthMeters: dupatta_m && dupatta_m !== 'null' ? parseFloat(dupatta_m) : null,
          exFactoryPrice: parseFloat(ex_factory) || undefined,
          b2bSetPrice: b2bPriceNum, perPiecePrice: perPieceNum,
          msrpRetailPrice: msrpNum, retailerMarginPct: marginPctNum,
          basePrice: b2bPriceNum, images, category,
          setPcs: setPcsNum, setRatio: set_ratio || 'M,L,XL,XXL',
          isPlusSize: is_plus_size === 'true',
          collectionTags: collection_tags,
          isBestseller: is_bestseller === 'true',
          isNewArrival: is_new_arrival === 'true',
          isHighMargin: is_high_margin === 'true',
        },
        create: {
          supplierSku: supplier_sku, title, slug, description,
          hubLocation: hub_location, industrialCluster: industrial_cluster,
          fabricType: fabric_type, fabricGrade: fabric_grade,
          yarnSpecGsm: yarn_spec_gsm, qualityGrade: quality_grade,
          craftTypes: craft_types, patternCut: pattern_cut,
          topLengthInches: top_length_in ? parseInt(top_length_in) : null,
          dupattalengthMeters: dupatta_m && dupatta_m !== 'null' ? parseFloat(dupatta_m) : null,
          exFactoryPrice: parseFloat(ex_factory) || undefined,
          b2bSetPrice: b2bPriceNum, perPiecePrice: perPieceNum,
          msrpRetailPrice: msrpNum, retailerMarginPct: marginPctNum,
          basePrice: b2bPriceNum, images, category,
          setPcs: setPcsNum, setRatio: set_ratio || 'M,L,XL,XXL',
          isPlusSize: is_plus_size === 'true',
          collectionTags: collection_tags,
          isBestseller: is_bestseller === 'true',
          isNewArrival: is_new_arrival === 'true',
          isHighMargin: is_high_margin === 'true',
        },
      });

      // Create size variants based on set_ratio (e.g. "M,L,XL,XXL" or "L,XL,XXL,3XL")
      const sizes = (set_ratio || 'M,L,XL,XXL').split(',').map((s) => s.trim());
      const stockMap: Record<string, number> = {
        'M': parseInt(stock_m) || 10,
        'L': parseInt(stock_l) || 10,
        'XL': parseInt(stock_xl) || 10,
        'XXL': parseInt(stock_xxl) || 10,
        '3XL': 10,
      };

      for (const size of sizes) {
        await prisma.variant.upsert({
          where: { productId_size_color: { productId: product.id, size, color: 'Assorted' } },
          update: { stock: stockMap[size] ?? 10 },
          create: { productId: product.id, size, color: 'Assorted', stock: stockMap[size] ?? 10 },
        });
      }

      importedCount++;
      console.log(`✅ [${importedCount}] SKU: ${supplier_sku} | ${title} | B2B Set: ₹${b2bPriceNum} | Pattern: ${pattern_cut}`);
    } catch (err) {
      console.error(`❌ Failed to import SKU ${supplier_sku}:`, err);
      skippedCount++;
    }
  }

  console.log(`\n🎉 Import Complete!`);
  console.log(`   ✅ Products Imported : ${importedCount}`);
  console.log(`   ⚠️  Rows Skipped     : ${skippedCount}`);
}

main()
  .catch((e) => { console.error('❌ Fatal error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
