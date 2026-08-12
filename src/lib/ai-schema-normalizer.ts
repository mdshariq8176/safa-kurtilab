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
  kapda: 'Pure Cotton',
  kapra: 'Pure Cotton',
  malmal: 'Pure Cambric Cotton 60x60',
  cambric: 'Pure Cambric Cotton 60x60',
  reyon: 'Heavy Rayon 14kg',
  rayon: 'Heavy Rayon 14kg',
  modal: 'Modal Silk Heritage',
  georgette: 'Faux Georgette',
  silk: 'Artsy Silk',
  dno: 'Kurta Set',
  particulars: 'Kurti Pant Dupatta Set',
  suit: 'Plazo Suit Set',
  coord: 'Indo-Western Co-ord Set',
  anarkali: 'Flared Anarkali Set',
  chikankari: 'Lucknowi Chikankari Set',
};

// Technique 1: Indian Bust Size Converter (36 -> S, 38 -> M, 40 -> L, 42 -> XL, 44 -> XXL)
export function normalizeIndianSizes(sizesStr: string | string[]): string[] {
  let rawList: string[] = [];
  if (Array.isArray(sizesStr)) {
    rawList = sizesStr;
  } else if (typeof sizesStr === 'string') {
    rawList = sizesStr.split(/;|\||,|\s+/).map(s => s.trim()).filter(Boolean);
  }

  const BUST_SIZE_MAP: Record<string, string> = {
    '36': 'S',
    '38': 'M',
    '40': 'L',
    '42': 'XL',
    '44': 'XXL',
    '46': '3XL',
    '48': '4XL',
  };

  const normalizedSet = new Set<string>();
  for (const s of rawList) {
    const uppercase = s.toUpperCase();
    if (BUST_SIZE_MAP[uppercase]) {
      normalizedSet.add(BUST_SIZE_MAP[uppercase]);
    } else if (['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].includes(uppercase)) {
      normalizedSet.add(uppercase);
    }
  }

  return normalizedSet.size > 0 ? Array.from(normalizedSet) : ['M', 'L', 'XL', 'XXL'];
}

// Technique 2: Extract WhatsApp Batch Date (e.g. IMG-20260706-WA0001 -> "July 2026 Batch")
export function extractWhatsAppBatchDate(filename: string): string | null {
  const match = filename.match(/IMG-(\d{4})(\d{2})(\d{2})-WA/i);
  if (match) {
    const year = match[1];
    const monthNum = parseInt(match[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[monthNum - 1] || 'Batch';
    return `${monthName} ${year} Collection`;
  }
  return null;
}

// Technique 3: Extract Design/SKU Code (e.g. "D.NO_-129" or "NAG-11001")
export function extractSupplierSKU(text: string): string {
  const match = text.match(/(?:D\.?NO\.?|SKU|CODE|REF)[_\-\s:]*([A-Z0-9\-_]+)/i);
  if (match) {
    return match[1].toUpperCase();
  }
  const codeMatch = text.match(/([A-Z]{2,4}-\d{4,5})/i);
  if (codeMatch) {
    return codeMatch[1].toUpperCase();
  }
  return `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
}

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

  // 3. Extract Title & SKU
  let rawTitle = rawRow.title || rawRow['item name'] || rawRow.design || rawRow['d.no'] || rawRow.particulars || 'Wholesale Kurti Set';
  if (typeof rawTitle !== 'string') rawTitle = String(rawTitle);

  // 4. Extract Sizes with Technique 1
  const rawSizes = rawRow.sizes || rawRow.size || '38;40;42;44';
  const sizes = normalizeIndianSizes(rawSizes as string);

  // 5. Extract Fabric
  let fabric = 'Pure Cambric Cotton 60x60';
  if (rowStr.includes('rayon') || rowStr.includes('reyon')) fabric = 'Heavy Rayon 14kg';
  else if (rowStr.includes('chikankari') || rowStr.includes('modal')) fabric = 'Modal Silk Heritage';
  else if (rowStr.includes('georgette')) fabric = 'Faux Georgette';
  else if (rowStr.includes('silk')) fabric = 'Artsy Silk';

  // 6. Extract Category
  let category = 'Kurti Pant Dupatta Set';
  if (rowStr.includes('anarkali')) category = 'Flared Anarkali Set';
  else if (rowStr.includes('co-ord') || rowStr.includes('coord')) category = 'Indo-Western Co-ord Set';
  else if (rowStr.includes('short') || rowStr.includes('tunic')) category = 'Short Kurti Tunic';
  else if (rowStr.includes('sharara')) category = 'Sharara & Peplum Set';

  // 7. Hub Assignment
  let hubLocation = 'RAJASTHAN_JAIPUR';
  if (rowStr.includes('surat') || fabric.includes('Rayon') || category.includes('Co-ord')) {
    hubLocation = 'GUJARAT_SURAT';
  } else if (rowStr.includes('lucknow') || fabric.includes('Modal') || rowStr.includes('chikankari')) {
    hubLocation = 'UTTAR_PRADESH_LUCKNOW';
  }

  // 8. Extract Image URLs with Technique 4 (multi-delimiter auto-splitter)
  let imageList: string[] = [];
  for (const v of Object.values(rawRow)) {
    if (typeof v === 'string' && (v.includes('http') || v.includes('.jpg') || v.includes('.png'))) {
      const urls = v.split(/;|\||,|\s+/).filter(u => u.length > 3);
      imageList.push(...urls);
    }
  }
  if (imageList.length === 0) {
    imageList = ['https://res.cloudinary.com/safa-kurtilab/image/upload/placeholder.jpg'];
  }

  const vendor = (rawRow.vendor || rawRow.supplier || defaultVendor) as string;
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
    sizes,
    images: imageList,
    status: 'Published'
  };
}
