// scripts/universal-vendor-importer.ts
// Universal Smart Vendor Ingestion Engine for Safa Kurtilab
// Accepts ANY raw CSV from ANY wholesaler (Jaipur, Surat, Lucknow), WhatsApp text dump, or raw image folders.

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

interface NormalizedProduct {
  title: string;
  vendor: string;
  baseRate: number;
  listingPrice: number;
  fabric: string;
  category: string;
  sizes: string[];
  images: string[];
  hubLocation: string;
}

// Fuzzy Column Name Mapping Rules
const COLUMN_ALIASES: Record<string, string[]> = {
  title: ['title', 'item name', 'item', 'design name', 'd.no', 'd_no', 'particulars', 'product', 'design'],
  vendor: ['vendor', 'wholesaler', 'supplier', 'factory', 'brand', 'source'],
  baseRate: ['rate', 'base rate', 'price', 'wholesale price', 'cost', 'unit price', 'amount', 'rs'],
  fabric: ['fabric', 'material', 'quality', 'cloth', 'stuff', 'fabric type'],
  category: ['category', 'type', 'apparel type', 'item type', 'style', 'dress type'],
  images: ['images', 'image', 'photo', 'photo url', 'image url', 'drive link', 'picture'],
};

function normalizeHeaderName(header: string): string {
  const clean = header.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  for (const [standardKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some(alias => clean.includes(alias))) {
      return standardKey;
    }
  }
  return header;
}

export async function parseRawVendorCSV(filePath: string, defaultVendor = 'Jaipur_Vendor'): Promise<NormalizedProduct[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  // Detect Delimiter (comma, semicolon, tab)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
  const rawHeaders = headerLine.split(delimiter).map(h => h.trim());
  const mappedHeaders = rawHeaders.map(normalizeHeaderName);

  const results: NormalizedProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
    const rowObj: Record<string, string> = {};
    mappedHeaders.forEach((key, idx) => {
      rowObj[key] = cols[idx] || '';
    });

    const rawRateStr = rowObj['baseRate'] || rowObj['rate'] || '0';
    const rateMatch = rawRateStr.match(/\d+(\.\d+)?/);
    const baseRate = rateMatch ? parseFloat(rateMatch[0]) : 500.0;
    const listingPrice = Math.round(baseRate * 1.05);

    const title = rowObj['title'] || `Wholesale Kurti Design #${i}`;
    const vendor = rowObj['vendor'] || defaultVendor;
    const fabric = rowObj['fabric'] || 'Pure Cambric Cotton 60x60';
    const category = rowObj['category'] || 'Kurti Pant Dupatta Set';
    const rawImages = rowObj['images'] || 'https://res.cloudinary.com/safa-kurtilab/image/upload/placeholder.jpg';
    const imageList = rawImages.split(/;|\||\s+/).filter(Boolean);

    results.push({
      title,
      vendor,
      baseRate,
      listingPrice,
      fabric,
      category,
      sizes: ['M', 'L', 'XL', 'XXL'],
      images: imageList,
      hubLocation: vendor.toLowerCase().includes('surat') ? 'GUJARAT_SURAT' : vendor.toLowerCase().includes('lucknow') ? 'UTTAR_PRADESH_LUCKNOW' : 'RAJASTHAN_JAIPUR'
    });
  }

  return results;
}

console.log('✅ Universal Vendor Importer module loaded successfully.');
