"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn, PRODUCT_CATEGORIES, PRODUCT_PRICE_RANGES } from "@/lib/utils";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" },
];

interface FilterSection {
  title: string;
  key: string;
  open: boolean;
}

export default function ProductFilters({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sections, setSections] = useState<FilterSection[]>([
    { title: "Category", key: "category", open: true },
    { title: "Condition", key: "condition", open: true },
    { title: "Price Range", key: "price", open: true },
  ]);

  const selectedCategories = searchParams.getAll("category");
  const selectedConditions = searchParams.getAll("condition");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

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
    router.push(`/marketplace?${params.toString()}`);
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
    router.push(`/marketplace?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    router.push(`/marketplace?${params.toString()}`);
  }

  function toggleSection(key: string) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, open: !s.open } : s)));
  }

  const activeCount = [selectedCategories.length, selectedConditions.length, minPrice ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className={cn("bg-white rounded-xl shadow-card p-0 overflow-hidden", className)}>
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
          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {/* Category */}
        <FilterSectionWrapper title="Category" sectionKey="category" sections={sections} onToggle={toggleSection}>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleArrayParam("category", cat.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  selectedCategories.includes(cat.value)
                    ? "bg-primary-100 text-primary-800 border-primary-300"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* Condition */}
        <FilterSectionWrapper title="Condition" sectionKey="condition" sections={sections} onToggle={toggleSection}>
          <div className="flex flex-col gap-2">
            {CONDITION_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(opt.value)}
                  onChange={() => toggleArrayParam("condition", opt.value)}
                  className="w-4 h-4 accent-primary-700 rounded"
                />
                <span className="text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSectionWrapper>

        {/* Price Range */}
        <FilterSectionWrapper title="Price Range" sectionKey="price" sections={sections} onToggle={toggleSection}>
          <div className="flex flex-col gap-2">
            {PRODUCT_PRICE_RANGES.map((range) => {
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
      <button onClick={() => onToggle(sectionKey)} className="w-full flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && children}
    </div>
  );
}
