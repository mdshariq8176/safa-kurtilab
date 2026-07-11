// Safa Kurtilab Storefront Home Page
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Star, ShoppingBag, Sparkles, Heart } from 'lucide-react';

export const revalidate = 60; // ISR: serve cached page instantly, revalidate featured products every 60s

export default async function HomePage() {
  // Fetch trending products directly from the database
  const products = await prisma.product.findMany({
    take: 3,
    include: {
      variants: true,
    },
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Elegant Animated Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-dark via-emerald-primary to-charcoal text-white py-20 px-4 sm:px-6 lg:px-8">
        {/* Abstract Golden Blur Spheres */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-emerald-light/20 rounded-full blur-[120px] animate-pulse" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          {/* Text content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-primary/10 border border-gold-primary/20 rounded-full text-gold-primary text-xs font-semibold tracking-wider uppercase animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Royal Festive Collection 2026
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight sm:leading-none tracking-wide">
              Intricate Weaves, <br />
              <span className="text-[#f3d065] italic">Premium Cottonwear</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-sans">
              Discover the art of traditional craftsmanship redefined for the modern connoisseur. Safa Kurtilab brings you pure cotton kurtis, premium pant sets, and hand-printed ensembles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/products">
                <button className="w-full sm:w-auto px-8 py-4 bg-[#d4af37] hover:bg-[#f3d065] text-charcoal font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded shadow-lg hover:shadow-gold-primary/20 flex items-center justify-center gap-2 group">
                  Explore Catalog
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/products?category=Plazo Suit Set">
                <button className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-gold-primary hover:text-gold-primary text-white font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded">
                  View Plazo Suits
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Collage */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 h-[400px] sm:w-80 sm:h-[450px] rounded-2xl overflow-hidden border-2 border-gold-primary/20 shadow-2xl bg-emerald-primary/40 group">
              <Image
                src="/images/IMG-20260706-WA0000.jpg"
                alt="Maroon Paisley Kurti Set"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-xs text-gold-primary uppercase tracking-widest font-semibold">Trending Now</span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">Maroon Paisley Kurti Set</h3>
                <Link href="/products?q=Maroon" className="text-xs text-white/60 hover:text-white underline mt-2 flex items-center gap-1">
                  View Collection &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-gold-dark font-semibold text-xs tracking-widest uppercase">Meticulous Curation</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">Browse Collections</h2>
          <div className="w-12 h-0.5 bg-gold-primary mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kurti Pant Set */}
          <Link href="/products?category=Kurti Pant Set" className="group block relative h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
            <Image
              src="/images/IMG-20260706-WA0003.jpg"
              alt="Kurti Pant Sets"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide">Kurti Pant Sets</h3>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-widest">Premium Cotton 60x60</p>
            </div>
          </Link>

          {/* Plazo Suit Set */}
          <Link href="/products?category=Plazo Suit Set" className="group block relative h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
            <Image
              src="/images/IMG-20260706-WA0001.jpg"
              alt="Plazo Suit Sets"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide">Plazo Suit Sets</h3>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-widest">Traditional Festive Ensembles</p>
            </div>
          </Link>

          {/* All designs */}
          <Link href="/products" className="group block relative h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
            <Image
              src="/images/IMG-20260706-WA0002.jpg"
              alt="Explore All"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide">Explore All</h3>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-widest">Browse Full Luxury Catalog</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Featured Designs Section */}
      <section className="bg-white border-y border-gold-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gold-primary/10 pb-4 gap-4">
            <div className="space-y-1">
              <span className="text-gold-dark font-semibold text-xs tracking-widest uppercase">The Trendsetters</span>
              <h2 className="font-serif text-3xl font-bold text-charcoal">Featured Trousseau Pieces</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-emerald-primary hover:text-emerald-light uppercase tracking-wider flex items-center gap-1 group">
              Browse Entire Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const discountAmt = product.basePrice * (product.discount / 100);
              const salePrice = product.basePrice - discountAmt;
              const hasDiscount = product.discount > 0;

              return (
                <div key={product.id} className="group relative bg-alabaster rounded-xl border border-gold-primary/10 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                  {/* Heart badge & image container */}
                  <div className="relative w-full h-[320px] bg-white border-b border-gold-primary/5 flex items-center justify-center overflow-hidden">
                    {hasDiscount && (
                      <span className="absolute top-4 left-4 bg-emerald-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded z-10">
                        {product.discount}% Off
                      </span>
                    )}
                    <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors text-charcoal/40 hover:text-red-500 shadow-sm z-10">
                      <Heart className="w-4.5 h-4.5" />
                    </button>
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.images}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-500 cursor-pointer"
                      />
                    </Link>
                  </div>

                  {/* Text Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest">{product.category}</span>
                      <h3 className="font-serif text-base font-semibold text-charcoal mt-1 group-hover:text-emerald-primary transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex gap-2 items-center text-xs mt-1">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-charcoal/40 font-medium">(4.9)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-gold-primary/5">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-xs text-charcoal/40 line-through">₹{product.basePrice}</span>
                        )}
                        <span className="text-base font-bold text-emerald-primary">
                          ₹{salePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        <button className="px-4 py-2 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" /> Select Option
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Luxury Brand Statement */}
      <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Sparkles className="w-8 h-8 text-gold-primary mx-auto stroke-[1.25]" />
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold italic text-charcoal">
          &ldquo;Meticulous tailoring, zero compromises. Each garment at Safa Kurtilab is crafted over weeks, combining heirloom hand-weaving techniques with contemporary patterns.&rdquo;
        </h2>
        <div className="w-16 h-0.5 bg-gold-primary mx-auto" />
        <p className="text-xs font-bold uppercase tracking-widest text-gold-dark">
          - Safa Design Studio, Shahpur Jat, New Delhi
        </p>
      </section>
    </div>
  );
}
