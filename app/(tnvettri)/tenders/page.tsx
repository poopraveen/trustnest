import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, TrendingUp, CheckCircle, Clock, Users, ExternalLink, Download, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { TENDERS as TENDERS_DATA, DATA_SOURCES } from "@/lib/tn-official-data";
import FYSelectorBar from "@/components/FYSelectorBar";
import GovHeroBackground from "@/components/GovHeroBackground";

export const metadata: Metadata = { title: "Procurement & Tenders | TN Vettri" };

const STATS = [
  { label: "Total Tenders (All Time)", labelTa: "மொத்த டெண்டர்கள்",    value: TENDERS_DATA.totalTenders.toLocaleString("en-IN"), sub: "On eProcurement portal",    color: "text-primary-700", bg: "bg-primary-50" },
  { label: "Total Value",              labelTa: "மொத்த மதிப்பு",         value: `₹${(TENDERS_DATA.totalValueCrore / 1000).toFixed(0)}K Cr`, sub: "All-time eProcurement", color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "Active Tenders",           labelTa: "செயலில் உள்ள டெண்டர்", value: TENDERS_DATA.activeTenders.toLocaleString("en-IN"), sub: "Open for bids right now", color: "text-blue-700", bg: "bg-blue-50" },
  { label: "Avg. Bidders/Tender",      labelTa: "சராசரி போட்டியாளர்கள்", value: TENDERS_DATA.avgBidders.toString(), sub: "Healthy competition index", color: "text-violet-700", bg: "bg-violet-50" },
];

const STAGE_DATA = TENDERS_DATA.stageDistribution.map((s, i) => {
  const colors = [
    { color: "bg-blue-500",    light: "bg-blue-50",    fg: "text-blue-700"    },
    { color: "bg-amber-500",   light: "bg-amber-50",   fg: "text-amber-700"   },
    { color: "bg-violet-500",  light: "bg-violet-50",  fg: "text-violet-700"  },
    { color: "bg-slate-400",   light: "bg-slate-50",   fg: "text-slate-600"   },
    { color: "bg-emerald-500", light: "bg-emerald-50", fg: "text-emerald-700" },
    { color: "bg-teal-500",    light: "bg-teal-50",    fg: "text-teal-700"    },
    { color: "bg-green-500",   light: "bg-green-50",   fg: "text-green-700"   },
    { color: "bg-red-400",     light: "bg-red-50",     fg: "text-red-600"     },
  ];
  return { stage: s.stage, count: s.count, pct: Math.round(s.pct), ...colors[i % colors.length] };
});

const TENDERS = [
  {
    no: "CMRL/2024/0891", title: "Chennai Metro Phase 2A Civil Works – Pkg 4",
    dept: "Transport", value: 2840, stage: "Awarded", bidders: 4,
    published: "12 Jan 2024", closing: "Closed", awarded: "L&T Construction",
    awardedValue: 2760,
  },
  {
    no: "TANGEDCO/2024/2312", title: "Smart Meter Installation – North Zone 2.5L meters",
    dept: "Energy", value: 680, stage: "Awarded", bidders: 7,
    published: "22 Feb 2024", closing: "Closed", awarded: "Genus Power",
    awardedValue: 642,
  },
  {
    no: "NHAI/TN/2024/045", title: "NH-44 4-Laning – Krishnagiri to Vellore 84 km",
    dept: "Highways", value: 3200, stage: "Bidding", bidders: 5,
    published: "08 Mar 2024", closing: "30 Jun 2025", awarded: null,
    awardedValue: null,
  },
  {
    no: "TWAD/2024/1123", title: "Veeranam Water Supply Augmentation Scheme",
    dept: "Water Resources", value: 920, stage: "Evaluation", bidders: 6,
    published: "14 Apr 2024", closing: "Closed", awarded: null,
    awardedValue: null,
  },
  {
    no: "SE/TN/2024/4501", title: "School Furniture – 8,00,000 Desks & Benches",
    dept: "School Education", value: 480, stage: "Awarded", bidders: 9,
    published: "01 Feb 2024", closing: "Closed", awarded: "Karnataka Plywood Consortium",
    awardedValue: 461,
  },
  {
    no: "SIPCOT/2024/0218", title: "Tiruppur Industrial Park Road & Drainage",
    dept: "Industries", value: 320, stage: "Published", bidders: 0,
    published: "10 May 2025", closing: "15 Jul 2025", awarded: null,
    awardedValue: null,
  },
  {
    no: "NHM/2024/0980", title: "Medical Equipment Supply – 300 PHCs",
    dept: "Health", value: 240, stage: "Awarded", bidders: 11,
    published: "05 Dec 2023", closing: "Closed", awarded: "Siemens Healthineers",
    awardedValue: 228,
  },
  {
    no: "WR/2024/0672", title: "Palar Basin Flood Control Embankment Works",
    dept: "Water Resources", value: 580, stage: "Bidding", bidders: 3,
    published: "18 Apr 2024", closing: "30 Jun 2025", awarded: null,
    awardedValue: null,
  },
];

const DEPT_ANALYSIS = [
  { name: "Transport",          tenders: 18420, value: 218400, avgBidders: 5.2, savingPct: 4.8 },
  { name: "Water Resources",    tenders: 12840, value: 142600, avgBidders: 6.1, savingPct: 3.9 },
  { name: "Energy",             tenders:  8920, value:  98200, avgBidders: 7.4, savingPct: 5.6 },
  { name: "School Education",   tenders:  7640, value:  48400, avgBidders: 8.2, savingPct: 4.2 },
  { name: "Health",             tenders:  6180, value:  42800, avgBidders: 9.1, savingPct: 5.1 },
  { name: "Highways",           tenders:  5340, value:  89600, avgBidders: 4.8, savingPct: 3.4 },
];

const stageStyle: Record<string, { bg: string; fg: string; dot: string }> = {
  Published:  { bg: "bg-blue-100",    fg: "text-blue-700",    dot: "bg-blue-500" },
  Bidding:    { bg: "bg-amber-100",   fg: "text-amber-700",   dot: "bg-amber-500" },
  Evaluation: { bg: "bg-violet-100",  fg: "text-violet-700",  dot: "bg-violet-500" },
  Awarded:    { bg: "bg-emerald-100", fg: "text-emerald-700", dot: "bg-emerald-500" },
  Cancelled:  { bg: "bg-red-100",     fg: "text-red-700",     dot: "bg-red-400" },
};

export default function TendersPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white">Home</Link>
            <span>/</span><span>Tenders</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Procurement Transparency</h1>
              <p className="text-green-200 mt-1 text-lg font-tamil">கொள்முதல் வெளிப்படைத்தன்மை</p>
              <p className="text-green-300 text-sm mt-2">7,53,374 tenders · ₹7,53,403 Cr total value · Source: tenders.tn.gov.in</p>
            </div>
            <div className="flex gap-2">
              <a href="https://tenders.tn.gov.in" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> TN Tenders Portal
              </a>
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {STATS.map((s) => (
              <div key={s.label} className="py-5 px-6 first:pl-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xs text-slate-400 font-tamil mb-1">{s.labelTa}</p>
                <p className={cn("text-2xl font-bold font-data tabular-nums", s.color)}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness + FY selector */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "tenders")!; return (
          <FYSelectorBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* Stage pipeline */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Tender Stage Distribution</h2>
          <p className="text-xs text-slate-400 font-tamil mb-5">டெண்டர் நிலை பகுப்பு</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-5">
            {STAGE_DATA.map((s) => (
              <div key={s.stage} className={cn("rounded-xl p-4 text-center", s.light)}>
                <p className={cn("text-2xl font-bold font-data tabular-nums", s.fg)}>{s.count.toLocaleString("en-IN")}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">{s.stage}</p>
                <p className="text-xs text-slate-400">{s.pct}%</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-0 h-3 rounded-full overflow-hidden">
            {STAGE_DATA.map(s => (
              <div key={s.stage} className={cn("h-full", s.color)} style={{ width: `${s.pct}%` }} />
            ))}
          </div>
        </div>

        {/* Tender listing */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Recent Tenders</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">சமீபத்திய டெண்டர்கள்</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Showing 8 of 15,240 active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tender</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dept.</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Est. Value (Cr)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Bidders</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Closing</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Awarded To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TENDERS.map((t) => {
                  const s = stageStyle[t.stage] || stageStyle.Published;
                  const saving = t.awardedValue ? Math.round((1 - t.awardedValue / t.value) * 100 * 10) / 10 : null;
                  return (
                    <tr key={t.no} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                        <p className="text-xs text-slate-400 font-data mt-0.5">{t.no}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium whitespace-nowrap">{t.dept}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className="text-sm font-bold font-data text-slate-800 tabular-nums">{t.value.toLocaleString("en-IN")}</p>
                        {saving !== null && (
                          <p className="text-xs text-emerald-600 font-semibold">-{saving}% saved</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-data text-slate-600">{t.bidders || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{t.closing}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap", s.bg, s.fg)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />{t.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[160px] truncate">
                        {t.awarded ? (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            {t.awarded}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Source: tenders.tn.gov.in · Last sync: 08 May 2025</span>
            <a href="https://tenders.tn.gov.in" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium">
              <ExternalLink className="w-3 h-3" /> View All Tenders
            </a>
          </div>
        </div>

        {/* Department analysis */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Department-wise Procurement Analysis</h2>
            <p className="text-xs text-slate-400 font-tamil mt-0.5">துறை வாரியான கொள்முதல் பகுப்பாய்வு</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right"># Tenders</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Value (Cr)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Avg Bidders</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEPT_ANALYSIS.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{d.name}</td>
                    <td className="px-4 py-3.5 text-right text-sm font-data tabular-nums text-slate-600">{d.tenders.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 text-right text-sm font-bold font-data tabular-nums text-slate-800">
                      {typeof d.value === "number" ? d.value.toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(d.avgBidders / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs font-data text-slate-600">{d.avgBidders}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">-{d.savingPct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
