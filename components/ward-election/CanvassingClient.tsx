"use client";

import { useCallback, useEffect, useState } from "react";
import { Home, Search, ChevronRight, Users, Loader2 } from "lucide-react";
import { WARD_ANALYTICS } from "@/lib/ward-election-analytics";
import { getHouseholdsByWard } from "@/lib/ward-households";
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

export default function CanvassingClient() {
  const wards = WARD_ANALYTICS.map((w) => w.ward).sort((a, b) => a - b);
  const [ward, setWard] = useState(wards[0] ?? 164);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [loadingV, setLoadingV] = useState(false);
  const { getStatus, setStatus, ready } = useCampaignStore();

  const loadVoters = useCallback(async (w: number, house: string) => {
    setLoadingV(true);
    try {
      const res = await fetch(
        `/api/ward-election/voters?ward=${w}&house=${encodeURIComponent(house)}&limit=100`
      );
      const data = await res.json();
      setVoters(data.items ?? []);
    } finally {
      setLoadingV(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("part");
    if (p && !Number.isNaN(Number(p))) setWard(Number(p));
  }, []);

  useEffect(() => {
    setHouseholds(getHouseholdsByWard(ward));
    setSelectedHouse(null);
    setVoters([]);
    setSearch("");
  }, [ward]);

  const filtered = search.trim()
    ? households.filter((h) => h.house.toLowerCase().includes(search.trim().toLowerCase()))
    : households;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Ward + household list */}
      <div className="lg:col-span-4 space-y-4">
        <div className="card p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Ward (Part)</label>
          <select
            value={ward}
            onChange={(e) => setWard(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            {wards.map((w) => (
              <option key={w} value={w}>Part {w}</option>
            ))}
          </select>
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
          <div className="max-h-[420px] overflow-y-auto space-y-1">
            {filtered.map((h) => (
                <button
                  key={h.house}
                  type="button"
                  onClick={() => {
                    setSelectedHouse(h.house);
                    loadVoters(ward, h.house);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedHouse === h.house
                      ? "bg-indigo-100 text-indigo-800 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="flex-1 truncate">{h.house}</span>
                  <span className="text-xs text-slate-400">{h.voters}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Voters at selected house */}
      <div className="lg:col-span-8">
        <div className="card p-6 min-h-[480px]">
          {!selectedHouse ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Select a household</p>
              <p className="text-sm text-slate-400 mt-1">Choose a house from the route list to mark voter sentiment.</p>
            </div>
          ) : loadingV ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 mb-1">
                House {selectedHouse} · Part {ward}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{voters.length} voter(s) at this address</p>
              <div className="space-y-3">
                {voters.map((v) => {
                  const status = ready ? getStatus(v.voterId) : "unknown";
                  return (
                    <div key={v.voterId} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-500">
                          {v.relativeType}: {v.relativeName}
                          {v.age != null && ` · Age ${v.age}`}
                          {v.gender && ` · ${v.gender}`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.voterId}</p>
                      </div>
                      <select
                        value={status}
                        onChange={(e) => setStatus(v.voterId, e.target.value as VoterStatus)}
                        className={`text-xs font-medium px-2 py-1.5 rounded-lg border-0 ${VOTER_STATUS_COLORS[status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{VOTER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
