import { Users2, Home, Cake, Info } from "lucide-react";
import { WARD_ANALYTICS, ANALYTICS_META, type WardAnalytics } from "@/lib/ward-election-analytics";

const COHORTS: { key: keyof WardAnalytics["ageBands"]; label: string; color: string }[] = [
  { key: "y18_29", label: "18–29", color: "bg-emerald-500" },
  { key: "a30_44", label: "30–44", color: "bg-indigo-500" },
  { key: "a45_59", label: "45–59", color: "bg-amber-500" },
  { key: "a60plus", label: "60+", color: "bg-rose-500" },
];

const fmt = (n: number) => n.toLocaleString("en-IN");

function knownAge(w: WardAnalytics) {
  const b = w.ageBands;
  return b.u18 + b.y18_29 + b.a30_44 + b.a45_59 + b.a60plus;
}

export default function VoterAnalytics() {
  if (WARD_ANALYTICS.length === 0) return null;

  const rows = [...WARD_ANALYTICS].sort((a, b) => b.analyzedVoters - a.analyzedVoters);
  const totalHouseholds = WARD_ANALYTICS.reduce((s, w) => s + w.households, 0);
  const totalAnalyzed = ANALYTICS_META.totalAnalyzed;

  // Insights
  const youthShare = (w: WardAnalytics) => {
    const k = knownAge(w);
    return k ? (w.ageBands.y18_29 / k) * 100 : 0;
  };
  const seniorShare = (w: WardAnalytics) => {
    const k = knownAge(w);
    return k ? (w.ageBands.a60plus / k) * 100 : 0;
  };
  const youngest = [...WARD_ANALYTICS].sort((a, b) => youthShare(b) - youthShare(a))[0];
  const oldest = [...WARD_ANALYTICS].sort((a, b) => seniorShare(b) - seniorShare(a))[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Demographic intelligence from <strong>{fmt(totalAnalyzed)}</strong> analyzed voter records
          across {ANALYTICS_META.wardsCovered} wards. {ANALYTICS_META.note}
        </span>
      </div>

      {/* Insight chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Cake className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Youngest ward (18–29)</p>
          <p className="font-bold text-slate-800">Part {youngest.ward} · {Math.round(youthShare(youngest))}%</p>
        </div>
        <div className="card p-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
            <Users2 className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Most senior ward (60+)</p>
          <p className="font-bold text-slate-800">Part {oldest.ward} · {Math.round(seniorShare(oldest))}%</p>
        </div>
        <div className="card p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Home className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Households to canvass</p>
          <p className="font-bold text-slate-800">{fmt(totalHouseholds)}</p>
        </div>
      </div>

      {/* Age cohort stacked bars */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-4">Age cohorts by ward</h3>
        <div className="space-y-3">
          {rows.map((w) => {
            const k = knownAge(w) || 1;
            return (
              <div key={w.ward} className="flex items-center gap-3">
                <span className="w-14 text-xs font-semibold text-slate-500 shrink-0">P-{w.ward}</span>
                <div className="flex-1 h-6 rounded-md overflow-hidden flex bg-slate-100">
                  {COHORTS.map((c) => {
                    const v = w.ageBands[c.key];
                    const pct = (v / k) * 100;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={c.key}
                        className={c.color}
                        style={{ width: `${pct}%` }}
                        title={`${c.label}: ${v} (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>
                <span className="w-24 text-xs text-slate-500 text-right shrink-0">
                  {fmt(w.households)} homes
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
          {COHORTS.map((c) => (
            <span key={c.key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded inline-block ${c.color}`} /> {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Female share by ward */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-4">Female share by ward (known gender)</h3>
        <div className="space-y-2.5">
          {rows.map((w) => {
            const known = w.male + w.female;
            const fpct = known ? (w.female / known) * 100 : 0;
            const skew = fpct >= 52 ? "text-rose-600" : fpct <= 48 ? "text-blue-600" : "text-slate-500";
            return (
              <div key={w.ward} className="flex items-center gap-3">
                <span className="w-14 text-xs font-semibold text-slate-500 shrink-0">P-{w.ward}</span>
                <div className="flex-1 h-5 bg-blue-100 rounded-md overflow-hidden relative">
                  <div className="h-full bg-rose-400" style={{ width: `${fpct}%` }} />
                  <span className="absolute inset-0 left-2 flex items-center text-[11px] font-semibold text-white">
                    {Math.round(fpct)}% F
                  </span>
                </div>
                <span className={`w-20 text-xs text-right shrink-0 ${skew}`}>
                  {fpct >= 52 ? "F-leaning" : fpct <= 48 ? "M-leaning" : "balanced"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
