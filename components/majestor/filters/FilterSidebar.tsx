"use client";

import { FilterState } from "@/lib/majestor/types";
import { COLLECTIONS } from "@/lib/majestor/products";
import { formatPrice } from "@/lib/majestor/utils";
import { SlidersHorizontal } from "lucide-react";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  productCount: number;
}

export default function FilterSidebar({ filters, onChange, productCount }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-5 sticky top-20 space-y-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#00e5a0]" />
          <span className="text-white font-bold text-sm">Filters</span>
          <span className="ml-auto text-xs text-slate-500">{productCount} items</span>
        </div>

        {/* Availability */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Availability</p>
          <div className="space-y-2">
            {[
              { key: "inStock", label: "In Stock" },
              { key: "outOfStock", label: "Out of Stock" },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  filters[opt.key as keyof FilterState]
                    ? "bg-[#00e5a0] border-[#00e5a0]"
                    : "border-white/20 group-hover:border-[#00e5a0]/50"
                }`}
                  onClick={() => onChange({ [opt.key]: !filters[opt.key as keyof FilterState] })}>
                  {filters[opt.key as keyof FilterState] && (
                    <svg className="w-2.5 h-2.5 text-[#0a0c10]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Price Range</p>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>{formatPrice(filters.priceMin)}</span>
            <span className="flex-1 text-center">—</span>
            <span>{formatPrice(filters.priceMax)}</span>
          </div>
          <input
            type="range" min={0} max={10999}
            value={filters.priceMax}
            onChange={e => onChange({ priceMax: parseInt(e.target.value) })}
            className="w-full accent-[#00e5a0]"
          />
        </div>

        {/* Collections */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Category</p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {COLLECTIONS.map(col => {
              const active = filters.collections.includes(col.name);
              return (
                <label key={col.slug} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                      active ? "bg-[#00e5a0] border-[#00e5a0]" : "border-white/20 group-hover:border-[#00e5a0]/50"
                    }`}
                    onClick={() => {
                      const cols = active
                        ? filters.collections.filter(c => c !== col.name)
                        : [...filters.collections, col.name];
                      onChange({ collections: cols });
                    }}
                  >
                    {active && (
                      <svg className="w-2.5 h-2.5 text-[#0a0c10]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-tight">{col.name}</span>
                  <span className="ml-auto text-[10px] text-slate-600">{col.productCount}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Clear */}
        <button
          onClick={() => onChange({ inStock: false, outOfStock: false, priceMin: 0, priceMax: 10999, collections: [], tags: [] })}
          className="w-full py-2 text-xs text-slate-500 hover:text-[#00e5a0] border border-white/8 rounded-lg hover:border-[#00e5a0]/30 transition-all font-medium"
        >
          Clear all filters
        </button>
      </div>
    </aside>
  );
}
