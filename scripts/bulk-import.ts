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

async function main() {
  const csvFilePath = path.join(process.cwd(), 'catalog_import_template.csv');
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV File not found at: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`🚀 Safa Kurti Lab — B2B Smart Taxonomy Bulk Import`);
  console.log(`📂 Source: ${csvFilePath}`);
  const content = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);

  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 5) { skippedCount++; continue; }

    const getValue = (colName: string): string => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? (row[idx] || '').trim() : '';
    };

    const supplier_sku    = getValue('supplier_sku') || `SKL-AUTO-${Math.floor(Math.random() * 90000 + 10000)}`;
    const title           = getValue('title');
    const description     = getValue('description');
    const category        = getValue('category');
    if (!title) { skippedCount++; continue; }

    // Auto-classify taxonomy if not explicitly provided in CSV
    const autoCls = classifyProduct(title, category, description);

    const hub_location    = getValue('hub_location') || autoCls.hubLocation;
    const industrial_cluster = getValue('industrial_cluster') || autoCls.industrialCluster;
    const fabric_type     = getValue('fabric_type') || autoCls.fabricType;
    const fabric_grade    = getValue('fabric_grade') || autoCls.fabricGrade;
    const yarn_spec_gsm   = getValue('yarn_spec_gsm') || autoCls.yarnSpecGsm;
    const quality_grade   = getValue('quality_grade') || autoCls.qualityGrade;
    const craft_types     = getValue('craft_types') || 'Screen Print';
    const pattern_cut     = getValue('pattern_cut') || autoCls.patternCut;
    const top_length_in   = getValue('top_length_inches') || String(autoCls.topLengthInches);
    const dupatta_m       = getValue('dupatta_length_meters') || (autoCls.dupattalengthMeters ? String(autoCls.dupattalengthMeters) : '');
    const ex_factory      = getValue('ex_factory_price');
    const b2b_price       = getValue('b2b_price');
    const msrp            = getValue('msrp');
    const images          = getValue('images') || '/images/logo.jpg';
    const set_pcs         = getValue('set_pcs');
    const set_ratio       = getValue('set_ratio');
    const is_plus_size    = getValue('is_plus_size');
    const collection_tags = getValue('collection_tags') || autoCls.collectionTags;
    const is_bestseller   = getValue('is_bestseller');
    const is_new_arrival  = getValue('is_new_arrival');
    const is_high_margin  = getValue('is_high_margin');

    const b2bPriceNum     = parseFloat(b2b_price) || 800;
    const setPcsNum       = parseInt(set_pcs) || 4;
    const perPieceNum     = parseFloat((b2bPriceNum / setPcsNum).toFixed(2));
    const msrpNum         = parseFloat(msrp) || Math.round(perPieceNum * 2.2);
    const marginPctNum    = Math.round(((msrpNum - perPieceNum) / perPieceNum) * 100);
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
          basePrice: b2bPriceNum, images, category: category || 'Kurti Pant Set',
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
          basePrice: b2bPriceNum, images, category: category || 'Kurti Pant Set',
          setPcs: setPcsNum, setRatio: set_ratio || 'M,L,XL,XXL',
          isPlusSize: is_plus_size === 'true',
          collectionTags: collection_tags,
          isBestseller: is_bestseller === 'true',
          isNewArrival: is_new_arrival === 'true',
          isHighMargin: is_high_margin === 'true',
        },
      });

      const sizes = (set_ratio || 'M,L,XL,XXL').split(',').map((s) => s.trim());
      for (const size of sizes) {
        await prisma.variant.upsert({
          where: { productId_size_color: { productId: product.id, size, color: 'Assorted' } },
          update: { stock: 10 },
          create: { productId: product.id, size, color: 'Assorted', stock: 10 },
        });
      }

      importedCount++;
      console.log(`✅ [${importedCount}] ${supplier_sku} | ${title} | Hub: ${hub_location} | Cut: ${pattern_cut}`);
    } catch (err) {
      console.error(`❌ Failed ${supplier_sku}:`, err);
      skippedCount++;
    }
  }

  console.log(`\n🎉 Ingestion Complete! ${importedCount} items processed.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
