"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/majestor/products";
import ProductCard from "../product/ProductCard";

const FEATURED = PRODUCTS.filter(p => p.inStock).slice(0, 8);

export default function FeaturedProducts() {
  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest mb-1">Handpicked for You</p>
          <h2 className="text-2xl font-black text-white">Featured Products</h2>
        </div>
        <Link href="/majestor/shop"
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#00e5a0] transition-colors font-medium">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {FEATURED.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
