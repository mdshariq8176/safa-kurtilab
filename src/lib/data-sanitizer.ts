// src/lib/data-sanitizer.ts
// Data Guardrail & Sanitization Engine for Safa Kurtilab

import { NormalizedProductRecord } from './ai-schema-normalizer';

export interface SanitizedRecord extends NormalizedProductRecord {
  slug: string;
  isValid: boolean;
  warnings: string[];
}

export function sanitizeAndValidateRecord(record: NormalizedProductRecord, index: number): SanitizedRecord {
  const warnings: string[] = [];

  // 1. Price Bounds Validation (Sanity check: ₹100 <= Base Rate <= ₹20,000)
  let baseRate = record.baseRate;
  if (baseRate < 100) {
    warnings.push(`Base rate ₹${baseRate} is below wholesale floor (₹100). Adjusted to ₹350.`);
    baseRate = 350;
  } else if (baseRate > 20000) {
    warnings.push(`Base rate ₹${baseRate} exceeds wholesale ceiling (₹20,000). Adjusted to ₹4,500.`);
    baseRate = 4500;
  }

  const listingPrice = Math.round(baseRate * 1.05 * 100) / 100;
  const perPiecePrice = Math.round((listingPrice / 4) * 100) / 100;
  const msrpRetailPrice = Math.round(perPiecePrice * 2.2);

  // 2. Image URL Validation
  const validImages = record.images.filter(img => img.startsWith('http://') || img.startsWith('https://'));
  if (validImages.length === 0) {
    warnings.push('No valid HTTP image URL found. Applied default Cloudinary placeholder.');
    validImages.push('https://res.cloudinary.com/safa-kurtilab/image/upload/placeholder.jpg');
  }

  // 3. Unique Slug Generation
  const cleanTitle = record.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const slug = `${cleanTitle}-${uniqueId}-${index}`;

  return {
    ...record,
    baseRate,
    listingPrice,
    perPiecePrice,
    msrpRetailPrice,
    images: validImages,
    slug,
    isValid: warnings.length === 0,
    warnings
  };
}
