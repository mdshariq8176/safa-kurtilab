'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { RotateCcw } from 'lucide-react';

const CATEGORIES = ['Anarkali', 'Straight Cut', 'A-Line'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Emerald', value: '#044a34' },
  { name: 'Mustard Gold', value: '#d4af37' },
  { name: 'Crimson Velvet', value: '#8b0000' },
];
const DISCOUNTS = [
  { label: 'Festive Special (Min. 10%)', value: '10' },
  { label: 'Elite Savings (Min. 15%)', value: '15' },
];

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to update query parameters
  const updateQuery = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeCategory = searchParams.get('category');
  const activeSize = searchParams.get('size');
  const activeColor = searchParams.get('color');
  const activeDiscount = searchParams.get('discount');

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = activeCategory || activeSize || activeColor || activeDiscount;

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-8 bg-white border border-gold-primary/10 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold-primary/10 pb-4">
        <h3 className="font-serif text-lg font-bold text-charcoal">Refine Selection</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] font-bold text-gold-dark hover:text-emerald-primary uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider">Silhouettes</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer group">
              <input
                type="checkbox"
                checked={activeCategory === cat}
                onChange={(e) => updateQuery('category', e.target.checked ? cat : null)}
                className="w-4 h-4 rounded border-gold-primary/30 text-emerald-primary focus:ring-emerald-primary"
              />
              <span className="group-hover:text-emerald-primary transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizing Filter */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = activeSize === size;
            return (
              <button
                key={size}
                onClick={() => updateQuery('size', isActive ? null : size)}
                className={`w-10 h-10 rounded text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-emerald-primary text-white border-emerald-primary shadow'
                    : 'bg-alabaster text-charcoal border-gold-primary/10 hover:border-gold-primary/50'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider">Colorways</h4>
        <div className="flex gap-3">
          {COLORS.map((color) => {
            const isActive = activeColor === color.name;
            return (
              <button
                key={color.name}
                onClick={() => updateQuery('color', isActive ? null : color.name)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center ${
                  isActive ? 'border-emerald-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border border-black/5"
                  style={{ backgroundColor: color.value }}
                />
                {isActive && (
                  <span className="absolute w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discounts Filter */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider">Offers</h4>
        <div className="space-y-2">
          {DISCOUNTS.map((discount) => (
            <label key={discount.value} className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer group">
              <input
                type="radio"
                name="discount-group"
                checked={activeDiscount === discount.value}
                onChange={() => updateQuery('discount', discount.value)}
                className="w-4 h-4 text-emerald-primary focus:ring-emerald-primary border-gold-primary/30"
              />
              <span className="group-hover:text-emerald-primary transition-colors">{discount.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
