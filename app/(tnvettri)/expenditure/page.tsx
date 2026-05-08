import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Download, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUDGET, DEPT_BUDGETS, MONTHLY_EXPENDITURE, DATA_SOURCES } from "@/lib/tn-official-data";
import FYSelectorBar from "@/components/FYSelectorBar";

export const metadata: Metadata = { title: "Budget Expenditure | TN Vettri" };

const maxMonthly = Math.max(...MONTHLY_EXPENDITURE.map(m => m.budget));

const statusMap = {
  "on-track": { bg: "bg-emerald-100", fg: "text-emerald-700", bar: "bg-emerald-500", label: "On Track" },
  "at-risk":  { bg: "bg-amber-100",   fg: "text-amber-700",   bar: "bg-amber-500",   label: "At Risk"  },
  "delayed":  { bg: "bg-red-100",     fg: "text-red-700",     bar: "bg-red-500",     label: "Behind"   },
};

function crFmt(n: number) {
  return n >= 1000 ? `₹${(n / 1000).toFixed(1)}K Cr` : `₹${n.toLocaleString("en-IN")} Cr`;
}

export default function ExpenditurePage() {
  const releasedPct = Math.round((BUDGET.released_crore / BUDGET.totalBudget_crore) * 100);
  const spentPct    = BUDGET.utilisationPct;
  const pendingCr   = BUDGET.totalBudget_crore - BUDGET.spent_crore;

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Expenditure</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Budget Expenditure Tracker</h1>
              <p className="text-blue-200 mt-1 text-lg font-tamil">பட்ஜெட் செலவின கண்காணிப்பு</p>
              <p className="text-blue-300 text-sm mt-2">
                Financial Year {BUDGET.financialYear} · Source: {BUDGET.source} · Updated {BUDGET.lastUpdated}
              </p>
            </div>
            <div className="flex gap-2">
              <a href="https://tnbudget.tn.gov.in" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Budget Portal
              </a>
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Total Budget 2024-25", labelTa: "மொத்த பட்ஜெட்",    value: `₹${(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr`,  sub: "Approved by Legislature",           fg: "text-blue-700"    },
              { label: "Released to Depts",    labelTa: "வெளியிடப்பட்டது",  value: `₹${(BUDGET.released_crore / 1000).toFixed(0)}K Cr`,     sub: `${releasedPct}% of allocation`,     fg: "text-emerald-700" },
              { label: "Actual Expenditure",   labelTa: "உண்மை செலவு",      value: `₹${(BUDGET.spent_crore / 1000).toFixed(0)}K Cr`,        sub: `${spentPct}% utilisation rate`,     fg: "text-violet-700"  },
              { label: "Pending Utilisation",  labelTa: "நிலுவை செலவு",     value: `₹${(pendingCr / 1000).toFixed(0)}K Cr`,                 sub: `${(100 - spentPct)}% of budget`,    fg: "text-amber-700"   },
            ].map((s) => (
              <div key={s.label} className="py-5 px-6 first:pl-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xs text-slate-400 font-tamil mb-1">{s.labelTa}</p>
                <p className={cn("text-2xl font-bold font-data tabular-nums", s.fg)}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness + FY selector */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "budget")!; return (
          <FYSelectorBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* Utilisation meter */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Overall Budget Utilisation</h2>
              <p className="text-xs text-slate-500 font-tamil mt-0.5">ஒட்டுமொத்த பட்ஜெட் பயன்பாடு</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{spentPct}%</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Released ({releasedPct}%)</span>
                <span>₹{(BUDGET.released_crore / 1000).toFixed(0)}K Cr of ₹{(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${releasedPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Spent ({spentPct}%)</span>
                <span>₹{(BUDGET.spent_crore / 1000).toFixed(0)}K Cr of ₹{(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${spentPct}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Released</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Spent</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> Unspent</span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Monthly Expenditure Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Apr 2024 – Mar 2025 · ₹ Crore · Source: pfms.nic.in</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">FY {BUDGET.financialYear}</span>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {MONTHLY_EXPENDITURE.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5 group">
                <div className="w-full flex flex-col items-center gap-0.5 justify-end" style={{ height: "100%" }}>
                  <div className="relative w-full flex gap-0.5 items-end justify-center"
                    style={{ height: `${(m.budget / maxMonthly) * 100}%` }}>
                    <div className="w-[45%] bg-blue-200 rounded-t-sm group-hover:bg-blue-400 transition-colors" style={{ height: "100%" }} />
                    <div className="w-[45%] bg-emerald-400 rounded-t-sm group-hover:bg-emerald-600 transition-colors"
                      style={{ height: `${Math.min((m.spent / m.budget) * 100, 100)}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" /> Monthly Budget</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Actual Spent</span>
          </div>
        </div>

        {/* Department breakdown */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Department-wise Utilisation</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">துறை வாரியான பயன்பாடு</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Top 10 depts by allocation — TN Budget 2024-25</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Allocation (₹ Cr)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Spent (₹ Cr)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Utilisation</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEPT_BUDGETS.map((d) => {
                  const s = statusMap[d.status as keyof typeof statusMap] ?? statusMap["on-track"];
                  return (
                    <tr key={d.code} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-slate-800">{d.dept}</p>
                        <p className="text-xs text-slate-400 tabular-nums">Capital: ₹{d.capital.toLocaleString("en-IN")} Cr · Revenue: ₹{d.revenue.toLocaleString("en-IN")} Cr</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-data text-right text-slate-600 tabular-nums">
                        {d.total.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-data text-right font-semibold text-slate-800 tabular-nums">
                        {d.spent.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${d.utilPct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-9 text-right tabular-nums">{d.utilPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", s.bg, s.fg)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", s.bar)} />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Source: pfms.nic.in · tnbudget.tn.gov.in · Updated {BUDGET.lastUpdated}</span>
            <a href="https://tnbudget.tn.gov.in" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium">
              <ExternalLink className="w-3 h-3" /> Full Budget Report
            </a>
          </div>
        </div>

        {/* Capital vs Revenue + Key Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Expenditure by Type</h3>
            <div className="space-y-4">
              {[
                {
                  label: "Revenue Expenditure", labelTa: "வருவாய் செலவு",
                  value: crFmt(BUDGET.revenueExpenditure_crore),
                  pct: Math.round((BUDGET.revenueExpenditure_crore / BUDGET.totalBudget_crore) * 100),
                  color: "bg-blue-500",
                },
                {
                  label: "Capital Expenditure", labelTa: "மூலதன செலவு",
                  value: crFmt(BUDGET.capitalOutlay_crore),
                  pct: Math.round((BUDGET.capitalOutlay_crore / BUDGET.totalBudget_crore) * 100),
                  color: "bg-violet-500",
                },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      <span className="text-xs text-slate-400 font-tamil ml-2">{item.labelTa}</span>
                    </div>
                    <span className="text-sm font-bold font-data text-slate-800">{item.value}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.pct}% of total budget</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Key Budget Ratios</h3>
            <div className="space-y-3">
              {[
                { label: "Fiscal Deficit / GSDP",      value: "3.4%",           note: "Target: 3.0%",          warn: true  },
                { label: "Capital Outlay / Total Exp.", value: "22.8%",          note: "₹94,224 Cr capex",      warn: false },
                { label: "Own Tax Revenue",             value: "₹1,68,000 Cr",   note: "12% YoY growth",        warn: false },
                { label: "Central Transfers",           value: "₹83,200 Cr",     note: "Devolution + grants",   warn: false },
                { label: "Revenue Deficit",             value: "₹48,234 Cr",     note: "Reducing YoY",          warn: false },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{r.label}</span>
                  <div className="text-right">
                    <span className={cn("text-sm font-bold font-data", r.warn ? "text-amber-600" : "text-slate-800")}>{r.value}</span>
                    <p className="text-xs text-slate-400">{r.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">Source: tnbudget.tn.gov.in · RBI State Finance Report 2024</p>
          </div>
        </div>

      </div>
    </div>
  );
}
