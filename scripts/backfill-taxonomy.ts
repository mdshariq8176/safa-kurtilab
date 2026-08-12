import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Taxonomy Rule Engine for automatic classification based on title, category & description
export function classifyProduct(title: string, category: string = '', description: string = '') {
  const text = `${title} ${category} ${description}`.toLowerCase();

  // 1. Hub Location Classification
  let hubLocation = 'RAJASTHAN_JAIPUR'; // Default primary hub
  let industrialCluster = 'Sanganer';

  if (text.includes('chikankari') || text.includes('lucknow') || text.includes('modal') || text.includes('mukaish') || text.includes('bakhiya')) {
    hubLocation = 'UTTAR_PRADESH_LUCKNOW';
    industrialCluster = 'Chowk';
  } else if (text.includes('surat') || text.includes('rayon') || text.includes('georgette') || text.includes('organza') || text.includes('sharara') || text.includes('pakistani') || text.includes('foil')) {
    hubLocation = 'GUJARAT_SURAT';
    industrialCluster = 'Millennium Market';
  } else if (text.includes('jaipur') || text.includes('sanganer') || text.includes('block print') || text.includes('cotton') || text.includes('cambric')) {
    hubLocation = 'RAJASTHAN_JAIPUR';
    industrialCluster = 'Sanganer';
  }

  // 2. Fabric Type & Grade
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
  } else if (text.includes('flex') || text.includes('4040')) {
    fabricType = 'Cotton';
    fabricGrade = 'COTTON_FLEX_4040';
    yarnSpecGsm = '40s x 40s / 145 GSM';
  }

  // 3. Pattern Cut Geometry
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
  } else if (text.includes('anarkali') || text.includes('flared') || text.includes('kali')) {
    patternCut = 'ANARKALI_FLARED';
    topLengthInches = 48;
    dupattaMeters = 2.25;
  } else if (text.includes('tunic') || text.includes('short kurti') || text.includes('top')) {
    patternCut = 'SHORT_TUNIC';
    topLengthInches = 30;
  } else if (text.includes('sharara') || text.includes('peplum')) {
    patternCut = 'SHARARA_SET';
    topLengthInches = 30;
  } else if (text.includes('alia')) {
    patternCut = 'ALIA_CUT';
    topLengthInches = 44;
  } else if (text.includes('nyra')) {
    patternCut = 'NYRA_CUT';
    topLengthInches = 44;
  }

  // 4. Collection Tags
  const tags: string[] = [];
  if (patternCut === 'CO_ORD_SET') tags.push('CO_ORD_SETS');
  if (patternCut === 'PAKISTANI_LONG_PANEL') tags.push('PAKISTANI_SUITS');
  if (hubLocation === 'UTTAR_PRADESH_LUCKNOW') tags.push('CHIKANKARI_HERITAGE');
  if (text.includes('plus') || text.includes('3xl') || text.includes('4xl')) tags.push('PLUS_SIZE_SPECIAL');
  if (tags.length === 0) tags.push('DAILYWEAR_BUDGET');

  return {
    hubLocation,
    industrialCluster,
    fabricType,
    fabricGrade,
    yarnSpecGsm,
    qualityGrade: 'GRADE_AA',
    patternCut,
    topLengthInches,
    dupattalengthMeters: dupattaMeters,
    collectionTags: tags.join(','),
  };
}

async function main() {
  console.log('🚀 Running Automatic Taxonomy Classifier on all database records...');
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    const classification = classifyProduct(product.title, product.category, product.description);

    // Calculate B2B set pricing if basePrice was stored as single piece or set price
    let b2bSetPrice = product.b2bSetPrice;
    if (!b2bSetPrice || b2bSetPrice === 0) {
      // If base price is small (< 500), assume single piece price and multiply by 4 for set price
      b2bSetPrice = product.basePrice < 500 ? product.basePrice * 4 : product.basePrice;
    }

    const setPcs = product.setPcs || 4;
    const perPiecePrice = parseFloat((b2bSetPrice / setPcs).toFixed(2));
    const msrpRetailPrice = product.msrpRetailPrice || Math.round(perPiecePrice * 2.2); // Realistic 120% markup
    const retailerMarginPct = Math.round(((msrpRetailPrice - perPiecePrice) / perPiecePrice) * 100);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        hubLocation: classification.hubLocation,
        industrialCluster: classification.industrialCluster,
        fabricType: classification.fabricType,
        fabricGrade: classification.fabricGrade,
        yarnSpecGsm: classification.yarnSpecGsm,
        qualityGrade: classification.qualityGrade,
        patternCut: classification.patternCut,
        topLengthInches: classification.topLengthInches,
        dupattalengthMeters: classification.dupattalengthMeters,
        collectionTags: classification.collectionTags,
        b2bSetPrice,
        perPiecePrice,
        msrpRetailPrice,
        retailerMarginPct,
      },
    });
    updatedCount++;
  }

  console.log(`✅ Classification complete! Updated ${updatedCount} products.`);

  // Print breakdown by Hub
  const hubs = await prisma.product.groupBy({
    by: ['hubLocation'],
    _count: true,
  });
  console.log('📊 Products by Hub Location:', hubs);

  // Print breakdown by Pattern Cut
  const cuts = await prisma.product.groupBy({
    by: ['patternCut'],
    _count: true,
  });
  console.log('📊 Products by Pattern Cut:', cuts);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
