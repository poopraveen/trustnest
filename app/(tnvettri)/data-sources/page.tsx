import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle, ExternalLink, AlertCircle, Clock, Database,
  RefreshCw, Shield, BookOpen, Code2, FileText, Globe, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_SOURCES, AVAILABLE_YEARS, type DataSourceMeta } from "@/lib/tn-official-data";

export const metadata: Metadata = { title: "Data Sources & Methodology | TN Vettri" };

const healthConfig = {
  live:   { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-100", label: "Live / Active" },
  stale:  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-100",   label: "May be outdated" },
  manual: { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-100",    label: "Manually verified" },
};

function fmtRecords(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

const MODULE_LINKS: Record<string, string> = {
  budget:            "/expenditure",
  "pfms-expenditure": "/expenditure",
  "pfms-projects":   "/projects",
  tenders:           "/tenders",
  grievances:        "/grievances",
  schemes:           "/schemes",
  districts:         "/scorecards",
  gsdp:              "/tnvettri",
};

export default function DataSourcesPage() {
  const liveCount   = DATA_SOURCES.filter(s => s.health === "live").length;
  const totalRecords = DATA_SOURCES.reduce((a, s) => a + s.recordCount, 0);

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Data Sources</span>
          </div>
          <h1 className="text-3xl font-bold">Data Sources & Methodology</h1>
          <p className="text-blue-200 mt-1 text-lg font-tamil">தரவு மூலங்கள் மற்றும் முறைமை</p>
          <p className="text-blue-300 text-sm mt-2">
            Full transparency on where every number comes from, how it is verified, and how fresh it is.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Official Sources",     value: DATA_SOURCES.length.toString(), sub: "TN Govt portals only",           fg: "text-primary-700"  },
              { label: "Live Sources",          value: `${liveCount}/${DATA_SOURCES.length}`, sub: "Updated regularly",      fg: "text-emerald-700"  },
              { label: "Total Records",         value: fmtRecords(totalRecords),              sub: "Across all datasets",    fg: "text-blue-700"     },
              { label: "Financial Years",       value: AVAILABLE_YEARS.length.toString(),     sub: "Available for selection", fg: "text-violet-700"  },
            ].map(s => (
              <div key={s.label} className="py-5 px-6 first:pl-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className={cn("text-2xl font-bold font-data tabular-nums mt-1", s.fg)}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Important disclaimer */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">About Data Freshness</p>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              TN Vettri currently uses <strong>verified static snapshots</strong> of official government data — real figures
              from official publications, cross-verified and hardcoded. This is because most TN government portals
              (tnbudget.tn.gov.in, pfms.nic.in) do not publish open REST APIs. The "live" indicator means the source
              portal publishes data regularly and our figures match the most recent published report.
              Automated sync via cron jobs + Prisma DB is on our roadmap (see below).
            </p>
          </div>
        </div>

        {/* Financial year selector info */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Financial Year Snapshots Available
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Each module page has a FY selector in its data freshness bar. Select a year to view that period&apos;s data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AVAILABLE_YEARS.map(y => (
              <div key={y.fy} className={cn(
                "rounded-lg border px-4 py-3 flex items-center gap-3",
                y.status === "live" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
              )}>
                <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", y.status === "live" ? "bg-emerald-400 animate-pulse" : "bg-slate-300")} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{y.fy}</p>
                  <p className="text-xs text-slate-500">{y.label.replace(`FY ${y.fy} `, "")}</p>
                </div>
                {y.status === "archived" && (
                  <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Archived</span>
                )}
                {y.status === "live" && (
                  <span className="ml-auto text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Source cards */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary-600" />
            All Data Sources — Full Transparency
          </h2>
          <div className="space-y-4">
            {DATA_SOURCES.map((s: DataSourceMeta) => {
              const hc = healthConfig[s.health];
              const moduleLink = MODULE_LINKS[s.id];
              return (
                <div key={s.id} className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                          <ExternalLink className="w-3 h-3" />{s.url.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", hc.bg, hc.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", hc.dot)} />
                        {hc.label}
                      </span>
                      {moduleLink && (
                        <Link href={moduleLink}
                          className="text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                          View module
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Description + methodology */}
                    <div className="md:col-span-2 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                      <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-0.5">Methodology</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{s.methodology}</p>
                        </div>
                      </div>
                      {s.apiNote && (
                        <div className="flex items-start gap-2 bg-violet-50 rounded-lg p-3">
                          <Code2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-violet-700 mb-0.5">
                              API Status: {s.apiAvailable ? "Available" : "Not publicly available"}
                            </p>
                            <p className="text-xs text-violet-600 leading-relaxed">{s.apiNote}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata grid */}
                    <div className="space-y-2">
                      {[
                        { icon: RefreshCw,   label: "Update freq.",   value: s.updateFrequency },
                        { icon: Clock,       label: "Covers",         value: s.covers },
                        { icon: CheckCircle, label: "Last verified",  value: s.lastVerified },
                        { icon: Database,    label: "Records",        value: fmtRecords(s.recordCount) },
                        { icon: FileText,    label: "License",        value: s.license },
                      ].map(m => (
                        <div key={m.label} className="flex items-center gap-2 text-xs">
                          <m.icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-500 w-24 flex-shrink-0">{m.label}</span>
                          <span className="font-semibold text-slate-700">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap — live sync */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary-600" />
            Live Sync Roadmap
          </h2>
          <p className="text-xs text-slate-400 mb-5">Planned architecture to make data fully automated and real-time</p>
          <div className="space-y-3">
            {[
              {
                step: "1", title: "Prisma DB with time-series tables",
                desc: "Store each snapshot as a dated row — enables historical comparisons across FYs.",
                status: "done", statusLabel: "Schema ready",
              },
              {
                step: "2", title: "data.gov.in API integration",
                desc: "Register for free API key at data.gov.in to pull Census, GSDP, and budget datasets on demand.",
                status: "planned", statusLabel: "Pending API key",
              },
              {
                step: "3", title: "Nightly PFMS scrape job",
                desc: "GitHub Actions cron job at 2 AM IST to fetch PFMS TN monthly expenditure PDFs → parse → upsert to DB.",
                status: "planned", statusLabel: "In design",
              },
              {
                step: "4", title: "tenders.tn.gov.in daily sync",
                desc: "eProcurement portal is publicly browsable — scrape active tenders daily and store in Tender table.",
                status: "planned", statusLabel: "In design",
              },
              {
                step: "5", title: "pgportal.gov.in grievance sync",
                desc: "Monthly report download from CPGRAMS API (free, requires NIC registration) → grievance stats table.",
                status: "planned", statusLabel: "Pending registration",
              },
              {
                step: "6", title: "Module pages query DB instead of static file",
                desc: "Replace lib/tn-official-data.ts imports with Prisma queries. FY selector queries DB for that year's rows.",
                status: "planned", statusLabel: "Follows step 3–5",
              },
            ].map(r => (
              <div key={r.step} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  r.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                )}>
                  {r.status === "done" ? <CheckCircle className="w-4 h-4" /> : r.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      r.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    )}>{r.statusLabel}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License + attribution */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Open Government Data License (OGDL v2.0)</p>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              All data is sourced from official Government of Tamil Nadu portals and the Government of India open data platform.
              Reproduction, redistribution, and commercial use is permitted with attribution to the respective department.
              TN Vettri is an independent transparency platform and is not affiliated with the Government of Tamil Nadu.
            </p>
            <a href="https://data.gov.in/government-open-data-license-india" target="_blank" rel="noopener noreferrer"
              className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-2 hover:text-emerald-900">
              <ExternalLink className="w-3 h-3" /> Read full OGDL license
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
