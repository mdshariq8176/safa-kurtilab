/**
 * ============================================================
 * SAFA KURTI LAB — B2B Catalog TypeScript Type Definitions
 * ============================================================
 * Version: 2.0
 * Covers: ProductRecord, CatalogFilterQueryParams, Enums,
 *         MicroCostingData, ProductSeedPayload
 */

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

/** Level 1: Primary Sourcing Manufacturing Hub */
export type HubLocation =
  | 'RAJASTHAN_JAIPUR'
  | 'GUJARAT_SURAT'
  | 'UTTAR_PRADESH_LUCKNOW';

/** Level 3: Technical Fabric Quality Grade */
export type FabricGrade =
  | 'PAKISTANI_LAWN_COTTON_80S'  // 80s x 80s, 90 GSM — Ultra-fine Pakistani Lawn
  | 'PURE_CAMBRIC_6060'          // 60s x 60s, 115 GSM — Jaipur Block Print Standard
  | 'COTTON_FLEX_4040'           // 40s x 40s, 145 GSM — Daily Commercial Cotton
  | 'HEAVY_RAYON_14KG'           // 150D x 30s, 160 GSM — Surat Commercial Rayon
  | 'HEAVY_RAYON_18KG'           // 150D x 30s, 175 GSM — Surat Export Heavy Rayon
  | 'FOX_GEORGETTE_60G'          // 75D x 75D, 120 GSM — Micro Fox Georgette + Santoon lining
  | 'VISCOSE_MUSLIN'             // 100% Viscose, 110 GSM — Lucknow Chikankari base
  | 'PURE_MODAL_145GSM'          // 100% Modal, 145 GSM — Lucknow Premium Chikankari
  | 'CHANDERI_SILK_BLEND';       // Chanderi Silk x Cotton warp — Festive range

/** Level 4: Design Cut & Pattern Geometry */
export type PatternCut =
  | 'PAKISTANI_LONG_PANEL'       // 44–48" length, Schiffli/lace panels, scallop hem
  | 'CO_ORD_SET'                 // Short Shirt (30–34") + Wide Pants — Indo-Western
  | 'SHORT_TUNIC'                // 28–32" crop tunic / top
  | 'STRAIGHT_SET'               // Classic straight kurti + pant (38–42")
  | 'ANARKALI_FLARED'            // 16-Kali / 24-Kali flared (48–54")
  | 'ALIA_CUT'                   // Side slit, v-neck kurti (40–44")
  | 'NYRA_CUT'                   // A-line flare with princess seam (40–44")
  | 'SHARARA_SET'                // Peplum top + two-tier Sharara pants
  | 'KAFTAN';                    // Loose flowy kaftan silhouette

/** Level 5: Collection / Campaign Tags */
export type CollectionTag =
  | 'PAKISTANI_SUITS'
  | 'CO_ORD_SETS'
  | 'DAILYWEAR_BUDGET'
  | 'PLUS_SIZE_SPECIAL'
  | 'FESTIVE_SPECIAL'
  | 'CHIKANKARI_HERITAGE'
  | 'WEDDING_TROUSSEAU'
  | 'NEW_ARRIVALS'
  | 'BESTSELLERS';

/** B2B Set Size Ratio Options */
export type SetRatio =
  | 'M,L,XL,XXL'                 // Standard 4-piece
  | 'S,M,L,XL'                   // Slim-cut 4-piece
  | 'L,XL,XXL,3XL'               // Plus size 4-piece
  | 'M,L,XL,XXL,3XL'             // Extended 5-piece plus
  | 'S,M,L,XL,XXL,3XL';          // Full range 6-piece

/** Quality Grading System */
export type QualityGrade =
  | 'GRADE_AAA'   // Super Premium Export (bio-washed, 0% shrinkage, OEKO-TEX)
  | 'GRADE_AA'    // Domestic Premium (mercerized, < 2% shrinkage)
  | 'GRADE_A'     // Commercial Standard Volume
  | 'GRADE_B';    // Economy Mass Budget

// ─────────────────────────────────────────────────────────────
// MICRO COSTING DATA INTERFACE
// ─────────────────────────────────────────────────────────────

/** Granular cost breakdown per set — stored as JSON in DB */
export interface MicroCostingData {
  greyFabricCostPerMeter: number;       // ₹/meter
  metersRequiredPerSet: number;         // total meters for 4 garments
  printingOrDyeingCost: number;         // ₹ per set
  embellishmentCraftCost: number;       // ₹ per set (Gota, Schiffli, Chikankari, etc.)
  stitchingInterlockLabor: number;      // ₹ per set
  packagingQcOverhead: number;          // ₹ per set
  totalExFactoryCostPerSet: number;     // Sum of all above
}

// ─────────────────────────────────────────────────────────────
// FULL PRODUCT RECORD TYPE (Database Model + Nested Relations)
// ─────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;          // M | L | XL | XXL | 3XL
  color: string;         // Assorted | Emerald | Crimson | etc.
  stock: number;
  createdAt: string;
}

export interface ProductRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  discount: number;
  images: string;        // Comma-separated image URLs
  category: string;      // Legacy: Kurti Pant Set | Plazo Suit Set

  // ── Level 1: Hub ──
  hubLocation: HubLocation | null;
  industrialCluster: string | null;

  // ── Level 2 & 3: Fabric ──
  fabricType: string | null;
  fabricGrade: FabricGrade | null;
  yarnSpecGsm: string | null;
  qualityGrade: QualityGrade | null;

  // ── Level 4: Design ──
  craftTypes: string | null;         // Comma-separated
  patternCut: PatternCut | null;

  // ── Physical Dimensions ──
  topLengthInches: number | null;    // Garment length in inches
  dupattalengthMeters: number | null; // Dupatta length in meters (null if no dupatta)

  // ── B2B Pricing ──
  supplierSku: string | null;
  exFactoryPrice: number | null;
  b2bSetPrice: number | null;
  perPiecePrice: number | null;
  msrpRetailPrice: number | null;
  retailerMarginPct: number | null;
  gstRatePercent: number;            // Default: 5
  microCostingJson: string | null;   // JSON string of MicroCostingData

  // ── Bundle Config ──
  setPcs: number;                    // Default: 4
  setRatio: SetRatio;                // Default: "M,L,XL,XXL"
  isPlusSize: boolean;
  videoUrl: string | null;

  // ── Smart Filters ──
  collectionTags: string | null;     // Comma-separated CollectionTag values
  isBestseller: boolean;
  isNewArrival: boolean;
  isHighMargin: boolean;

  // ── Nested Relations ──
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// CATALOG FILTER QUERY PARAMS — API Request Interface
// ─────────────────────────────────────────────────────────────

export interface CatalogFilterQueryParams {
  // Primary Navigation (Level 1 & 2)
  hub?: HubLocation;
  fabricType?: string;

  // Faceted Filters (Level 3, 4, 5)
  fabricGrade?: FabricGrade | FabricGrade[];
  qualityGrade?: QualityGrade | QualityGrade[];
  patternCut?: PatternCut | PatternCut[];
  collectionTag?: CollectionTag | CollectionTag[];

  // Physical Dimension Filters
  isPlusSize?: boolean;
  minTopLengthInches?: number;
  maxTopLengthInches?: number;

  // B2B Price Range Filter
  minB2bPrice?: number;
  maxB2bPrice?: number;
  minRetailerMargin?: number;

  // Discovery Filters (Level 5)
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isHighMargin?: boolean;

  // Standard Filters
  category?: string;
  search?: string;
  sortBy?:
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'margin_desc'
    | 'popularity';

  // Pagination
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// PRODUCT SEED PAYLOAD — Used by bulk-import.ts
// ─────────────────────────────────────────────────────────────

export interface ProductSeedPayload {
  supplierSku: string;
  title: string;
  description: string;
  hubLocation: HubLocation;
  industrialCluster: string;
  fabricType: string;
  fabricGrade: FabricGrade;
  yarnSpecGsm: string;
  qualityGrade: QualityGrade;
  craftTypes: string;
  patternCut: PatternCut;
  topLengthInches: number;
  dupattalengthMeters: number | null;
  exFactoryPrice: number;
  b2bSetPrice: number;
  msrpRetailPrice: number;
  images: string;
  category: string;
  setPcs: number;
  setRatio: SetRatio;
  isPlusSize: boolean;
  collectionTags: string;
  isBestseller: boolean;
  isNewArrival: boolean;
  isHighMargin: boolean;
  videoUrl?: string;
  stock_m: number;
  stock_l: number;
  stock_xl: number;
  stock_xxl: number;
  stock_3xl?: number;
}
