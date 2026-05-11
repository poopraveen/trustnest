"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import Image from "next/image";
import {
  Heart, MapPin, BedDouble, Bath, Square, CheckCircle,
  Tag, TrendingUp, Eye, Share2,
} from "lucide-react";
import { cn, formatPrice, getPropertyTypeLabel, timeAgo } from "@/lib/utils";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  onSave?: (id: string) => void;
  saved?: boolean;
  variant?: "grid" | "list";
}

export default function PropertyCard({
  property,
  onSave,
  saved = false,
  variant = "grid",
}: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [sharing, setSharing] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(property.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        url: `${window.location.origin}/properties/${property.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/properties/${property.id}`
      );
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    }
  };

  const mainImage =
    !imgError && property.images[0]
      ? property.images[0]
      : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  if (variant === "list") {
    return (
      <Link href={`/properties/${property.id}`}>
        <div className="card flex gap-4 p-4 hover:border-primary-200 border border-transparent cursor-pointer">
          <div className="relative w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
            {property.featured && (
              <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-semibold px-2 py-0.5 rounded">
                Featured
              </span>
            )}
            <span className={cn(
              "absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded",
              property.listingType === "BUY" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
            )}>
              {property.listingType === "BUY" ? "For Sale" : "For Rent"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-800 truncate">{property.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {property.locality}, {property.city}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-primary-800">
                  {formatPrice(property.price)}
                  {property.listingType === "RENT" && <span className="text-xs font-normal text-slate-500">/mo</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-slate-400" />
                {property.bhk} BHK
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-slate-400" />
                {property.bathrooms} Bath
              </span>
              <span className="flex items-center gap-1">
                <Square className="w-4 h-4 text-slate-400" />
                {property.area} {property.areaUnit}
              </span>
              <span className="badge-gray">{getPropertyTypeLabel(property.propertyType)}</span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {property.verified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                <span className="text-xs text-slate-400">{timeAgo(property.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isSaved
                      ? "text-red-500 bg-red-50"
                      : "text-slate-400 hover:text-red-400 hover:bg-red-50"
                  )}
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
    <Link href={`/properties/${property.id}`}>
      <div className="card overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-card-gradient" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-1.5">
              <span className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
                property.listingType === "BUY"
                  ? "bg-blue-600/90 text-white"
                  : "bg-emerald-600/90 text-white"
              )}>
                {property.listingType === "BUY" ? "For Sale" : "For Rent"}
              </span>
              {property.featured && (
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

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-lg leading-tight">
              {formatPrice(property.price)}
              {property.listingType === "RENT" && (
                <span className="text-sm font-normal opacity-80">/mo</span>
              )}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-primary-700 transition-colors">
                {property.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{property.locality}, {property.city}</span>
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 py-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              {property.bhk} BHK
            </span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              {property.bathrooms} Bath
            </span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5 text-slate-400" />
              {property.area} {property.areaUnit}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="badge-gray text-xs">{getPropertyTypeLabel(property.propertyType)}</span>
              {property.verified && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="w-3 h-3" />
              {property.views}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
