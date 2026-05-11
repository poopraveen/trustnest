import type { Metadata } from "next";
import { Link } from "@/navigation";
import { Database, Download, ExternalLink, RefreshCw, FileJson, FileText, Globe, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Open Data | TN Vettri" };

const DATASETS = [
  {
    id: "budget-2425",
    name: "TN State Budget 2024-25",
    nameTa: "தமிழ்நாடு மாநில பட்ஜெட் 2024-25",
    category: "Finance",
    source: "tnbudget.tn.gov.in",
    records: 43,
    lastUpdated: "Feb 2025",
    format: ["CSV", "JSON", "PDF"],
    license: "Open Government Data",
    freshness: "live",
    desc: "Department-wise budget allocations, revenue & capital expenditure for FY 2024-25.",
  },
  {
    id: "expenditure-pfms",
    name: "PFMS Expenditure Records – TN",
    nameTa: "பி.எஃப்.எம்.எஸ் செலவின ஆவணங்கள்",
    category: "Finance",
    source: "pfms.nic.in",
    records: 3241800,
    lastUpdated: "May 2025",
    format: ["CSV", "API"],
    license: "OGDL v2.0",
    freshness: "live",
    desc: "Monthly expenditure records by district, department, and scheme. Updated daily.",
  },
  {
    id: "districts-38",
    name: "38 Districts – Demographic & Geographic Data",
    nameTa: "38 மாவட்டங்கள் – மக்கள்தொகை & புவியியல்",
    category: "Geography",
    source: "census.gov.in + data.gov.in",
    records: 38,
    lastUpdated: "Mar 2024",
    format: ["CSV", "JSON", "GeoJSON"],
    license: "Open Government Data",
    freshness: "live",
    desc: "Population, area, HQ coordinates, literacy rates, and demographic breakdown for all 38 TN districts.",
  },
  {
    id: "departments-43",
    name: "43 Government Departments Directory",
    nameTa: "43 அரசு துறை கோப்பகம்",
    category: "Governance",
    source: "tn.gov.in",
    records: 43,
    lastUpdated: "Jan 2025",
    format: ["CSV", "JSON"],
    license: "Open Government Data",
    freshness: "live",
    desc: "Complete directory of TN government departments with codes, heads, and contact information.",
  },
  {
    id: "schemes-9",
    name: "Welfare Schemes Beneficiary Data",
    nameTa: "நலத்திட்ட பயனாளி தரவு",
    category: "Social Welfare",
    source: "tnsocialwelfare.tn.gov.in",
    records: 57800000,
    lastUpdated: "Feb 2026",
    format: ["CSV", "JSON"],
    license: "OGDL v2.0",
    freshness: "live",
    desc: "Beneficiary counts, disbursement amounts, and target vs actual for 9 flagship welfare schemes.",
  },
  {
    id: "tenders-all",
    name: "eProcurement Tenders – All Time",
    nameTa: "மின் கொள்முதல் டெண்டர்கள்",
    category: "Procurement",
    source: "tenders.tn.gov.in",
    records: 753374,
    lastUpdated: "May 2025",
    format: ["CSV", "JSON", "API"],
    license: "Open Government Data",
    freshness: "live",
    desc: "7,53,374 tenders totalling ₹7,53,403 Cr. Includes tender details, bidder count, award status.",
  },
  {
    id: "grievances-stats",
    name: "Grievance Resolution Statistics",
    nameTa: "புகார் தீர்வு புள்ளிவிவரங்கள்",
    category: "Governance",
    source: "pgportal.gov.in",
    records: 342180,
    lastUpdated: "May 2025",
    format: ["CSV", "JSON"],
    license: "OGDL v2.0",
    freshness: "live",
    desc: "District and category-wise grievance counts, resolution rates, and SLA compliance for FY 2024-25.",
  },
  {
    id: "projects-pfms",
    name: "Government Projects – PFMS",
    nameTa: "அரசு திட்டங்கள் – பி.எஃப்.எம்.எஸ்",
    category: "Projects",
    source: "pfms.nic.in",
    records: 7916,
    lastUpdated: "May 2025",
    format: ["CSV", "JSON", "API"],
    license: "Open Government Data",
    freshness: "live",
    desc: "7,916 active government projects with stage, cost, expenditure, contractor, and milestone data.",
  },
  {
    id: "gsdp-macro",
    name: "TN GSDP & Macro Indicators",
    nameTa: "தமிழ்நாடு மொத்த மாநில உற்பத்தி",
    category: "Economics",
    source: "mospi.gov.in + rbi.org.in",
    records: 120,
    lastUpdated: "Mar 2024",
    format: ["CSV", "Excel"],
    license: "Open Government Data",
    freshness: "live",
    desc: "GSDP growth (₹31.55 L Cr, 11.19% real growth), sector-wise contribution, and 10-year trend.",
  },
  {
    id: "sla-records",
    name: "Department SLA Performance Records",
    nameTa: "துறை SLA செயல்திறன் பதிவுகள்",
    category: "Governance",
    source: "tn.gov.in internal",
    records: 2148,
    lastUpdated: "May 2025",
    format: ["CSV", "JSON"],
    license: "OGDL v2.0",
    freshness: "live",
    desc: "KPI-level SLA tracking for all 43 departments with target, actual, status, and trend data.",
  },
];

const CATEGORIES = DATASETS.map(d => d.category).filter((v, i, a) => a.indexOf(v) === i);

const categoryColor: Record<string, string> = {
  Finance:       "bg-blue-100 text-blue-700",
  Geography:     "bg-emerald-100 text-emerald-700",
  Governance:    "bg-violet-100 text-violet-700",
  "Social Welfare": "bg-rose-100 text-rose-700",
  Procurement:   "bg-amber-100 text-amber-700",
  Projects:      "bg-orange-100 text-orange-700",
  Economics:     "bg-teal-100 text-teal-700",
};

function fmtRecords(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function DataPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white">Home</Link>
            <span>/</span><span>Open Data</span>
          </div>
          <h1 className="text-3xl font-bold">TN Open Data Catalog</h1>
          <p className="text-blue-200 mt-1 text-lg font-tamil">தமிழ்நாடு திறந்த தரவு அடைவு</p>
          <p className="text-blue-300 text-sm mt-2">10 datasets · 6 official sources · Free to use under Open Government Data License</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Total Datasets",   value: "10",        sub: "Updated regularly",        color: "text-primary-700" },
              { label: "Total Records",    value: "9.1 Cr+",   sub: "Across all datasets",      color: "text-blue-700" },
              { label: "Live Sources",     value: "6",         sub: "Official govt portals",    color: "text-emerald-700" },
              { label: "API Endpoints",    value: "4",         sub: "RESTful JSON APIs",        color: "text-violet-700" },
            ].map(s => (
              <div key={s.label} className="py-5 px-6 first:pl-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className={cn("text-2xl font-bold font-data tabular-nums mt-1", s.color)}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* License notice */}
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Open Government Data License (OGDL v2.0)</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              All datasets are freely available for non-commercial and commercial use with attribution.
              Source data belongs to respective TN government departments.
            </p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs font-semibold bg-primary-600 text-white rounded-full">All ({DATASETS.length})</span>
          {CATEGORIES.map(c => (
            <span key={c} className={cn("px-3 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity", categoryColor[c] || "bg-slate-100 text-slate-600")}>
              {c}
            </span>
          ))}
        </div>

        {/* Dataset cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DATASETS.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 flex flex-col">
              <div className="p-5 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{d.name}</h3>
                      <p className="text-xs text-slate-400 font-tamil mt-0.5">{d.nameTa}</p>
                    </div>
                  </div>
                  <span className={cn("flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full", categoryColor[d.category] || "bg-slate-100 text-slate-600")}>
                    {d.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">{d.desc}</p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-700">{fmtRecords(d.records)}</span> records
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    Updated {d.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {d.source}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-600 font-medium">Live</span>
                  </span>
                </div>

                {/* Format badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {d.format.map(f => (
                    <span key={f} className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1",
                      f === "JSON" ? "bg-amber-100 text-amber-700" :
                      f === "CSV" ? "bg-blue-100 text-blue-700" :
                      f === "API" ? "bg-violet-100 text-violet-700" :
                      f === "GeoJSON" ? "bg-emerald-100 text-emerald-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {f === "JSON" ? <FileJson className="w-3 h-3" /> : f === "CSV" ? <FileText className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">{d.license}</span>
                <div className="flex items-center gap-2">
                  <a href={`https://${d.source}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Source
                  </a>
                  <button className="flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API info */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1">REST API Access</h2>
          <p className="text-xs text-slate-400 mb-4">Machine-readable endpoints for developers and researchers</p>
          <div className="space-y-2">
            {[
              { method: "GET", path: "/api/v1/budget?year=2024-25", desc: "Budget allocations by department" },
              { method: "GET", path: "/api/v1/expenditure?dept=&district=&month=", desc: "Filtered expenditure records" },
              { method: "GET", path: "/api/v1/projects?status=&stage=", desc: "Project list with stage & progress" },
              { method: "GET", path: "/api/v1/schemes?id=", desc: "Scheme beneficiary data" },
            ].map(ep => (
              <div key={ep.path} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 font-data text-xs">
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-bold flex-shrink-0">{ep.method}</span>
                <span className="text-primary-700 font-semibold flex-1 truncate">{ep.path}</span>
                <span className="text-slate-400 hidden sm:block">{ep.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Free to use · No authentication required · Rate limit: 1000 req/day
          </p>
        </div>

      </div>
    </div>
  );
}
