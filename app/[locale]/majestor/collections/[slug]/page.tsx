"use client";

import { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { PRODUCTS, COLLECTIONS } from "@/lib/majestor/products";
import { FilterState, SortOption } from "@/lib/majestor/types";
import { applyFilters, DEFAULT_FILTERS } from "@/lib/majestor/utils";
import FilterSidebar from "@/components/majestor/filters/FilterSidebar";
import SortDropdown from "@/components/majestor/filters/SortDropdown";
import ProductGrid from "@/components/majestor/product/ProductGrid";

interface Props { params: { slug: string } }

export default function CollectionPage({ params }: Props) {
  const collection = COLLECTIONS.find(c => c.slug === params.slug);
  if (!collection) notFound();

  const collectionProducts = PRODUCTS.filter(p => p.collection === collection.name);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });

  const products = useMemo(() => applyFilters(collectionProducts, filters), [collectionProducts, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="text-4xl">{collection.icon}</span>
        <div>
          <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest mb-1">Collection</p>
          <h1 className="text-3xl font-black text-white mb-1">{collection.name}</h1>
          <p className="text-slate-400 text-sm">{collection.description}</p>
        </div>
      </div>

      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={p => setFilters(prev => ({ ...prev, ...p }))} productCount={products.length} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-bold">{products.length}</span> products
            </p>
            <SortDropdown value={filters.sort} onChange={v => setFilters(prev => ({ ...prev, sort: v }))} />
          </div>
          <ProductGrid products={products} emptyMessage={`No ${collection.name} match your filters.`} />
        </div>
      </div>
    </div>
  );
}
