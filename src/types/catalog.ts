export type HubLocation = 
  | 'RAJASTHAN_JAIPUR' 
  | 'GUJARAT_SURAT' 
  | 'UTTAR_PRADESH_LUCKNOW';

export type QualityGrade = 
  | 'GRADE_AAA' 
  | 'GRADE_AA' 
  | 'GRADE_A' 
  | 'GRADE_B';

export type B2BSetRatio = 
  | 'SET_4_PCS_M_L_XL_XXL' 
  | 'SET_6_PCS_S_TO_3XL';

export interface MicroCostingData {
  greyFabricCostMeter?: number;
  metersRequiredPerSet?: number;
  printingDyeingCost?: number;
  embroideryCraftCost?: number;
  stitchingInterlockLabor?: number;
  packagingQcOverhead?: number;
  totalExFactoryCost?: number;
}

export interface ProductCatalogItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  discount: number;
  images: string;
  category: string;
  supplierSku?: string | null;
  hubLocation?: string | null;
  industrialCluster?: string | null;
  fabricType?: string | null;
  fabricGrade?: string | null;
  yarnSpecGsm?: string | null;
  qualityGrade?: string | null;
  craftTypes?: string | null;
  patternCut?: string | null;
  exFactoryPrice?: number | null;
  b2bSetPrice?: number | null;
  perPiecePrice?: number | null;
  msrpRetailPrice?: number | null;
  retailerMarginPct?: number | null;
  microCostingJson?: string | null;
  setPcs: number;
  setRatio: string;
  isBestseller: boolean;
  isNewArrival: boolean;
  isHighMargin: boolean;
  createdAt: string;
  variants?: {
    id: string;
    size: string;
    color: string;
    stock: number;
  }[];
}

export interface ProductFilterParams {
  hub?: string;
  fabricType?: string;
  qualityGrade?: string[];
  clusters?: string[];
  craftTypes?: string[];
  patternCuts?: string[];
  minPrice?: number;
  maxPrice?: number;
  minMargin?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isHighMargin?: boolean;
  search?: string;
  category?: string;
  sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'margin_desc';
}
