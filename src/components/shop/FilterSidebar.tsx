'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { RotateCcw, MapPin, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { COLOR_MAP } from '@/lib/constants';

const HUBS = [
  { label: '🏛️ Jaipur & Rajasthan (Cotton & Block Print)', value: 'RAJASTHAN_JAIPUR' },
  { label: '🏭 Surat & Gujarat (Rayon & Georgette)', value: 'GUJARAT_SURAT' },
  { label: '🧵 Lucknow & UP (Chikankari & Handloom)', value: 'UTTAR_PRADESH_LUCKNOW' },
  { label: '👳 Punjab & North (Punjabi Suits & Phulkari)', value: 'PUNJAB_AMRITSAR' },
  { label: '🎨 Kolkata & Bengal (Handloom & Jamdani)', value: 'WEST_BENGAL_KOLKATA' },
];

const QUALITY_GRADES = [
  { label: '🏆 Grade AAA Export (0% Shrinkage)', value: 'GRADE_AAA' },
  { label: 'Grade AA Domestic Premium', value: 'GRADE_AA' },
  { label: 'Grade A Commercial Volume', value: 'GRADE_A' },
];

const PATTERN_CUTS = [
  { label: '👗 Indo-Western Co-ord Sets', value: 'CO_ORD_SET' },
  { label: '👚 Short Tunics & Tops', value: 'SHORT_TUNIC' },
  { label: '✂️ Straight Cut Sets', value: 'STRAIGHT_SET' },
  { label: '💃 Flared Anarkali Sets', value: 'ANARKALI_FLARED' },
  { label: '👑 Premium Pakistani Long Panel', value: 'PAKISTANI_LONG_PANEL' },
  { label: '✨ Sharara & Peplum Sets', value: 'SHARARA_SET' },
];

interface FilterSidebarProps {
  categories?: string[];
  sizes?: string[];
}

export default function FilterSidebar({}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [localHub, setLocalHub] = useState<string | null>(searchParams.get('hub'));
  const [localGrade, setLocalGrade] = useState<string | null>(searchParams.get('qualityGrade'));
  const [localCut, setLocalCut] = useState<string | null>(searchParams.get('patternCut'));
  const [localCategory, setLocalCategory] = useState<string | null>(searchParams.get('category'));
  const [localSize, setLocalSize] = useState<string | null>(searchParams.get('size'));
  const [localColor, setLocalColor] = useState<string | null>(searchParams.get('color'));

  useEffect(() => {
    setLocalHub(searchParams.get('hub'));
    setLocalGrade(searchParams.get('qualityGrade'));
    setLocalCut(searchParams.get('patternCut'));
    setLocalCategory(searchParams.get('category'));
    setLocalSize(searchParams.get('size'));
    setLocalColor(searchParams.get('color'));
  }, [searchParams]);

  // Debounced URL sync to prevent rapid network thrashing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      const updateParam = (key: string, val: string | null) => {
        if (val) params.set(key, val); else params.delete(key);
      };

      updateParam('hub', localHub);
      updateParam('qualityGrade', localGrade);
      updateParam('patternCut', localCut);
      updateParam('category', localCategory);
      updateParam('size', localSize);
      updateParam('color', localColor);

      const targetUrl = `${pathname}?${params.toString()}`;
      if (targetUrl !== `${pathname}?${searchParams.toString()}`) {
        startTransition(() => {
          router.replace(targetUrl, { scroll: false });
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [localHub, localGrade, localCut, localCategory, localSize, localColor, pathname, router, searchParams]);

  const updateQuery = (key: string, value: string | null) => {
    if (key === 'hub') setLocalHub(value);
    if (key === 'qualityGrade') setLocalGrade(value);
    if (key === 'patternCut') setLocalCut(value);
    if (key === 'category') setLocalCategory(value);
    if (key === 'size') setLocalSize(value);
    if (key === 'color') setLocalColor(value);
  };

  const clearAll = () => {
    setLocalHub(null);
    setLocalGrade(null);
    setLocalCut(null);
    setLocalCategory(null);
    setLocalSize(null);
    setLocalColor(null);
  };

  const hasFilters = localHub || localGrade || localCut || localCategory || localSize || localColor;

  return (
    <aside className={`w-full md:w-72 flex-shrink-0 space-y-7 bg-white border border-gold-primary/20 rounded-xl p-6 shadow-sm transition-opacity duration-300 ${isPending ? 'opacity-95' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold-primary/10 pb-4">
        <div>
          <span className="text-[9px] text-gold-dark font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-primary" /> B2B Sourcing Engine
          </span>
          <h3 className="font-serif text-lg font-bold text-charcoal">Faceted Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] font-bold text-gold-dark hover:text-emerald-primary uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* 📍 Level 1: Sourcing Hub Selection */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gold-dark" /> Sourcing Hub (Level 1)
        </h4>
        <div className="space-y-2">
          {HUBS.map((hub) => (
            <label key={hub.value} className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer group">
              <input
                type="radio"
                name="hub-group"
                checked={localHub === hub.value}
                onChange={() => updateQuery('hub', localHub === hub.value ? null : hub.value)}
                className="w-4 h-4 text-emerald-primary focus:ring-emerald-primary border-gold-primary/30"
              />
              <span className="group-hover:text-emerald-primary transition-colors text-[11px] font-medium leading-relaxed">
                {hub.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 🏆 Level 3: Quality Grade Pills */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" /> Quality Grade (Level 3)
        </h4>
        <div className="space-y-2">
          {QUALITY_GRADES.map((grade) => (
            <label key={grade.value} className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer group">
              <input
                type="checkbox"
                checked={localGrade === grade.value}
                onChange={(e) => updateQuery('qualityGrade', e.target.checked ? grade.value : null)}
                className="w-4 h-4 rounded border-gold-primary/30 text-emerald-primary focus:ring-emerald-primary"
              />
              <span className="group-hover:text-emerald-primary transition-colors text-[11px]">
                {grade.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ✂️ Level 4: Pattern Cut Variations */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-gold-dark" /> Design Cut (Level 4)
        </h4>
        <div className="space-y-2">
          {PATTERN_CUTS.map((cut) => (
            <label key={cut.value} className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer group">
              <input
                type="checkbox"
                checked={localCut === cut.value}
                onChange={(e) => updateQuery('patternCut', e.target.checked ? cut.value : null)}
                className="w-4 h-4 rounded border-gold-primary/30 text-emerald-primary focus:ring-emerald-primary"
              />
              <span className="group-hover:text-emerald-primary transition-colors text-[11px]">
                {cut.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 📦 B2B Set Ratio Info Box */}
      <div className="p-3 bg-amber-50/60 border border-gold-primary/30 rounded-lg text-charcoal space-y-1">
        <span className="text-[10px] font-bold text-emerald-primary uppercase tracking-wider block">
          📦 B2B Selling Unit
        </span>
        <p className="text-[11px] text-charcoal/80 leading-snug">
          All items sold as <strong>4-Piece Sets (M, L, XL, XXL)</strong> with 100% Prepaid Blind Dispatch.
        </p>
      </div>

      {/* Colorways */}
      <div className="space-y-3">
        <h4 className="font-serif text-xs font-bold text-emerald-primary uppercase tracking-wider">Colorways</h4>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(COLOR_MAP).map(([key, color]) => {
            const isActive = localColor === key;
            return (
              <button
                key={key}
                onClick={() => updateQuery('color', isActive ? null : key)}
                title={color.label}
                className={`w-7 h-7 rounded-full border-2 transition-all relative flex items-center justify-center ${
                  isActive ? 'border-emerald-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/5"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
