import type { Metadata } from "next";
import { Link } from "@/navigation";
import { MapPin, TrendingUp, TrendingDown, Award, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISTRICT_SCORES, DATA_SOURCES } from "@/lib/tn-official-data";
import FYSelectorBar from "@/components/FYSelectorBar";
import ScorecardInfoTooltip from "@/components/ScorecardInfoTooltip";
import GovHeroBackground from "@/components/GovHeroBackground";

export const metadata: Metadata = { title: "District Scorecards | TN Vettri" };

// Map central data to local shape (deduplicate Thanjavur)
const DISTRICTS = DISTRICT_SCORES
  .filter(d => d.code !== "THA2")
  .slice(0, 38)
  .map(d => ({
    name: d.name, nameTa: d.nameTa, score: d.overall, rank: d.rank,
    fin: d.fin, svc: d.svc, impact: d.cit, infra: d.inf, gov: d.gov,
    trend: d.rank <= 10 ? "up" : d.rank >= 35 ? "down" : "same",
  }));

function scoreGrade(score: number) {
  if (score >= 80) return { grade: "A+", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (score >= 70) return { grade: "A",  color: "bg-blue-100 text-blue-700 border-blue-200" };
  if (score >= 60) return { grade: "B",  color: "bg-amber-100 text-amber-700 border-amber-200" };
  if (score >= 50) return { grade: "C",  color: "bg-orange-100 text-orange-700 border-orange-200" };
  return                   { grade: "D",  color: "bg-red-100 text-red-700 border-red-200" };
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 50) return "bg-orange-400";
  return "bg-red-500";
}

const CATEGORIES = [
  { key: "fin",    label: "Financial Efficiency", labelTa: "நிதி திறன்",          color: "bg-blue-500",    icon: "💰" },
  { key: "svc",    label: "Service Delivery",     labelTa: "சேவை வழங்கல்",         color: "bg-violet-500",  icon: "🏛️" },
  { key: "impact", label: "Citizen Impact",       labelTa: "குடிமக்கள் தாக்கம்",   color: "bg-emerald-500", icon: "👥" },
  { key: "infra",  label: "Infrastructure",       labelTa: "உள்கட்டமைப்பு",        color: "bg-amber-500",   icon: "🏗️" },
  { key: "gov",    label: "Governance Integrity", labelTa: "நிர்வாக நேர்மை",        color: "bg-rose-500",    icon: "⚖️" },
];

const stateAvg = Math.round(DISTRICTS.reduce((s, d) => s + d.score, 0) / DISTRICTS.length);

export default function ScorecardsPage() {
  const top5    = DISTRICTS.slice(0, 5);
  const bottom5 = DISTRICTS.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Scorecards</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">District Performance Scorecards</h1>
            <ScorecardInfoTooltip />
          </div>
          <p className="text-green-200 mt-1 text-lg font-tamil">மாவட்ட செயல்திறன் மதிப்பீடு</p>
          <p className="text-green-300 text-sm mt-2">38 Districts · 5 Categories · Q4 2024 · Composite Governance Index</p>
        </div>
      </div>

      {/* State summary bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100">
            <div className="py-5 px-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">State Average</p>
              <p className="text-2xl font-bold font-data text-primary-700">{stateAvg}/100</p>
              <p className="text-xs text-slate-400 mt-0.5">Grade B · Improving</p>
            </div>
            {CATEGORIES.map(c => {
              const avg = Math.round(DISTRICTS.reduce((s, d) => s + (d as any)[c.key], 0) / DISTRICTS.length);
              return (
                <div key={c.key} className="py-5 px-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.icon} {c.label}</p>
                  <p className="text-2xl font-bold font-data text-slate-800">{avg}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${avg}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness + FY selector */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "districts")!; return (
          <FYSelectorBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* Top & Bottom performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-800">Top Performers</h2>
              <span className="ml-auto text-xs text-slate-400">Best 5 districts</span>
            </div>
            <div className="divide-y divide-slate-100">
              {top5.map((d, i) => {
                const g = scoreGrade(d.score);
                return (
                  <div key={d.name} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <span className="text-lg font-bold font-data text-slate-300 w-6">#{d.rank}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400 font-tamil">{d.nameTa}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="text-sm font-bold font-data text-slate-700 w-8 text-right tabular-nums">{d.score}</span>
                      <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", g.color)}>{g.grade}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-slate-800">Need Attention</h2>
              <span className="ml-auto text-xs text-slate-400">Bottom 5 districts</span>
            </div>
            <div className="divide-y divide-slate-100">
              {bottom5.map((d) => {
                const g = scoreGrade(d.score);
                return (
                  <div key={d.name} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <span className="text-lg font-bold font-data text-slate-300 w-6">#{d.rank}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400 font-tamil">{d.nameTa}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : <TrendingUp className="w-3.5 h-3.5 text-slate-300" />}
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", scoreBg(d.score))} style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="text-sm font-bold font-data text-slate-700 w-8 text-right tabular-nums">{d.score}</span>
                      <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", g.color)}>{g.grade}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All 38 districts grid */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">All 38 Districts</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">அனைத்து 38 மாவட்டங்கள்</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {[["A+", "bg-emerald-100 text-emerald-700"], ["A", "bg-blue-100 text-blue-700"], ["B", "bg-amber-100 text-amber-700"], ["C", "bg-orange-100 text-orange-700"]].map(([g, cls]) => (
                <span key={g} className={cn("px-2 py-0.5 rounded font-semibold", cls)}>{g}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-slate-100">
            {DISTRICTS.map((d) => {
              const g = scoreGrade(d.score);
              return (
                <div key={d.name} className="bg-white p-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs text-slate-400">#{d.rank}</span>
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", g.color)}>{g.grade}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{d.name}</p>
                  <p className="text-[10px] text-slate-400 font-tamil mb-2 truncate">{d.nameTa}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", scoreBg(d.score))} style={{ width: `${d.score}%` }} />
                    </div>
                    <span className="text-xs font-bold font-data text-slate-700 tabular-nums">{d.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Composite score = 0.25×Financial Efficiency + 0.25×Service Delivery + 0.20×Citizen Impact + 0.15×Infrastructure + 0.15×Governance Integrity · Q4 2024
            </p>
            <ScorecardInfoTooltip />
          </div>
        </div>

        {/* Category heatmap */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Category Performance — Top 10 Districts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">District</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall</th>
                  {CATEGORIES.map(c => (
                    <th key={c.key} className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.icon} {c.label.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DISTRICTS.slice(0, 10).map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400 font-tamil">{d.nameTa}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold font-data text-primary-700">{d.score}</span>
                    </td>
                    {CATEGORIES.map(c => {
                      const val = (d as any)[c.key] as number;
                      const heat = val >= 80 ? "bg-emerald-100 text-emerald-700" : val >= 70 ? "bg-blue-100 text-blue-700" : val >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                      return (
                        <td key={c.key} className="px-4 py-3 text-center">
                          <span className={cn("inline-block text-xs font-bold font-data px-2 py-0.5 rounded", heat)}>{val}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Source: Composite index derived from PFMS, PGPORTAL, NHM, DISHA, and eProcurement data · Period: Q4 2024
          </div>
        </div>

      </div>
    </div>
  );
}
