import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { COLOR_MAP } from '@/lib/constants';
import SortDropdown from '@/components/shop/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Sparkles, Search } from 'lucide-react';
import { unstable_cache } from 'next/cache';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    size?: string;
    color?: string;
    discount?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

export const revalidate = 30; // ISR: serve cached catalog page instantly, revalidate in background every 30s

// Cache filter categories and sizes for 1 hour to prevent redundant DB hits on every request
const getCachedFilterOptions = unstable_cache(
  async () => {
    const [categoriesData, sizesData] = await Promise.all([
      prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.variant.findMany({
        select: { size: true },
        distinct: ['size'],
      }),
    ]);
    return {
      categories: categoriesData.map((c) => c.category).filter(Boolean),
      sizes: sizesData.map((s) => s.size).filter(Boolean),
    };
  },
  ['catalog-filter-options'],
  { revalidate: 3600 }
);

// Cache total count of unfiltered products for 5 minutes
const getCachedTotalCount = unstable_cache(
  async () => {
    return prisma.product.count();
  },
  ['catalog-total-count'],
  { revalidate: 300 }
);

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Resolve promise params
  const { category, size, color, discount, sort, q, page } = await searchParams;

  // Pagination Configuration
  const pageNum = Number(page) || 1;
  const limit = 24;
  const skip = (pageNum - 1) * limit;

  // Active query parameters (to preserve filters when paginating)
  const resolvedParams = {
    ...(category && { category }),
    ...(size && { size }),
    ...(color && { color }),
    ...(discount && { discount }),
    ...(sort && { sort }),
    ...(q && { q }),
  };

  // Build dynamic Prisma database query filters
  const where: Prisma.ProductWhereInput = {};
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (category) {
    andConditions.push({ category });
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

  const isFiltered = category || size || color || discount || q;

  // Fetch results and cached filter options in parallel
  const [products, totalCount, filterOptions] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        variants: true,
      },
    }),
    isFiltered ? prisma.product.count({ where }) : getCachedTotalCount(),
    getCachedFilterOptions(),
  ]);

  const uniqueCategories = filterOptions.categories;
  const uniqueSizes = filterOptions.sizes;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gold-primary/10 pb-6 gap-4">
        <div>
          <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-primary" /> Curated Luxury Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
            Safa Couture Collection
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
          </form>

          {/* Sorting Dropdown (Client Component for interactivity) */}
          <SortDropdown initialSort={sort} />
        </div>
      </div>

      {/* Main Grid: Sidebar + Products List */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <FilterSidebar categories={uniqueCategories} sizes={uniqueSizes} />

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
                  const discountAmt = product.basePrice * (product.discount / 100);
                  const salePrice = product.basePrice - discountAmt;
                  const hasDiscount = product.discount > 0;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white border border-gold-primary/10 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full animate-slide-up"
                    >
                      {/* Image Container */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative block w-full h-[320px] bg-alabaster overflow-hidden border-b border-gold-primary/5 cursor-pointer"
                      >
                        {hasDiscount && (
                          <span className="absolute top-4 left-4 bg-emerald-primary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded z-10">
                            {product.discount}% Off
                          </span>
                        )}
                        <Image
                          src={product.images}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Metadata */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest">
                            {product.category}
                          </span>
                          <h3 className="font-serif text-base font-semibold text-charcoal mt-1 group-hover:text-emerald-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                          <div className="flex gap-2 items-center text-xs mt-1">
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-charcoal/40 font-medium">(4.9)</span>
                          </div>
                        </div>

                        {/* Pricing and Action */}
                        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gold-primary/5">
                          <div className="flex flex-col">
                            {hasDiscount && (
                              <span className="text-xs text-charcoal/40 line-through">₹{product.basePrice}</span>
                            )}
                            <span className="text-sm font-bold text-emerald-primary">
                              ₹{salePrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <Link href={`/products/${product.slug}`}>
                            <button className="px-4 py-2 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5" /> Details
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
