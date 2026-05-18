"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import Image from "next/image";
import { Heart, Package, Tag, Eye, Share2, CheckCircle, ShoppingBag, ShoppingCart } from "lucide-react";
import { cn, formatPrice, getProductCategoryLabel, getConditionLabel, timeAgo } from "@/lib/utils";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
  onSave?: (id: string) => void;
  saved?: boolean;
  variant?: "grid" | "list";
}

export default function ProductCard({
  product,
  onSave,
  saved = false,
  variant = "grid",
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [sharing, setSharing] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] ?? null,
      stock: product.stock,
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(product.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({ title: product.title, url: `${window.location.origin}/products/${product.id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    }
  };

  const mainImage =
    !imgError && product.images[0]
      ? product.images[0]
      : "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80";

  const conditionColor =
    product.condition === "NEW"
      ? "bg-emerald-600/90 text-white"
      : product.condition === "REFURBISHED"
      ? "bg-amber-600/90 text-white"
      : "bg-slate-600/90 text-white";

  if (variant === "list") {
    return (
      <Link href={`/products/${product.id}`}>
        <div className="card flex gap-4 p-4 hover:border-primary-200 border border-transparent cursor-pointer">
          <div className="relative w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
            {product.featured && (
              <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-semibold px-2 py-0.5 rounded">
                Featured
              </span>
            )}
            <span className={cn("absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded", conditionColor)}>
              {getConditionLabel(product.condition)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-800 truncate">{product.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Tag className="w-3 h-3" />
                  {getProductCategoryLabel(product.category)}
                </p>
              </div>
              <p className="text-lg font-bold text-primary-800 flex-shrink-0">{formatPrice(product.price)}</p>
            </div>

            <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
              {product.brand && (
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  {product.brand}
                </span>
              )}
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {product.seller.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Seller
                  </span>
                )}
                <span className="text-xs text-slate-400">{timeAgo(product.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className={cn("p-1.5 rounded-lg transition-colors", isSaved ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-400 hover:bg-red-50")}
                >
                  <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-card-gradient" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-1.5">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm", conditionColor)}>
                {getConditionLabel(product.condition)}
              </span>
              {product.featured && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-orange/90 text-white backdrop-blur-sm">
                  Featured
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow",
                isSaved ? "bg-red-500 text-white" : "bg-white/80 text-slate-600 hover:bg-white"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-lg leading-tight">{formatPrice(product.price)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-primary-700 transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Tag className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{getProductCategoryLabel(product.category)}</span>
            </p>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 py-3 border-t border-slate-100 text-xs text-slate-600">
            {product.brand && (
              <>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  {product.brand}
                </span>
                <span className="text-slate-200">|</span>
              </>
            )}
            <span className={cn("font-medium", product.stock > 0 ? "text-emerald-600" : "text-red-500")}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {product.seller.isVerified && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
              {product.priceNegotiable && (
                <span className="badge-gray text-xs">Negotiable</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="w-3 h-3" />
              {product.views}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={cn(
              "mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors",
              product.stock > 0
                ? "bg-primary-700 hover:bg-primary-800 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </Link>
  );
}
