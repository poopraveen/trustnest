"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Zap, Tag, Star, Package, ArrowLeft, Cpu } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/majestor/products";
import { useCartStore } from "@/lib/majestor/store";
import { formatPrice } from "@/lib/majestor/utils";
import ProductCard from "@/components/majestor/product/ProductCard";

interface Props { params: { slug: string } }

export default function ProductDetailPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <Link href="/majestor" className="hover:text-[#00e5a0] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/majestor/collections/${product.collection.toLowerCase().replace(/ /g, "-").replace(/&/g, "").replace(/--/, "-")}`}
          className="hover:text-[#00e5a0] transition-colors">{product.collection}</Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/8">
            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
            {product.discount > 0 && product.inStock && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#00e5a0] text-[#0a0c10] text-xs font-black">
                -{product.discount}% OFF
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-lg border-2 border-white/50 px-6 py-2 rounded-xl">SOLD OUT</span>
              </div>
            )}
          </div>

          {/* AI Workshop CTA */}
          <Link href={`/majestor/workshop?components=${product.slug}`}
            className="flex items-center gap-3 p-4 bg-[#00e5a0]/5 border border-[#00e5a0]/20 rounded-xl hover:bg-[#00e5a0]/10 transition-colors group">
            <div className="w-9 h-9 bg-[#00e5a0]/15 rounded-lg flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-[#00e5a0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-[#00e5a0] transition-colors">AI Project Workshop</p>
              <p className="text-xs text-slate-400">What can you build with this component?</p>
            </div>
            <span className="text-[#00e5a0] text-sm font-bold">→</span>
          </Link>
        </div>

        {/* Info */}
        <div>
          <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-wider mb-2">{product.collection}</p>
          <h1 className="text-2xl font-black text-white mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating!) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                ))}
              </div>
              <span className="text-slate-400 text-sm">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-black text-[#00e5a0]">{formatPrice(product.salePrice)}</span>
            {product.regularPrice > product.salePrice && (
              <span className="text-slate-500 line-through text-lg">{formatPrice(product.regularPrice)}</span>
            )}
          </div>
          {product.regularPrice > product.salePrice && (
            <p className="text-sm text-emerald-400 font-semibold mb-4">
              You save {formatPrice(product.regularPrice - product.salePrice)} ({product.discount}% off)
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package className={`w-4 h-4 ${product.inStock ? "text-emerald-400" : "text-red-400"}`} />
            <span className={`text-sm font-semibold ${product.inStock ? "text-emerald-400" : "text-red-400"}`}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
            {product.sku && <span className="text-slate-600 text-xs ml-2">SKU: {product.sku}</span>}
          </div>

          {/* Qty + Add to cart */}
          {product.inStock && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-white/5 border border-white/15 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors font-bold text-lg">−</button>
                <span className="w-10 text-center text-white font-bold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors font-bold text-lg">+</button>
              </div>
              <button onClick={() => addItem(product, qty)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00e5a0]/10 hover:bg-[#00e5a0] text-[#00e5a0] hover:text-[#0a0c10] border border-[#00e5a0]/30 hover:border-[#00e5a0] font-black text-sm transition-all">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={() => { addItem(product, qty); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] font-black text-sm transition-colors">
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {product.tags.map(tag => (
              <span key={tag} className="text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-[#0d1117] border border-white/8 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Details</p>
              <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Shipping */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-[#00e5a0]">✓</span> Free shipping on TN orders ₹999+
            <span className="mx-2">·</span>
            <span className="text-[#00e5a0]">✓</span> Pan-India delivery
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-white mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
