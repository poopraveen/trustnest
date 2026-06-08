"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/lib/majestor/types";
import { useCartStore } from "@/lib/majestor/store";
import { formatPrice } from "@/lib/majestor/utils";

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

export default function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);

  return (
    <div className="group relative bg-[#0d1117] border border-white/8 rounded-2xl overflow-hidden hover:border-[#00e5a0]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5a0]/5">
      {/* Image */}
      <div className="relative aspect-square bg-white/5 overflow-hidden">
        <Link href={`/majestor/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {!product.inStock && (
            <span className="px-2 py-0.5 rounded-md bg-black/70 text-slate-300 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm border border-white/10">
              Sold Out
            </span>
          )}
          {product.discount > 0 && product.inStock && (
            <span className="px-2 py-0.5 rounded-md bg-[#00e5a0] text-[#0a0c10] text-[10px] font-black uppercase tracking-wide">
              -{product.discount}% OFF
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        {showQuickAdd && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <Link href={`/majestor/products/${product.slug}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/90 text-[#0a0c10] rounded-lg text-xs font-bold hover:bg-white transition-colors backdrop-blur-sm">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <Link href={`/majestor/products/${product.slug}`}>
          <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-2 hover:text-[#00e5a0] transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#00e5a0] font-black text-base">{formatPrice(product.salePrice)}</span>
          {product.regularPrice > product.salePrice && (
            <span className="text-slate-500 text-xs line-through">{formatPrice(product.regularPrice)}</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] text-slate-500 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Add to cart */}
        <button
          disabled={!product.inStock}
          onClick={() => product.inStock && addItem(product)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            product.inStock
              ? "bg-[#00e5a0]/10 hover:bg-[#00e5a0] text-[#00e5a0] hover:text-[#0a0c10] border border-[#00e5a0]/30 hover:border-[#00e5a0]"
              : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock ? "Add to Cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}
