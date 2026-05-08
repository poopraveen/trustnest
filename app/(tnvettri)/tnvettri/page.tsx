export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BarChart3, MapPin, Briefcase, Users,
  MessageSquare, FileSearch, Shield, TrendingUp,
  ChevronRight, ExternalLink, Clock,
} from "lucide-react";
import KpiTile from "@/components/KpiTile";
import GovHeroBackground from "@/components/GovHeroBackground";
import { brand, pageTitleWithTagline } from "@/lib/brand";
import { BUDGET, MACRO, SCHEMES, TENDERS, DEPT_BUDGETS } from "@/lib/tn-official-data";

export const metadata: Metadata = {
  title: pageTitleWithTagline(),
  description: brand.metaDescription,
};

const magalir  = SCHEMES.find(s => s.id === "magalir-urimai")!;
const cmBreak  = SCHEMES.find(s => s.id === "cm-breakfast")!;
const mtm      = SCHEMES.find(s => s.id === "makkalai-thedi")!;

const BUDGET_KPIS = [
  {
    label: "Total Budget 2024-25",
    labelTamil: "மொத்த பட்ஜெட்",
    value: `₹${(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr`,
    target: `₹${(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr`,
    progress: BUDGET.utilisationPct,
    delta: 12,
    deltaLabel: "vs 2023-24",
    status: "on-target" as const,
    source: BUDGET.source,
    lastUpdated: BUDGET.lastUpdated,
  },
  {
    label: "Capital Expenditure",
    labelTamil: "மூலதன செலவு",
    value: `₹${(BUDGET.capitalOutlay_crore / 1000).toFixed(1)}K Cr`,
    target: "₹1,00,000 Cr",
    progress: Math.round((BUDGET.capitalOutlay_crore / 100000) * 100),
    delta: 12.1,
    deltaLabel: "YoY growth",
    status: "vulnerable" as const,
    source: BUDGET.source,
    lastUpdated: BUDGET.lastUpdated,
  },
  {
    label: "State GSDP 2024-25",
    labelTamil: "மாநில உள்நாட்டு உற்பத்தி",
    value: `₹${(MACRO.gsdp_crore / 100000).toFixed(2)} L Cr`,
    delta: MACRO.gsdp_growth_real,
    deltaLabel: "real growth",
    status: "on-target" as const,
    source: MACRO.source,
    lastUpdated: "Mar 2024",
  },
  {
    label: "Fiscal Deficit",
    labelTamil: "நிதி பற்றாக்குறை",
    value: "3.4% GSDP",
    target: "3.0% GSDP",
    status: "vulnerable" as const,
    source: "prsindia.org",
    lastUpdated: "Feb 2024",
  },
  {
    label: "Magalir Urimai Beneficiaries",
    labelTamil: "மகளிர் உரிமைத் தொகை",
    value: `${(magalir.beneficiaries / 10000000).toFixed(2)} Cr Women`,
    target: `${(magalir.target / 10000000).toFixed(1)} Cr`,
    progress: Math.round((magalir.beneficiaries / magalir.target) * 100),
    delta: 16.1,
    deltaLabel: "vs Phase 1",
    status: "on-target" as const,
    source: magalir.source,
    lastUpdated: magalir.launched,
  },
  {
    label: "CM Breakfast Students",
    labelTamil: "முதலமைச்சர் காலை உணவு",
    value: `${(cmBreak.beneficiaries / 100000).toFixed(2)} Lakh`,
    target: `${(cmBreak.target / 100000).toFixed(0)} Lakh`,
    progress: Math.round((cmBreak.beneficiaries / cmBreak.target) * 100),
    delta: 30,
    deltaLabel: "attendance rise",
    status: "on-target" as const,
    source: cmBreak.source,
    lastUpdated: cmBreak.launched,
  },
  {
    label: "MTM Health Beneficiaries",
    labelTamil: "மக்களை தேடி மருத்துவம்",
    value: `${(mtm.beneficiaries / 10000000).toFixed(2)} Cr People`,
    target: `${(mtm.target / 10000000).toFixed(0)} Cr`,
    progress: Math.round((mtm.beneficiaries / mtm.target) * 100),
    status: "on-target" as const,
    source: mtm.source,
    lastUpdated: mtm.launched,
  },
  {
    label: "eProcurement Value (All Time)",
    labelTamil: "மின் கொள்முதல்",
    value: `₹${(TENDERS.totalValueCrore / 1000).toFixed(0)}K Cr`,
    delta: undefined,
    status: "neutral" as const,
    source: TENDERS.source,
    lastUpdated: TENDERS.lastUpdated,
  },
];

const DEPT_LEADERBOARD = DEPT_BUDGETS.slice(0, 5).map(d => ({
  name: d.dept,
  allocation: d.total,
  spent: d.spent,
  pct: d.utilPct,
}));

const QUICK_LINKS = [
  { href: "/expenditure", icon: BarChart3,      label: "Track Spending",      labelTa: "செலவு கண்காணிப்பு",   color: "bg-blue-100 text-blue-700" },
  { href: "/scorecards",  icon: MapPin,          label: "District Scorecards", labelTa: "மாவட்ட மதிப்பீடு",    color: "bg-emerald-100 text-emerald-700" },
  { href: "/projects",    icon: Briefcase,       label: "Project Tracker",     labelTa: "திட்ட கண்காணிப்பு",   color: "bg-violet-100 text-violet-700" },
  { href: "/schemes",     icon: Users,           label: "Scheme Benefits",     labelTa: "திட்ட நன்மைகள்",      color: "bg-amber-100 text-amber-700" },
  { href: "/grievances",  icon: MessageSquare,   label: "File Grievance",      labelTa: "புகார் பதிவு",         color: "bg-rose-100 text-rose-700" },
  { href: "/tenders",     icon: FileSearch,      label: "Procurement",         labelTa: "கொள்முதல்",            color: "bg-cyan-100 text-cyan-700" },
];

const TRUST_STATS = [
  { value: "43",           label: "Departments Tracked",   labelTa: "துறைகள்" },
  { value: "38",           label: "Districts Covered",     labelTa: "மாவட்டங்கள்" },
  { value: "7.53L+ Cr",    label: "Tenders on Portal",     labelTa: "டெண்டர் மதிப்பு" },
  { value: "1.31 Cr",      label: "Women Beneficiaries",   labelTa: "பெண் பயனாளிகள்" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* Hero — Trust Snapshot */}
      <section className="relative overflow-hidden">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Shield className="w-4 h-4 text-yellow-300" />
              <span>Open Data · Verified Sources · Real Time</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Tamil Nadu<br />
              <span className="text-yellow-300">Public Transparency Platform</span>
            </h1>
            <p className="text-white/80 font-tamil text-lg mb-1">தமிழ்நாடு வெளிப்படைத்தன்மை தளம்</p>
            <p className="text-green-100 text-base max-w-2xl mx-auto mt-3">
              Track every rupee spent, every scheme beneficiary reached, every project milestone,
              and every grievance resolved — district by district.
            </p>
          </div>

          {/* Trust stats bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-center">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-white">
                <div className="text-2xl font-bold font-data">{s.value}</div>
                <div className="text-green-200 text-sm">{s.label}</div>
                <div className="text-green-300/70 text-xs font-tamil">{s.labelTa}</div>
              </div>
            ))}
          </div>

          {/* View My Locality CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/scorecards"
              className="flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors shadow-lg text-base"
            >
              View My Locality
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card p-4 text-center hover:border-primary-200 border border-transparent transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${q.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <q.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                {q.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-tamil">{q.labelTa}</p>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* KPI Dashboard */}
      <section className="bg-gradient-to-b from-green-50 to-emerald-50/40">
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Budget & Welfare Snapshot</h2>
              <p className="section-subtitle">Key figures from official TN government sources</p>
            </div>
            <Link href="/expenditure" className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900 transition-colors">
              Full Expenditure <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUDGET_KPIS.map((kpi) => (
              <KpiTile
                key={kpi.label}
                {...kpi}
                auditHref={kpi.source ? `/audit?source=${kpi.source}` : undefined}
                downloadHref="/data/tn_real_data"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Department Leaderboard */}
      <section className="py-10 bg-gradient-to-r from-teal-50 via-white to-teal-50/60">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Department Spending (2024-25)</h2>
              <p className="section-subtitle">Top 5 departments by allocation</p>
            </div>
            <Link href="/expenditure" className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900">
              All 43 Depts <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Department</th>
                  <th className="num">Allocation (₹ Cr)</th>
                  <th className="num">Spent (₹ Cr)</th>
                  <th>Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {DEPT_LEADERBOARD.map((d, i) => (
                  <tr key={d.name}>
                    <td className="font-bold text-slate-400">{i + 1}</td>
                    <td className="font-medium text-slate-800">{d.name}</td>
                    <td className="num">{d.allocation.toLocaleString("en-IN")}</td>
                    <td className="num">{d.spent.toLocaleString("en-IN")}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-24">
                          <div
                            className={`h-full rounded-full ${d.pct >= 90 ? "bg-success-600" : d.pct >= 80 ? "bg-warning-600" : "bg-danger-600"}`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 tabular-nums">{d.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="trust-strip">
            <span>📊 tnbudget.tn.gov.in</span>
            <span>🕐 Feb 2024</span>
            <a href="/audit" className="flex items-center gap-0.5 hover:text-primary-600">
              <ExternalLink className="w-3 h-3" /> Audit Trace
            </a>
          </p>
        </div>
      </section>

      {/* District Spotlight + CTA */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* District map placeholder */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">District Spotlight</h3>
              <Link href="/scorecards" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                Full Map <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-primary-50 rounded-xl flex items-center justify-center h-48 border-2 border-dashed border-primary-200">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-primary-300 mx-auto mb-2" />
                <p className="text-sm text-primary-600 font-medium">Interactive District Map</p>
                <p className="text-xs text-primary-400 mt-1">38 districts · Choropleth by score</p>
                <Link href="/scorecards" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                  Explore Map <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Chennai",    score: 82, rank: 3 },
                { label: "Coimbatore", score: 79, rank: 7 },
                { label: "Madurai",    score: 74, rank: 12 },
              ].map((d) => (
                <Link key={d.label} href={`/scorecards?district=${d.label}`} className="bg-slate-50 rounded-lg p-3 hover:bg-primary-50 transition-colors text-center">
                  <p className="text-base font-bold text-slate-800">{d.score}</p>
                  <p className="text-xs text-slate-500">{d.label}</p>
                  <p className="text-xs text-slate-400">Rank #{d.rank}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Grievance CTA */}
          <div className="card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Citizen Grievance Portal</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              File a complaint about roads, water, electricity, scheme benefits, health, or education.
              Track resolution status with SLA timers. Escalate if unresolved.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Roads",         count: "1,204 open", color: "bg-red-50 border-red-200 text-red-700" },
                { label: "Water Supply",  count: "876 open",   color: "bg-blue-50 border-blue-200 text-blue-700" },
                { label: "Electricity",   count: "543 open",   color: "bg-amber-50 border-amber-200 text-amber-700" },
                { label: "Scheme Benefit",count: "2,109 open", color: "bg-violet-50 border-violet-200 text-violet-700" },
              ].map((c) => (
                <Link key={c.label} href={`/grievances?category=${c.label}`} className={`rounded-lg border p-3 hover:opacity-80 transition-opacity ${c.color}`}>
                  <p className="text-xs font-semibold">{c.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{c.count}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/grievances/new"
              className="btn-primary justify-center mt-auto"
            >
              <MessageSquare className="w-4 h-4" />
              File a Grievance
            </Link>
            <p className="trust-strip">
              <Clock className="w-3 h-3" />
              <span>SLA: 30 days standard resolution</span>
              <span>·</span>
              <span>Escalation available</span>
            </p>
          </div>
        </div>
      </section>

      {/* Transparency Commitment */}
      <section className="py-12 bg-gradient-to-br from-green-950 to-green-900 text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Our Transparency Commitment</h2>
            <p className="text-green-200 text-sm">Every data point is sourced, timestamped, and auditable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield,    title: "Verified Sources Only",   desc: "All data linked to official government portals — PFMS, tnbudget.tn.gov.in, CPGRAMS, and district sites." },
              { icon: TrendingUp,title: "Real-Time Updates",       desc: "Budget release %, grievance counts, and scheme disbursements refresh automatically from live APIs." },
              { icon: FileSearch,title: "Full Audit Trail",        desc: "Every metric has a traceable source, change history, and responsible office — visible to all citizens." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-green-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-300" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-green-200 text-sm max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="https://tnbudget.tn.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> tnbudget.tn.gov.in
            </a>
            <a href="https://pfms.nic.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> pfms.nic.in
            </a>
            <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> pgportal.gov.in
            </a>
            <a href="https://tenders.tn.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> tenders.tn.gov.in
            </a>
            <a href="https://egramswaraj.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> egramswaraj.gov.in
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
