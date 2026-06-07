"use client";

import { useRouter, usePathname } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { ChevronDown, MapPinned } from "lucide-react";
import { ELECTION_AREAS, resolveAreaId, wardElectionHref } from "@/lib/ward-election-areas";
import { cn } from "@/lib/utils";

export default function WardElectionAreaSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = resolveAreaId(searchParams.get("area"));

  const onChange = (areaId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("area", areaId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const active = ELECTION_AREAS.find((a) => a.id === current);

  return (
    <div className={cn("relative flex items-center", className)}>
      <MapPinned className="w-3.5 h-3.5 text-indigo-200 absolute left-2.5 pointer-events-none z-10" />
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/25 rounded-lg hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
        aria-label="Election area"
        title={active?.subtitle}
      >
        {ELECTION_AREAS.map((a) => (
          <option key={a.id} value={a.id} className="text-slate-900">
            {a.name}
            {a.status !== "active" ? ` (${a.status})` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-indigo-200 absolute right-2 pointer-events-none" />
    </div>
  );
}

/** Build href with current or given area preserved. */
export function useWardElectionHref() {
  const searchParams = useSearchParams();
  const areaId = resolveAreaId(searchParams.get("area"));
  return (path: string) => wardElectionHref(path, areaId);
}
