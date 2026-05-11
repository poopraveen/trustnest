"use client";

import { SortAsc } from "lucide-react";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";

export default function SortDropdown({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "area_asc", label: "Area: Small to Large" },
    { value: "area_desc", label: "Area: Large to Small" },
  ];

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <SortAsc className="w-4 h-4 text-slate-400" />
      <select
        defaultValue={current ?? "newest"}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
