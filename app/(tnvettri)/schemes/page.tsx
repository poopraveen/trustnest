import type { Metadata } from "next";
import Link from "next/link";
import GovHeroBackground from "@/components/GovHeroBackground";
import { IndianRupee, Calendar, ExternalLink, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHEMES, fmtCount, fmtCrore, DATA_SOURCES } from "@/lib/tn-official-data";
import FYSelectorBar from "@/components/FYSelectorBar";

export const metadata: Metadata = { title: "Welfare Schemes | TN Vettri" };

const SCHEME_META: Record<string, { color: string; light: string; fg: string; icon: string }> = {
  "magalir-urimai":    { color: "bg-rose-500",    light: "bg-rose-50",    fg: "text-rose-700",    icon: "👩" },
  "cm-breakfast":      { color: "bg-amber-500",   light: "bg-amber-50",   fg: "text-amber-700",   icon: "🍽️" },
  "makkalai-thedi":    { color: "bg-blue-500",    light: "bg-blue-50",    fg: "text-blue-700",    icon: "🏥" },
  "naan-mudhalvan":    { color: "bg-violet-500",  light: "bg-violet-50",  fg: "text-violet-700",  icon: "🚀" },
  "illam-thedi":       { color: "bg-emerald-500", light: "bg-emerald-50", fg: "text-emerald-700", icon: "📚" },
  "kalaignar-housing": { color: "bg-pink-500",    light: "bg-pink-50",    fg: "text-pink-700",    icon: "🏠" },
  "thayumanuvar":      { color: "bg-teal-500",    light: "bg-teal-50",    fg: "text-teal-700",    icon: "🤝" },
  "pds-ration":        { color: "bg-orange-500",  light: "bg-orange-50",  fg: "text-orange-700",  icon: "🌾" },
  "social-security-pension": { color: "bg-cyan-500", light: "bg-cyan-50", fg: "text-cyan-700",   icon: "🧓" },
};

const MONTHLY_DISBURSE = [980, 1120, 1340, 1580, 1720, 2100, 2340, 2180, 2540, 2800, 2200, 3160];
const MONTHS = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const maxDisburse = Math.max(...MONTHLY_DISBURSE);

export default function SchemesPage() {
  const totalBeneficiaries = SCHEMES.reduce((s, d) => s + d.beneficiaries, 0);
  const totalDisbursed     = SCHEMES.reduce((s, d) => s + d.disbursedCrore, 0);
  const totalBudget        = SCHEMES.reduce((s, d) => s + d.budgetCrore, 0);
  const onTrack            = SCHEMES.filter(s => s.status === "active").length;

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Schemes</span>
          </div>
          <h1 className="text-3xl font-bold">Welfare Scheme Benefits</h1>
          <p className="text-green-200 mt-1 text-lg font-tamil">நலத்திட்ட பலன்கள்</p>
          <p className="text-green-300 text-sm mt-2">
            {SCHEMES.length} flagship schemes · {fmtCount(totalBeneficiaries)} beneficiaries · {fmtCrore(totalDisbursed)} disbursed · FY 2024-25
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Total Beneficiaries",   labelTa: "மொத்த பயனாளிகள்",     value: fmtCount(totalBeneficiaries), note: "Across all schemes",      fg: "text-primary-700" },
              { label: "Total Disbursed",        labelTa: "மொத்த வழங்கப்பட்டது",  value: fmtCrore(totalDisbursed),     note: "FY 2024-25",              fg: "text-emerald-700" },
              { label: "Total Budget",           labelTa: "மொத்த பட்ஜெட்",        value: fmtCrore(totalBudget),        note: "Approved outlay",         fg: "text-blue-700"    },
              { label: "Active Schemes",         labelTa: "செயலில் உள்ள திட்டம்", value: `${onTrack}/${SCHEMES.length}`, note: "State flagship schemes",  fg: "text-violet-700"  },
            ].map(s => (
              <div key={s.label} className="py-5 px-6 first:pl-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xs text-slate-400 font-tamil mb-1">{s.labelTa}</p>
                <p className={cn("text-2xl font-bold font-data tabular-nums", s.fg)}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness + FY selector */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "schemes")!; return (
          <FYSelectorBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* Scheme cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {SCHEMES.map((s) => {
            const meta = SCHEME_META[s.id] ?? { color: "bg-slate-500", light: "bg-slate-50", fg: "text-slate-700", icon: "📋" };
            const progressPct = Math.round((s.beneficiaries / s.target) * 100);
            const benefitStr = s.benefitAmt > 0
              ? (s.frequency === "One-time" ? `₹${s.benefitAmt.toLocaleString("en-IN")} one-time` : `₹${s.benefitAmt.toLocaleString("en-IN")}/${s.frequency.toLowerCase()}`)
              : s.frequency;

            return (
              <div key={s.id} className={cn(
                "bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300",
                "border border-slate-100 border-t-4 overflow-hidden flex flex-col",
                meta.color.replace("bg-", "border-t-")
              )}>
                <div className={cn("px-5 pt-5 pb-4", meta.light)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{meta.icon}</span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-tight">{s.name}</h3>
                        <p className="text-xs text-slate-500 font-tamil mt-0.5">{s.nameTa}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Live
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{benefitStr}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Since {s.launched}</span>
                  </div>
                </div>

                <div className="px-5 py-4 flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Beneficiaries</p>
                      <p className={cn("text-xl font-bold font-data tabular-nums", meta.fg)}>{fmtCount(s.beneficiaries)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Disbursed</p>
                      <p className="text-base font-bold font-data text-slate-700">{fmtCrore(s.disbursedCrore)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Target progress</span>
                      <span className="font-semibold">{progressPct}% of {fmtCount(s.target)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", meta.color)}
                        style={{ width: `${Math.min(progressPct, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{s.eligibility}</span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s.dept}
                  </span>
                  <a href={`https://${s.source}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium">
                    <ExternalLink className="w-3 h-3" /> {s.source}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly disbursement chart */}
        <div className="mt-8 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Monthly Disbursement – FY 2024-25</h2>
          <p className="text-xs text-slate-400 font-tamil mb-5">மாதாந்திர வழங்கல் — அனைத்து திட்டங்கள் கூட்டு</p>
          <div className="flex items-end gap-1 h-24">
            {MONTHLY_DISBURSE.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                <div className="w-full bg-emerald-400 hover:bg-emerald-600 transition-colors cursor-pointer rounded-t-sm"
                  style={{ height: `${(v / maxDisburse) * 100}%` }} />
                <span className="text-[9px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ₹ Crore · All 9 schemes combined · Source: tnsocialwelfare.tn.gov.in + dept portals
          </p>
        </div>

      </div>
    </div>
  );
}
