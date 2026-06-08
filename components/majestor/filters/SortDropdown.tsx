"use client";

import { ChevronDown } from "lucide-react";
import { SortOption } from "@/lib/majestor/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured",    label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest",      label: "Newest" },
  { value: "price-asc",   label: "Price: Low → High" },
  { value: "price-desc",  label: "Price: High → Low" },
  { value: "name-asc",    label: "A → Z" },
  { value: "name-desc",   label: "Z → A" },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const label = SORT_OPTIONS.find(o => o.value === value)?.label ?? "Sort";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="appearance-none bg-[#0d1117] border border-white/15 text-slate-300 text-sm rounded-xl pl-4 pr-8 py-2.5 outline-none focus:border-[#00e5a0]/50 cursor-pointer"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}
