"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, Clock, ExternalLink, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_YEARS } from "@/lib/tn-official-data";

interface DataFreshnessBarProps {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  covers: string;
  lastVerified: string;
  updateFrequency: string;
  health: "live" | "stale" | "manual";
  recordCount: number;
  onYearChange?: (fy: string) => void;
  selectedYear?: string;
}

const healthConfig = {
  live:   { dot: "bg-emerald-400", text: "text-emerald-600", label: "Live data",      bg: "bg-emerald-50 border-emerald-200" },
  stale:  { dot: "bg-amber-400",   text: "text-amber-600",   label: "May be outdated", bg: "bg-amber-50 border-amber-200"   },
  manual: { dot: "bg-blue-400",    text: "text-blue-600",    label: "Manually verified", bg: "bg-blue-50 border-blue-200"   },
};

function fmtRecords(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function DataFreshnessBar({
  sourceId, sourceName, sourceUrl, covers, lastVerified,
  updateFrequency, health, recordCount,
  onYearChange, selectedYear = "2024-25",
}: DataFreshnessBarProps) {
  const [showYearPicker, setShowYearPicker] = useState(false);
  const hc = healthConfig[health];
  const selected = AVAILABLE_YEARS.find(y => y.fy === selectedYear) ?? AVAILABLE_YEARS[0];

  return (
    <div className={cn("border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-xs", hc.bg)}>

      {/* Health indicator */}
      <span className="flex items-center gap-1.5 font-semibold">
        <span className={cn("w-2 h-2 rounded-full animate-pulse", hc.dot)} />
        <span className={hc.text}>{hc.label}</span>
      </span>

      <span className="text-slate-300 hidden sm:block">|</span>

      {/* Source */}
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 text-slate-600 hover:text-primary-600 transition-colors font-medium">
        <ExternalLink className="w-3 h-3" />
        {sourceName}
      </a>

      <span className="text-slate-300 hidden sm:block">|</span>

      {/* Period covered */}
      <span className="flex items-center gap-1 text-slate-500">
        <Clock className="w-3 h-3 text-slate-400" />
        Covers: <span className="font-semibold text-slate-700 ml-0.5">{covers}</span>
      </span>

      <span className="text-slate-300 hidden sm:block">|</span>

      {/* Last verified */}
      <span className="flex items-center gap-1 text-slate-500">
        <RefreshCw className="w-3 h-3 text-slate-400" />
        Verified: <span className="font-semibold text-slate-700 ml-0.5">{lastVerified}</span>
        <span className="text-slate-400">· {updateFrequency}</span>
      </span>

      <span className="text-slate-300 hidden sm:block">|</span>

      {/* Record count */}
      <span className="text-slate-500">
        <span className="font-semibold text-slate-700">{fmtRecords(recordCount)}</span> records
      </span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* FY Selector */}
      {onYearChange && (
        <div className="relative">
          <button
            onClick={() => setShowYearPicker(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-primary-400 transition-colors shadow-sm"
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", selected.status === "live" ? "bg-emerald-400" : "bg-slate-400")} />
            {selected.label}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showYearPicker && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[200px]">
              {AVAILABLE_YEARS.map(y => (
                <button key={y.fy} onClick={() => { onYearChange(y.fy); setShowYearPicker(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2",
                    y.fy === selectedYear ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700"
                  )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", y.status === "live" ? "bg-emerald-400" : "bg-slate-300")} />
                  {y.label}
                  {y.status === "archived" && (
                    <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Archived</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info link */}
      <Link href="/data-sources"
        className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors font-medium">
        <Info className="w-3 h-3" /> Data info
      </Link>
    </div>
  );
}
