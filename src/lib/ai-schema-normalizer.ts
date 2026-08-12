// src/lib/ai-schema-normalizer.ts
// AI-Driven Schema Normalizer for Safa Kurtilab
// Converts raw, messy vendor inputs (multilingual terms, slang, random headers) into 7-tier B2B records.

export interface NormalizedProductRecord {
  title: string;
  vendor: string;
  baseRate: number;
  listingPrice: number;
  perPiecePrice: number;
  msrpRetailPrice: number;
  fabric: string;
  category: string;
  qualityGrade: string;
  patternCut: string;
  hubLocation: string;
  sizes: string[];
  images: string[];
  status: string;
}

// Vernacular Dictionary for Indian Textile Hubs (Jaipur, Surat, Lucknow)
const DICTIONARY: Record<string, string> = {
  // Fabric mappings
  kapda: 'Pure Cotton',
  kapra: 'Pure Cotton',
  malmal: 'Pure Cambric Cotton 60x60',
  cambric: 'Pure Cambric Cotton 60x60',
  reyon: 'Heavy Rayon 14kg',
  rayon: 'Heavy Rayon 14kg',
  modal: 'Modal Silk Heritage',
  georgette: 'Faux Georgette',
  silk: 'Artsy Silk',
  
  // Category mappings
  dno: 'Kurta Set',
  particulars: 'Kurti Pant Dupatta Set',
  suit: 'Plazo Suit Set',
  coord: 'Indo-Western Co-ord Set',
  anarkali: 'Flared Anarkali Set',
  chikankari: 'Lucknowi Chikankari Set',
  
  // Hub mappings
  sanganer: 'RAJASTHAN_JAIPUR',
  jaipur: 'RAJASTHAN_JAIPUR',
  surat: 'GUJARAT_SURAT',
  lucknow: 'UTTAR_PRADESH_LUCKNOW',
  chowk: 'UTTAR_PRADESH_LUCKNOW',
};

export function normalizeVendorRow(rawRow: Record<string, unknown>, defaultVendor = 'Jaipur_Vendor'): NormalizedProductRecord {
  const rowStr = JSON.stringify(rawRow).toLowerCase();
  
  // 1. Extract Price (handles "Rate 695", "Rs.850", "Price: 1200")
  let baseRate = 650.0;
  for (const value of Object.values(rawRow)) {
    if (typeof value === 'number' && value > 50 && value < 20000) {
      baseRate = value;
      break;
    } else if (typeof value === 'string') {
      const match = value.match(/(?:rate|price|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
      if (match && parseFloat(match[1]) > 50 && parseFloat(match[1]) < 20000) {
        baseRate = parseFloat(match[1]);
        break;
      }
    }
  }

  // 2. Compute 7-Tier Wholesale Pricing
  const listingPrice = Math.round(baseRate * 1.05 * 100) / 100; // 5% GST
  const perPiecePrice = Math.round((listingPrice / 4) * 100) / 100;
  const msrpRetailPrice = Math.round(perPiecePrice * 2.2); // 2.2x Retail MSRP

  // 3. Extract Title
  let rawTitle = rawRow.title || rawRow['item name'] || rawRow.design || rawRow['d.no'] || rawRow.particulars || 'Wholesale Kurti Set';
  if (typeof rawTitle !== 'string') rawTitle = String(rawTitle);

  // 4. Extract Fabric
  let fabric = 'Pure Cambric Cotton 60x60';
  if (rowStr.includes('rayon') || rowStr.includes('reyon')) fabric = 'Heavy Rayon 14kg';
  else if (rowStr.includes('chikankari') || rowStr.includes('modal')) fabric = 'Modal Silk Heritage';
  else if (rowStr.includes('georgette')) fabric = 'Faux Georgette';
  else if (rowStr.includes('silk')) fabric = 'Artsy Silk';

  // 5. Extract Category
  let category = 'Kurti Pant Dupatta Set';
  if (rowStr.includes('anarkali')) category = 'Flared Anarkali Set';
  else if (rowStr.includes('co-ord') || rowStr.includes('coord')) category = 'Indo-Western Co-ord Set';
  else if (rowStr.includes('short') || rowStr.includes('tunic')) category = 'Short Kurti Tunic';
  else if (rowStr.includes('sharara')) category = 'Sharara & Peplum Set';

  // 6. Hub Assignment
  let hubLocation = 'RAJASTHAN_JAIPUR';
  if (rowStr.includes('surat') || fabric.includes('Rayon') || category.includes('Co-ord')) {
    hubLocation = 'GUJARAT_SURAT';
  } else if (rowStr.includes('lucknow') || fabric.includes('Modal') || rowStr.includes('chikankari')) {
    hubLocation = 'UTTAR_PRADESH_LUCKNOW';
  }

  // 7. Extract Image URLs
  let imageList: string[] = [];
  for (const [k, v] of Object.entries(rawRow)) {
    if (typeof v === 'string' && (v.startsWith('http') || v.endsWith('.jpg') || v.endsWith('.png'))) {
      const urls = v.split(/;|\||\s+/).filter(u => u.startsWith('http'));
      imageList.push(...urls);
    }
  }
  if (imageList.length === 0) {
    imageList = ['https://res.cloudinary.com/safa-kurtilab/image/upload/placeholder.jpg'];
  }

  const vendor = rawRow.vendor || rawRow.supplier || defaultVendor;
  const qualityGrade = 'GRADE_AAA';
  const patternCut = category.includes('Co-ord') ? 'CO_ORD_SET' : category.includes('Anarkali') ? 'ANARKALI_FLARED' : 'STRAIGHT_SET';

  return {
    title: `${fabric} ${category} (${rawTitle})`.trim(),
    vendor: String(vendor),
    baseRate,
    listingPrice,
    perPiecePrice,
    msrpRetailPrice,
    fabric,
    category,
    qualityGrade,
    patternCut,
    hubLocation,
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: imageList,
    status: 'Published'
  };
}
