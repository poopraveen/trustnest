"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Home, Search, ChevronRight, Users, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAnalyticsForArea } from "@/lib/ward-election-analytics";
import { getHouseholdsByWard, HOUSEHOLD_ROUTES } from "@/lib/ward-households";
import { getWardsForArea } from "@/lib/ward-election-data";
import { resolveAreaId } from "@/lib/ward-election-areas";
import {
  VOTER_STATUS_LABELS,
  VOTER_STATUS_COLORS,
  type VoterStatus,
} from "@/lib/ward-campaign";
import { useCampaignStore } from "@/components/ward-election/useCampaignStore";

interface Household {
  ward: number;
  house: string;
  voters: number;
  hasYouth: boolean;
  hasSenior: boolean;
}

interface Voter {
  voterId: string;
  name: string;
  relativeType: string;
  relativeName: string;
  houseNumber: string;
  age: number | null;
  gender: string;
}

const STATUSES: VoterStatus[] = [
  "supporter", "leaning", "undecided", "opposition", "not_home", "contacted", "unknown",
];

function wardPartsForArea(areaId: string): number[] {
  const fromRoutes = new Set(
    HOUSEHOLD_ROUTES.filter((h) => h.areaId === areaId).map((h) => h.ward)
  );
  getAnalyticsForArea(areaId).forEach((w) => fromRoutes.add(w.ward));
  getWardsForArea(areaId).forEach((w) => {
    if (w.partNo) fromRoutes.add(w.partNo);
  });
  return Array.from(fromRoutes).sort((a, b) => a - b);
}

export default function CanvassingClient() {
  const searchParams = useSearchParams();
  const areaId = resolveAreaId(searchParams.get("area"));
  const wards = wardPartsForArea(areaId);
  const defaultWard = wards[0] ?? (areaId === "perumalpattu" ? 188 : 164);
  const [ward, setWard] = useState(defaultWard);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [loadingV, setLoadingV] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { getStatus, setStatus, ready } = useCampaignStore();
  const detailRef = useRef<HTMLDivElement>(null);

  const loadVoters = useCallback(async (w: number, house: string) => {
    setLoadingV(true);
    setLoadError(null);
    setVoters([]);
    try {
      const res = await fetch(
        `/api/ward-election/voters?area=${encodeURIComponent(areaId)}&ward=${w}&house=${encodeURIComponent(house)}&limit=100`
      );
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not load voters");
        return;
      }
      const items = (data.items ?? []) as Voter[];
      setVoters(items);
      if (items.length === 0) {
        setLoadError(
          "No voter records matched this house in the JSON extract. Try another house or run npm run ward:gen after updating ward_members.json."
        );
      }
    } catch {
      setLoadError("Network error loading voter details.");
    } finally {
      setLoadingV(false);
    }
  }, [areaId]);

  useEffect(() => {
    const p = searchParams.get("part") ?? searchParams.get("ward");
    if (p && !Number.isNaN(Number(p))) setWard(Number(p));
  }, [searchParams]);

  useEffect(() => {
    if (wards.length && !wards.includes(ward)) setWard(wards[0]);
  }, [areaId, wards, ward]);

  useEffect(() => {
    setHouseholds(
      getHouseholdsByWard(ward, areaId).map((h) => ({
        ward: h.ward,
        house: h.house,
        voters: h.voters,
        hasYouth: h.hasYouth,
        hasSenior: h.hasSenior,
      }))
    );
    setSelectedHouse(null);
    setVoters([]);
    setLoadError(null);
    setSearch("");
  }, [ward, areaId]);

  useEffect(() => {
    if (selectedHouse && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedHouse, loadingV]);

  const filtered = search.trim()
    ? households.filter((h) => h.house.toLowerCase().includes(search.trim().toLowerCase()))
    : households;

  const selectHouse = (house: string) => {
    setSelectedHouse(house);
    loadVoters(ward, house);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="card p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Ward (Part)</label>
          <select
            value={ward}
            onChange={(e) => setWard(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            {wards.length === 0 ? (
              <option value={ward}>Part {ward} (no route data)</option>
            ) : (
              wards.map((w) => (
                <option key={w} value={w}>Part {w}</option>
              ))
            )}
          </select>
          {wards.length === 0 && (
            <p className="text-xs text-amber-700 mt-2">
              No household routes for this area yet. Add voter JSON and run{" "}
              <code className="bg-amber-50 px-1 rounded">npm run ward:gen</code>.
            </p>
          )}
        </div>

        <div className="card p-4">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house no…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <p className="text-xs text-slate-500 mb-2">
            {filtered.length} households · door-to-door route
          </p>
          <div className="max-h-[min(50vh,420px)] overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                No households for Part {ward}. Check area ({areaId}) or regenerate routes.
              </p>
            ) : (
              filtered.map((h) => (
                <button
                  key={`${h.ward}-${h.house}`}
                  type="button"
                  onClick={() => selectHouse(h.house)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedHouse === h.house
                      ? "bg-indigo-100 text-indigo-800 font-medium ring-1 ring-indigo-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="flex-1 truncate">{h.house || "—"}</span>
                  <span className="text-xs text-slate-400">{h.voters}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8" ref={detailRef}>
        <div className="card p-6 min-h-[320px] lg:min-h-[480px]">
          {!selectedHouse ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Select a household</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Tap a house in the route list — voter names and sentiment tags appear here.
              </p>
            </div>
          ) : loadingV ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">Loading voters at {selectedHouse}…</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 mb-1">
                House {selectedHouse} · Part {ward}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {voters.length} voter{voters.length !== 1 ? "s" : ""} at this address
              </p>

              {loadError && voters.length === 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 mb-4 text-sm text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loadError}</span>
                </div>
              )}

              {voters.length > 0 ? (
                <div className="space-y-3 max-h-[min(60vh,520px)] overflow-y-auto pr-1">
                  {voters.map((v, idx) => {
                    const status = ready ? getStatus(v.voterId) : "unknown";
                    return (
                      <div
                        key={v.voterId || `${v.name}-${idx}`}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800">{v.name || "—"}</p>
                          <p className="text-xs text-slate-500">
                            {[v.relativeType, v.relativeName].filter(Boolean).join(": ") || "—"}
                            {v.age != null && ` · Age ${v.age}`}
                            {v.gender && ` · ${v.gender}`}
                          </p>
                          {v.houseNumber && v.houseNumber !== selectedHouse && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Roll house: {v.houseNumber}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {v.voterId}
                          </p>
                        </div>
                        <select
                          value={status}
                          onChange={(e) => setStatus(v.voterId, e.target.value as VoterStatus)}
                          className={`text-xs font-medium px-2 py-1.5 rounded-lg border-0 min-w-[120px] ${VOTER_STATUS_COLORS[status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{VOTER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ) : !loadError ? (
                <p className="text-sm text-slate-500">No voters to display.</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
