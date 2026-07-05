'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  initialSort?: string;
}

export default function SortDropdown({ initialSort }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-xs text-charcoal/60 flex items-center gap-1 font-semibold">
        <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
      </span>
      <select
        defaultValue={initialSort || 'newest'}
        className="text-xs font-semibold bg-white border border-gold-primary/20 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-primary text-charcoal cursor-pointer"
        onChange={(e) => {
          const val = e.target.value;
          const params = new URLSearchParams(searchParams.toString());
          if (val === 'newest') {
            params.delete('sort');
          } else {
            params.set('sort', val);
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="discount-desc">Highest Discount</option>
      </select>
    </div>
  );
}
