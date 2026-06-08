"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { useSearchStore } from "@/lib/majestor/store";
import { PRODUCTS } from "@/lib/majestor/products";
import { formatPrice } from "@/lib/majestor/utils";

export default function SearchModal() {
  const { isOpen, query, setQuery, closeSearch } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  const results = query.trim().length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        p.collection.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={closeSearch} />
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-[#0d1117] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <Search className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, categories, tags…"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {results.map(p => (
                <Link key={p.id} href={`/majestor/products/${p.slug}`} onClick={closeSearch}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                    <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-[#00e5a0] transition-colors">{p.name}</p>
                    <p className="text-slate-500 text-xs">{p.collection}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#00e5a0] text-sm font-bold">{formatPrice(p.salePrice)}</p>
                    {!p.inStock && <p className="text-slate-600 text-[10px]">Sold out</p>}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00e5a0] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {query.trim().length > 1 && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-slate-400 text-sm">No results for <span className="text-white font-bold">"{query}"</span></p>
              <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {!query && (
            <div className="px-5 py-4">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["ESP32", "Arduino", "Sensor", "OLED", "Servo", "Relay"].map(t => (
                  <button key={t} onClick={() => setQuery(t)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-white/5 border border-white/8 rounded-lg hover:text-[#00e5a0] hover:border-[#00e5a0]/30 transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
