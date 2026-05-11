"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "INDEPENDENT_HOUSE", label: "Independent House" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PG", label: "PG/Co-living" },
  { value: "STUDIO", label: "Studio" },
];

const BHK_OPTIONS = [1, 2, 3, 4, 5];

const FURNISHING_OPTIONS = [
  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
  { value: "SEMI_FURNISHED", label: "Semi Furnished" },
  { value: "UNFURNISHED", label: "Unfurnished" },
];

const PRICE_RANGES_BUY = [
  { label: "Under ₹25L", min: 0, max: 2500000 },
  { label: "₹25L–50L", min: 2500000, max: 5000000 },
  { label: "₹50L–1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr–2Cr", min: 10000000, max: 20000000 },
  { label: "₹2Cr–5Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5Cr", min: 50000000, max: 999999999 },
];

const PRICE_RANGES_RENT = [
  { label: "Under ₹10K", min: 0, max: 10000 },
  { label: "₹10K–25K", min: 10000, max: 25000 },
  { label: "₹25K–50K", min: 25000, max: 50000 },
  { label: "₹50K–1L", min: 50000, max: 100000 },
  { label: "Above ₹1L", min: 100000, max: 999999999 },
];

interface FilterSection {
  title: string;
  key: string;
  open: boolean;
}

export default function PropertyFilters({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sections, setSections] = useState<FilterSection[]>([
    { title: "Listing Type", key: "listingType", open: true },
    { title: "Property Type", key: "propertyType", open: true },
    { title: "BHK", key: "bhk", open: true },
    { title: "Budget", key: "price", open: true },
    { title: "Furnishing", key: "furnishing", open: false },
    { title: "More Filters", key: "more", open: false },
  ]);

  const listingType = searchParams.get("listingType") ?? "BUY";
  const selectedTypes = searchParams.getAll("propertyType");
  const selectedBHK = searchParams.getAll("bhk").map(Number);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const selectedFurnishing = searchParams.getAll("furnishing");
  const verifiedOnly = searchParams.get("verified") === "true";

  const priceRanges = listingType === "RENT" ? PRICE_RANGES_RENT : PRICE_RANGES_BUY;

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`/properties?${params.toString()}`);
  }

  function toggleArrayParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll(key);
    params.delete(key);
    if (existing.includes(value)) {
      existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...existing, value].forEach((v) => params.append(key, v));
    }
    params.set("page", "1");
    router.push(`/properties?${params.toString()}`);
  }

  function setPriceRange(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString());
    const curMin = params.get("minPrice");
    const curMax = params.get("maxPrice");
    if (curMin === String(min) && curMax === String(max)) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.set("minPrice", String(min));
      params.set("maxPrice", String(max));
    }
    params.set("page", "1");
    router.push(`/properties?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams();
    if (searchParams.get("city")) params.set("city", searchParams.get("city")!);
    router.push(`/properties?${params.toString()}`);
  }

  function toggleSection(key: string) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, open: !s.open } : s))
    );
  }

  const activeCount = [
    selectedTypes.length,
    selectedBHK.length,
    minPrice ? 1 : 0,
    selectedFurnishing.length,
    verifiedOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={cn("bg-white rounded-xl shadow-card p-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-700" />
          <h3 className="font-semibold text-slate-800">Filters</h3>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {/* Listing Type */}
        <FilterSectionWrapper
          title="Listing Type"
          sectionKey="listingType"
          sections={sections}
          onToggle={toggleSection}
        >
          <div className="flex gap-2">
            {["BUY", "RENT"].map((type) => (
              <button
                key={type}
                onClick={() => updateParams("listingType", type)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                  listingType === type
                    ? "bg-primary-800 text-white border-primary-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                )}
              >
                {type === "BUY" ? "Buy" : "Rent"}
              </button>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* Property Type */}
        <FilterSectionWrapper
          title="Property Type"
          sectionKey="propertyType"
          sections={sections}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleArrayParam("propertyType", type.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  selectedTypes.includes(type.value)
                    ? "bg-primary-100 text-primary-800 border-primary-300"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* BHK */}
        <FilterSectionWrapper
          title="BHK"
          sectionKey="bhk"
          sections={sections}
          onToggle={toggleSection}
        >
          <div className="flex gap-2">
            {BHK_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => toggleArrayParam("bhk", String(n))}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                  selectedBHK.includes(n)
                    ? "bg-primary-100 text-primary-800 border-primary-300"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                )}
              >
                {n}+
              </button>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* Budget */}
        <FilterSectionWrapper
          title="Budget"
          sectionKey="price"
          sections={sections}
          onToggle={toggleSection}
        >
          <div className="flex flex-col gap-2">
            {priceRanges.map((range) => {
              const active = minPrice === String(range.min) && maxPrice === String(range.max);
              return (
                <button
                  key={range.label}
                  onClick={() => setPriceRange(range.min, range.max)}
                  className={cn(
                    "text-left px-3 py-2 text-sm rounded-lg border transition-colors",
                    active
                      ? "bg-primary-50 text-primary-800 border-primary-200 font-medium"
                      : "text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200"
                  )}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </FilterSectionWrapper>

        {/* Furnishing */}
        <FilterSectionWrapper
          title="Furnishing"
          sectionKey="furnishing"
          sections={sections}
          onToggle={toggleSection}
        >
          <div className="flex flex-col gap-2">
            {FURNISHING_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFurnishing.includes(opt.value)}
                  onChange={() => toggleArrayParam("furnishing", opt.value)}
                  className="w-4 h-4 accent-primary-700 rounded"
                />
                <span className="text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* More filters */}
        <FilterSectionWrapper
          title="More Filters"
          sectionKey="more"
          sections={sections}
          onToggle={toggleSection}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={() => updateParams("verified", verifiedOnly ? null : "true")}
              className="w-4 h-4 accent-primary-700 rounded"
            />
            <span className="text-sm text-slate-700">Verified Properties Only</span>
          </label>
        </FilterSectionWrapper>
      </div>
    </div>
  );
}

function FilterSectionWrapper({
  title,
  sectionKey,
  sections,
  onToggle,
  children,
}: {
  title: string;
  sectionKey: string;
  sections: FilterSection[];
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  const section = sections.find((s) => s.key === sectionKey);
  const isOpen = section?.open ?? true;

  return (
    <div className="px-5 py-4">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && children}
    </div>
  );
}
