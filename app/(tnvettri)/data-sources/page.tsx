import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, ExternalLink, Clock, Database, RefreshCw,
  Shield, BookOpen, Code2, FileText, Globe, Info, ArrowRight,
  BarChart3, MapPin, Briefcase, Users, MessageSquare, FileSearch,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_SOURCES, AVAILABLE_YEARS, type DataSourceMeta } from "@/lib/tn-official-data";

export const metadata: Metadata = {
  title: "Data Sources & Methodology | Finance Department — Government of Tamil Nadu",
};

const healthConfig = {
  live:   { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",   label: "Live / Active",         pulse: true  },
  stale:  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200",       label: "May be outdated",       pulse: false },
  manual: { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50 border-blue-200",         label: "Manually verified",     pulse: false },
};

const MODULE_LINKS: Record<string, { href: string; label: string; icon: any; color: string }> = {
  budget:             { href: "/expenditure",  label: "Expenditure",  icon: BarChart3,     color: "text-blue-600 bg-blue-50"    },
  "pfms-expenditure": { href: "/expenditure",  label: "Expenditure",  icon: BarChart3,     color: "text-blue-600 bg-blue-50"    },
  "pfms-projects":    { href: "/projects",     label: "Projects",     icon: Briefcase,     color: "text-violet-600 bg-violet-50"},
  tenders:            { href: "/tenders",      label: "Tenders",      icon: FileSearch,    color: "text-amber-600 bg-amber-50"  },
  grievances:         { href: "/grievances",   label: "Grievances",   icon: MessageSquare, color: "text-rose-600 bg-rose-50"    },
  schemes:            { href: "/schemes",      label: "Schemes",      icon: Users,         color: "text-emerald-600 bg-emerald-50"},
  districts:          { href: "/scorecards",   label: "Scorecards",   icon: MapPin,        color: "text-teal-600 bg-teal-50"    },
  gsdp:               { href: "/tnvettri",     label: "Dashboard",    icon: BarChart3,     color: "text-primary-600 bg-primary-50"},
};

function fmtRecords(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

export default function DataSourcesPage() {
  const liveCount   = DATA_SOURCES.filter(s => s.health === "live").length;
  const totalRecords = DATA_SOURCES.reduce((a, s) => a + s.recordCount, 0);

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Finance Department Hero ─────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-green-300 text-xs mb-6">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Data Sources & Methodology</span>
          </div>

          {/* Identity block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg flex-shrink-0">
              <Image
                src="/images/tn-emblem.svg"
                alt="Government of Tamil Nadu Emblem"
                width={72}
                height={72}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">
                Government of Tamil Nadu
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">Finance Department</h1>
              <p className="text-green-200 text-base font-semibold mt-0.5">
                Public Financial Transparency — Data Sources & Methodology
              </p>
              <p className="text-green-300 text-xs mt-1 font-tamil">
                நிதித் துறை · தரவு மூலங்கள் மற்றும் முறைமை
              </p>
            </div>
          </div>

          {/* Key claims */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Official Sources",   value: DATA_SOURCES.length.toString(),       sub: "TN Govt portals only"    },
              { label: "Live Sources",       value: `${liveCount}/${DATA_SOURCES.length}`, sub: "Updated regularly"      },
              { label: "Total Records",      value: fmtRecords(totalRecords),              sub: "Across all datasets"    },
              { label: "FY Snapshots",       value: AVAILABLE_YEARS.length.toString(),     sub: "Years available"        },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                <p className="text-2xl font-bold font-data tabular-nums">{s.value}</p>
                <p className="text-xs font-semibold text-white mt-0.5">{s.label}</p>
                <p className="text-xs text-green-300">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Transparency notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">About "Live" Data Indicators</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              TN Vettri currently uses <strong>verified static snapshots</strong> — real figures from official government
              publications, manually cross-verified. The <span className="text-emerald-600 font-semibold">● Live</span> indicator
              means the source portal actively publishes updated data and our figures match the latest available report.
              Most TN government portals (tnbudget.tn.gov.in, pfms.nic.in) do not expose public REST APIs — data is
              obtained from published PDF/Excel documents and portal dashboards. Automated daily sync via cron jobs is
              on our roadmap (Step 3–5 below).
            </p>
          </div>
        </div>

        {/* Financial Year Snapshots */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-700" />
            Financial Year Snapshots
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Each module page has a FY selector in its data freshness bar. Select the year to see that period&apos;s data.
            Archived years show the snapshot as it was published by the government.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AVAILABLE_YEARS.map(y => (
              <div key={y.fy} className={cn(
                "rounded-xl border px-5 py-4 flex items-center gap-3",
                y.status === "live"
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              )}>
                <span className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  y.status === "live" ? "bg-emerald-400 animate-pulse" : "bg-slate-300"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{y.fy}</p>
                  <p className="text-xs text-slate-500">{y.status === "live" ? "Current financial year" : "Archived — read only"}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  y.status === "live"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                )}>
                  {y.status === "live" ? "Current" : "Archived"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All data sources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-green-700" />
              All Data Sources — Full Transparency
            </h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {DATA_SOURCES.length} sources
            </span>
          </div>

          <div className="space-y-4">
            {DATA_SOURCES.map((s: DataSourceMeta) => {
              const hc = healthConfig[s.health];
              const mod = MODULE_LINKS[s.id];
              return (
                <div key={s.id} className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">

                  {/* Source header */}
                  <div className={cn("px-6 py-3 border-b flex items-center gap-3", hc.bg)}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full flex-shrink-0",
                        hc.dot,
                        hc.pulse ? "animate-pulse" : ""
                      )} />
                      <span className={cn("text-xs font-bold", hc.text)}>{hc.label}</span>
                      <span className="text-slate-300">·</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1 truncate">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        {s.url.replace("https://", "")}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mod && (
                        <Link href={mod.href}
                          className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-current/20", mod.color)}>
                          <mod.icon className="w-3 h-3" />
                          {mod.label}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Source body */}
                  <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left — description + methodology */}
                    <div className="lg:col-span-2 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{s.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                      </div>

                      <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-1">How we obtained this data</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{s.methodology}</p>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-start gap-2 rounded-lg p-3",
                        s.apiAvailable ? "bg-violet-50" : "bg-orange-50"
                      )}>
                        <Code2 className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", s.apiAvailable ? "text-violet-500" : "text-orange-500")} />
                        <div>
                          <p className={cn("text-xs font-semibold mb-0.5", s.apiAvailable ? "text-violet-700" : "text-orange-700")}>
                            API: {s.apiAvailable ? "Available (with restrictions)" : "Not publicly available"}
                          </p>
                          <p className={cn("text-xs leading-relaxed", s.apiAvailable ? "text-violet-600" : "text-orange-600")}>
                            {s.apiNote}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right — metadata */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Source Details</p>
                      {[
                        { icon: RefreshCw,   label: "Update Frequency", value: s.updateFrequency },
                        { icon: Clock,       label: "Data Covers",      value: s.covers          },
                        { icon: CheckCircle, label: "Last Verified",    value: s.lastVerified    },
                        { icon: Database,    label: "Record Count",     value: fmtRecords(s.recordCount) },
                        { icon: FileText,    label: "License",          value: s.license         },
                      ].map(m => (
                        <div key={m.label} className="flex items-start gap-2">
                          <m.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{m.label}</p>
                            <p className="text-xs font-semibold text-slate-700">{m.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Sync Roadmap */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-green-700" />
            Roadmap to Fully Automated Live Data
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Planned architecture to replace static snapshots with real-time DB-backed data
          </p>
          <div className="space-y-3">
            {[
              {
                step: "1", done: true,
                title: "Prisma DB with time-series schema",
                desc: "BudgetAllocation, ExpenditureRecord, Scheme, Grievance, Tender, Project models with financialYear fields — ready for multi-year data.",
                tag: "Done",
              },
              {
                step: "2", done: true,
                title: "Central data file (lib/tn-official-data.ts)",
                desc: "All figures verified against official sources, structured as typed TypeScript exports. DATA_SOURCES registry with methodology for each source.",
                tag: "Done",
              },
              {
                step: "3", done: false,
                title: "data.gov.in API integration",
                desc: "Register at data.gov.in for a free API key. Pull Census, GSDP, and budget datasets via REST. Replace static DISTRICTS and MACRO objects.",
                tag: "Pending API key",
              },
              {
                step: "4", done: false,
                title: "PFMS nightly sync (GitHub Actions cron)",
                desc: "Cron job at 2 AM IST: fetch PFMS TN monthly expenditure PDF → parse with pdfjs → upsert ExpenditureRecord rows → invalidate page cache.",
                tag: "In design",
              },
              {
                step: "5", done: false,
                title: "tenders.tn.gov.in daily scrape",
                desc: "eProcurement portal is publicly browsable. Scrape active tenders daily with Playwright → store in Tender table → /tenders queries DB.",
                tag: "In design",
              },
              {
                step: "6", done: false,
                title: "pgportal.gov.in grievance sync",
                desc: "Monthly report download via CPGRAMS API (free, requires NIC registration) → Grievance stats table. Resolution rates auto-calculated.",
                tag: "Pending NIC reg.",
              },
              {
                step: "7", done: false,
                title: "Module pages query Prisma instead of static file",
                desc: "Replace lib/tn-official-data.ts imports with Prisma queries. FY selector passes year param to DB. Pages become fully dynamic.",
                tag: "Follows 3–6",
              },
            ].map(r => (
              <div key={r.step} className={cn(
                "flex items-start gap-4 p-4 rounded-xl border",
                r.done ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  r.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {r.done ? <CheckCircle className="w-4 h-4" /> : r.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-bold text-slate-800">{r.title}</p>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      r.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    )}>{r.tag}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License + Attribution */}
        <div className="bg-green-900 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex-shrink-0">
              <Image
                src="/images/tn-emblem.svg"
                alt="TN Emblem"
                width={48}
                height={48}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-300" />
                <p className="text-sm font-bold text-white">Open Government Data License (OGDL v2.0)</p>
              </div>
              <p className="text-xs text-green-200 leading-relaxed mb-3">
                All data is sourced from official portals of the Government of Tamil Nadu and the Government of India.
                Reproduction, redistribution, and commercial use is permitted with attribution to the respective
                department. TN Vettri is an independent transparency platform and is <strong>not an official
                Government of Tamil Nadu product</strong>. For official data, always refer directly to the source portals listed above.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://data.gov.in/government-open-data-license-india" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-300 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> OGDL v2.0 Full Text
                </a>
                <a href="https://tn.gov.in" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-300 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" /> tn.gov.in Official Portal
                </a>
                <a href="https://tnbudget.tn.gov.in" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-300 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> TN Budget Portal
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
