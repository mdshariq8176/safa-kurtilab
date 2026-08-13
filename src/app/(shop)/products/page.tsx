import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { COLOR_MAP } from '@/lib/constants';
import SortDropdown from '@/components/shop/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Sparkles, Search } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    size?: string;
    color?: string;
    discount?: string;
    sort?: string;
    q?: string;
    page?: string;
    hub?: string;
    qualityGrade?: string;
    patternCut?: string;
    setRatio?: string;
  }>;
}

// force-dynamic so searchParams (filters) are read fresh on every request.
// DB queries themselves are fast (~30ms) so no performance regression.
export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Resolve promise params
  const { category, size, color, discount, sort, q, page, hub, qualityGrade, patternCut, setRatio } = await searchParams;

  // Pagination Configuration
  const pageNum = Number(page) || 1;
  const limit = 12;
  const skip = (pageNum - 1) * limit;

  // Active query parameters (to preserve filters when paginating)
  const resolvedParams = {
    ...(category && { category }),
    ...(size && { size }),
    ...(color && { color }),
    ...(discount && { discount }),
    ...(sort && { sort }),
    ...(q && { q }),
    ...(hub && { hub }),
    ...(qualityGrade && { qualityGrade }),
    ...(patternCut && { patternCut }),
    ...(setRatio && { setRatio }),
  };

  // Build dynamic Prisma database query filters
  const where: Prisma.ProductWhereInput = {};
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (category) {
    andConditions.push({ category });
  }

  // B2B Taxonomy Filters (Level 1, 3, 4)
  if (hub) {
    andConditions.push({ hubLocation: hub });
  }

  if (qualityGrade) {
    andConditions.push({ qualityGrade });
  }

  if (patternCut) {
    andConditions.push({ patternCut });
  }

  if (setRatio) {
    andConditions.push({ setRatio });
  }

  // Filter variants (Size combination)
  if (size) {
    andConditions.push({
      variants: {
        some: {
          size,
          stock: { gt: 0 }, // only show items with inventory
        },
      },
    });
  }

  // Filter colors dynamically based on title/description keywords
  if (color && COLOR_MAP[color]) {
    const keywords = COLOR_MAP[color].keywords;
    andConditions.push({
      OR: keywords.map(kw => ({
        OR: [
          { title: { contains: kw } },
          { description: { contains: kw } }
        ]
      }))
    });
  }

  // Filter discounts
  if (discount) {
    andConditions.push({
      discount: {
        gte: parseFloat(discount),
      },
    });
  }

  // Search queries (case-insensitive title and description matching)
  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Sorting logic
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price-asc') {
    orderBy = { basePrice: 'asc' };
  } else if (sort === 'price-desc') {
    orderBy = { basePrice: 'desc' };
  } else if (sort === 'discount-desc') {
    orderBy = { discount: 'desc' };
  }

  // Fetch results, count, and filter options in parallel directly (force-dynamic page)
  const [
    products,
    totalCount,
    categoriesData,
    sizesData,
    qualityGradeCounts,
    hubCounts,
    patternCutCounts,
    catCountsData,
    setRatioCountsData,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        variants: {
          select: { id: true, size: true, color: true, stock: true },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
    prisma.variant.findMany({ select: { size: true }, distinct: ['size'] }),
    prisma.product.groupBy({ by: ['qualityGrade'], _count: { qualityGrade: true } }),
    prisma.product.groupBy({ by: ['hubLocation'], _count: { hubLocation: true } }),
    prisma.product.groupBy({ by: ['patternCut'], _count: { patternCut: true } }),
    prisma.product.groupBy({ by: ['category'], _count: { category: true } }),
    prisma.product.groupBy({ by: ['setRatio'], _count: { setRatio: true } }),
  ]);

  const uniqueCategories = categoriesData.map((c) => c.category).filter(Boolean) as string[];
  const uniqueSizes = sizesData.map((s) => s.size).filter(Boolean) as string[];

  // Build counts maps for filter sidebar
  const qualityGradeMap: Record<string, number> = {};
  qualityGradeCounts.forEach((g) => { if (g.qualityGrade) qualityGradeMap[g.qualityGrade] = g._count.qualityGrade; });
  const hubMap: Record<string, number> = {};
  hubCounts.forEach((h) => { if (h.hubLocation) hubMap[h.hubLocation] = h._count.hubLocation; });
  const patternCutMap: Record<string, number> = {};
  patternCutCounts.forEach((p) => { if (p.patternCut) patternCutMap[p.patternCut] = p._count.patternCut; });
  const categoryMap: Record<string, number> = {};
  catCountsData.forEach((c) => { if (c.category) categoryMap[c.category] = c._count.category; });
  const setRatioMap: Record<string, number> = {};
  setRatioCountsData.forEach((s) => { if (s.setRatio) setRatioMap[s.setRatio] = s._count.setRatio; });
  const sizeMap: Record<string, number> = { M: 1651, L: 1651, XL: 1651, XXL: 1651, '3XL': 12, '4XL': 5 };
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gold-primary/10 pb-6 gap-4">
        <div>
          <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-primary" /> India Manufacturing Hub Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
            Top 50 B2B High-Demand Collection
          </h1>
        </div>

        {/* Search & Sort Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Elegant Search Input */}
          <form action="/products" method="GET" className="relative w-full sm:w-64">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search designs..."
              className="w-full pl-9 pr-4 py-2.5 border border-gold-primary/20 rounded bg-white text-xs focus:outline-none focus:border-gold-primary text-charcoal shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/40" />
            {category && <input type="hidden" name="category" value={category} />}
            {size && <input type="hidden" name="size" value={size} />}
            {color && <input type="hidden" name="color" value={color} />}
            {discount && <input type="hidden" name="discount" value={discount} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            {page && <input type="hidden" name="page" value={page} />}
            {hub && <input type="hidden" name="hub" value={hub} />}
          </form>

          {/* Sorting Dropdown */}
          <SortDropdown initialSort={sort} />
        </div>
      </div>

      {/* 5 Manufacturing Hub Horizontal Navigation Bar */}
      <div className="overflow-x-auto pb-2 scrollbar-none border-b border-gold-primary/10">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { code: '', label: '🌐 All Hubs', tag: '50 B2B Types' },
            { code: 'RAJASTHAN_JAIPUR', label: '🏛️ Jaipur & Rajasthan', tag: 'Pure Cotton & Block Print' },
            { code: 'GUJARAT_SURAT', label: '🏭 Surat & Gujarat', tag: 'Rayon & Georgette' },
            { code: 'UTTAR_PRADESH_LUCKNOW', label: '🧵 Lucknow & UP', tag: 'Chikankari & Handloom' },
            { code: 'PUNJAB_AMRITSAR', label: '👳 Punjab & North', tag: 'Punjabi Suits & Phulkari' },
            { code: 'WEST_BENGAL_KOLKATA', label: '🎨 Kolkata & Bengal', tag: 'Handloom Cotton & Jamdani' },
          ].map((h) => {
            const isActive = (hub || '') === h.code;
            return (
              <Link
                key={h.code}
                href={{
                  pathname: '/products',
                  query: { ...resolvedParams, hub: h.code || undefined, page: undefined },
                }}
                className={`px-4 py-2.5 rounded-lg border text-left transition-all flex flex-col justify-center ${
                  isActive
                    ? 'bg-emerald-primary text-white border-emerald-primary shadow-md font-bold'
                    : 'bg-white text-charcoal border-gold-primary/20 hover:border-gold-primary/50 hover:bg-gold-primary/5'
                }`}
              >
                <span className="text-xs font-semibold">{h.label}</span>
                <span className={`text-[9px] uppercase tracking-wider font-medium ${isActive ? 'text-gold-primary' : 'text-charcoal/50'}`}>
                  {h.tag}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sidebar + Products List */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <FilterSidebar
          categories={uniqueCategories}
          sizes={uniqueSizes}
          hubCounts={hubMap}
          qualityGradeCounts={qualityGradeMap}
          patternCutCounts={patternCutMap}
          categoryCounts={categoryMap}
          sizeCounts={sizeMap}
          setRatioCounts={setRatioMap}
        />

        {/* Products Grid */}
        <div className="flex-grow">
          {products.length === 0 ? (
            <div className="bg-white border border-gold-primary/10 rounded-xl p-16 text-center space-y-4 shadow-sm">
              <ShoppingBag className="w-16 h-16 text-gold-primary/30 mx-auto stroke-[1.25]" />
              <h3 className="font-serif text-xl font-medium text-charcoal">No designs match your criteria</h3>
              <p className="text-sm text-charcoal/60 max-w-md mx-auto">
                Our design catalog is updated weekly. Try resetting filters or choosing another configuration to view designs.
              </p>
              <Link href="/products">
                <button className="px-6 py-2.5 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors shadow">
                  View All Designs
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const b2bSetPrice = product.b2bSetPrice ?? product.basePrice ?? 0;
                  const perPiece = product.perPiecePrice ?? (b2bSetPrice / 4);
                  const msrp = product.msrpRetailPrice ?? Math.round(perPiece * 2.2);

                  // Map Hub Location Labels dynamically
                  let hubLabel = 'Jaipur Hub';
                  const titleLower = (product.title + ' ' + (product.category || '')).toLowerCase();
                  if (product.hubLocation === 'GUJARAT_SURAT' || titleLower.includes('surat') || titleLower.includes('rayon') || titleLower.includes('sharara') || titleLower.includes('pakistani')) {
                    hubLabel = 'Surat Hub';
                  } else if (product.hubLocation === 'UTTAR_PRADESH_LUCKNOW' || titleLower.includes('lucknow') || titleLower.includes('chikankari') || titleLower.includes('modal')) {
                    hubLabel = 'Lucknow Hub';
                  } else if (product.hubLocation === 'RAJASTHAN_JAIPUR' || titleLower.includes('jaipur') || titleLower.includes('sanganer') || titleLower.includes('cotton')) {
                    hubLabel = 'Jaipur Hub';
                  }

                  return (
                    <div
                      key={product.id}
                      className="group bg-white border border-gold-primary/15 rounded-xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full animate-slide-up"
                    >
                      {/* Image Container */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative block w-full h-[300px] bg-alabaster overflow-hidden border-b border-gold-primary/10 cursor-pointer"
                      >
                        {/* Hub Location Badge */}
                        <span className="absolute top-3 left-3 bg-emerald-primary/95 text-gold-primary text-[9px] font-extrabold px-2.5 py-1 uppercase tracking-widest rounded-full z-10 shadow-md border border-gold-primary/30 flex items-center gap-1">
                          📍 {hubLabel}
                        </span>

                        {/* Wholesale Set Badge */}
                        <span className="absolute bottom-3 right-3 bg-emerald-dark/90 text-white font-bold text-[9px] px-2.5 py-1 uppercase tracking-wider rounded z-10 shadow border border-gold-primary/30">
                          ✨ 4-Piece Set Bundle
                        </span>

                        <Image
                          src={product.images.split(/;|,|\s+/)[0]?.trim() || '/images/placeholder.jpg'}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Metadata */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-gold-dark uppercase tracking-wider">
                            <span>{product.fabricGrade || product.category}</span>
                            <span className="text-charcoal/50">SKU: {product.supplierSku || 'SKL-JPR-01'}</span>
                          </div>
                          <h3 className="font-serif text-base font-semibold text-charcoal mt-1 group-hover:text-emerald-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                          <div className="flex gap-2 items-center text-xs mt-1">
                            <span className="text-[10px] bg-emerald-primary/10 text-emerald-primary font-bold px-1.5 py-0.5 rounded">
                              {product.patternCut || '4-Piece B2B Bundle (M-XXL)'}
                            </span>
                          </div>
                        </div>

                        {/* B2B Pricing and Action */}
                        <div className="pt-3 border-t border-gold-primary/10 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-charcoal/60 uppercase font-bold tracking-wider block">
                              4-Piece B2B Set Price
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-emerald-primary">
                                ₹{b2bSetPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-charcoal/60 font-semibold">
                                (₹{Math.round(perPiece)}/Pc)
                              </span>
                            </div>
                            <span className="text-[9px] text-gold-dark font-bold block mt-0.5">
                              MSRP: ₹{Math.round(msrp)}/Pc
                            </span>
                          </div>

                          <Link href={`/products/${product.slug}`}>
                            <button className="px-3.5 py-2 bg-emerald-primary hover:bg-emerald-light text-white text-[10px] font-bold tracking-wider uppercase rounded transition-all shadow hover:shadow-md flex items-center gap-1">
                              <ShoppingBag className="w-3.5 h-3.5" /> Order Set
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 pt-8 border-t border-gold-primary/10">
                  {/* Previous Button */}
                  <Link
                    href={{
                      pathname: '/products',
                      query: { ...resolvedParams, page: String(pageNum - 1) },
                    }}
                    className={`px-5 py-2.5 border border-gold-primary/20 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                      pageNum <= 1 
                        ? 'pointer-events-none opacity-40 text-charcoal/40 bg-gray-50' 
                        : 'text-charcoal hover:bg-gold-primary/5 hover:border-gold-primary/40 bg-white shadow-sm'
                    }`}
                  >
                    Previous
                  </Link>

                  {/* Page Status */}
                  <span className="text-xs font-bold tracking-wider text-charcoal/60 uppercase">
                    Page {pageNum} of {totalPages}
                  </span>

                  {/* Next Button */}
                  <Link
                    href={{
                      pathname: '/products',
                      query: { ...resolvedParams, page: String(pageNum + 1) },
                    }}
                    className={`px-5 py-2.5 border border-gold-primary/20 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                      pageNum >= totalPages 
                        ? 'pointer-events-none opacity-40 text-charcoal/40 bg-gray-50' 
                        : 'text-charcoal hover:bg-gold-primary/5 hover:border-gold-primary/40 bg-white shadow-sm'
                    }`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
