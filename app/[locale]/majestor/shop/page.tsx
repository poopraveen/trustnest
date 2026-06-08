"use client";

import { useState, useMemo } from "react";
import { PRODUCTS } from "@/lib/majestor/products";
import { FilterState, SortOption } from "@/lib/majestor/types";
import { applyFilters, DEFAULT_FILTERS } from "@/lib/majestor/utils";
import FilterSidebar from "@/components/majestor/filters/FilterSidebar";
import SortDropdown from "@/components/majestor/filters/SortDropdown";
import ProductGrid from "@/components/majestor/product/ProductGrid";
import { Search } from "lucide-react";

export default function ShopPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const products = useMemo(() => applyFilters(PRODUCTS, filters), [filters]);

  function updateFilters(partial: Partial<FilterState>) {
    setFilters(prev => ({ ...prev, ...partial }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">All Products</h1>
        <p className="text-slate-400 text-sm">{PRODUCTS.length}+ components for your next build</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={filters.search}
          onChange={e => updateFilters({ search: e.target.value })}
          placeholder="Search products…"
          className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-white/15 text-white rounded-xl text-sm outline-none focus:border-[#00e5a0]/50 placeholder-slate-500 transition-colors"
        />
      </div>

      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={updateFilters} productCount={products.length} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-bold">{products.length}</span> products
            </p>
            <SortDropdown value={filters.sort} onChange={v => updateFilters({ sort: v })} />
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
