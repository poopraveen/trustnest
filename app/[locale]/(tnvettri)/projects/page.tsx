import type { Metadata } from "next";
import { Link } from "@/navigation";
import { Briefcase, CheckCircle, Clock, AlertTriangle, XCircle, MapPin, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECTS as PROJ_DATA, DATA_SOURCES } from "@/lib/tn-official-data";
import FYSelectorBar from "@/components/FYSelectorBar";
import GovHeroBackground from "@/components/GovHeroBackground";

export const metadata: Metadata = { title: "Project Tracker | TN Vettri" };

const STAGE_COLORS = [
  { color: "bg-slate-400",   light: "bg-slate-50",   fg: "text-slate-700"   },
  { color: "bg-blue-500",    light: "bg-blue-50",    fg: "text-blue-700"    },
  { color: "bg-violet-500",  light: "bg-violet-50",  fg: "text-violet-700"  },
  { color: "bg-amber-500",   light: "bg-amber-50",   fg: "text-amber-700"   },
  { color: "bg-emerald-500", light: "bg-emerald-50", fg: "text-emerald-700" },
  { color: "bg-teal-500",    light: "bg-teal-50",    fg: "text-teal-700"    },
];

const STAGE_PIPELINE = PROJ_DATA.stageBreakdown.map((s, i) => ({
  stage: s.stage, count: s.count,
  pct: Math.round((s.count / PROJ_DATA.total) * 100),
  ...STAGE_COLORS[i % STAGE_COLORS.length],
}));

const STATUS_STATS = [
  { label: "On Track",  labelTa: "சரியான நேரத்தில்",  count: PROJ_DATA.onTrack,   pct: Math.round((PROJ_DATA.onTrack / PROJ_DATA.total) * 100),   color: "bg-emerald-500", light: "bg-emerald-50", fg: "text-emerald-700", icon: CheckCircle },
  { label: "Delayed",   labelTa: "தாமதமானது",          count: PROJ_DATA.delayed,   pct: Math.round((PROJ_DATA.delayed / PROJ_DATA.total) * 100),   color: "bg-amber-500",   light: "bg-amber-50",   fg: "text-amber-700",   icon: Clock },
  { label: "Stalled",   labelTa: "நிறுத்தப்பட்டது",    count: PROJ_DATA.stalled,   pct: Math.round((PROJ_DATA.stalled / PROJ_DATA.total) * 100),   color: "bg-red-500",     light: "bg-red-50",     fg: "text-red-700",     icon: AlertTriangle },
  { label: "Cancelled", labelTa: "ரத்து செய்யப்பட்டது", count: PROJ_DATA.cancelled, pct: Math.round((PROJ_DATA.cancelled / PROJ_DATA.total) * 100), color: "bg-slate-400",   light: "bg-slate-50",   fg: "text-slate-600",   icon: XCircle },
];

const PROJECTS = [
  {
    id: "P001", title: "Chennai Metro Phase 2 Extension",
    titleTa: "சென்னை மெட்ரோ இரண்டாம் கட்டம்",
    dept: "Transport", district: "Chennai", stage: "In Progress", status: "on-track",
    cost: 14600, spent: 9200, pct: 63, expectedEnd: "Dec 2025",
    contractor: "DMRC + L&T JV", tenderNo: "CMRL/2023/001",
  },
  {
    id: "P002", title: "Cauvery Drinking Water Supply Scheme",
    titleTa: "காவிரி குடிநீர் திட்டம்",
    dept: "Water Resources", district: "Coimbatore", stage: "In Progress", status: "delayed",
    cost: 8400, spent: 3800, pct: 45, expectedEnd: "Mar 2025",
    contractor: "TWAD Board", tenderNo: "TWAD/2023/045",
  },
  {
    id: "P003", title: "Smart School Buildings – 500 Govt Schools",
    titleTa: "500 அரசு பள்ளிகளில் நவீனமயமாக்கல்",
    dept: "School Education", district: "State-wide", stage: "In Progress", status: "on-track",
    cost: 2500, spent: 2100, pct: 84, expectedEnd: "Jun 2025",
    contractor: "TNSCERT Consortium", tenderNo: "SE/2024/112",
  },
  {
    id: "P004", title: "Madurai Outer Ring Road",
    titleTa: "மதுரை வெளி வட்ட சாலை",
    dept: "Transport", district: "Madurai", stage: "Tendered", status: "on-track",
    cost: 4800, spent: 180, pct: 4, expectedEnd: "Mar 2027",
    contractor: "Bid evaluation stage", tenderNo: "NHAI/TN/2024/018",
  },
  {
    id: "P005", title: "SIPCOT Industrial Park – Tiruppur",
    titleTa: "திருப்பூர் சிப்கோட் தொழில்நுட்ப பூங்கா",
    dept: "Industries", district: "Tiruppur", stage: "Work Order", status: "on-track",
    cost: 1200, spent: 120, pct: 10, expectedEnd: "Dec 2025",
    contractor: "TIDCO + KHD Infra", tenderNo: "SIPCOT/2024/037",
  },
  {
    id: "P006", title: "Flood Control – Kollidam Basin",
    titleTa: "கொள்ளிடம் வடிநில வெள்ளக்காப்பு",
    dept: "Water Resources", district: "Nagapattinam", stage: "In Progress", status: "stalled",
    cost: 3200, spent: 800, pct: 25, expectedEnd: "Jun 2024",
    contractor: "WAPCOS Ltd.", tenderNo: "WR/2023/089",
  },
  {
    id: "P007", title: "Primary Health Centre Upgradation – 300 PHCs",
    titleTa: "300 முதல்நிலை சுகாதார நிலையங்கள் மேம்பாடு",
    dept: "Health", district: "State-wide", stage: "Completed", status: "on-track",
    cost: 900, spent: 882, pct: 98, expectedEnd: "Sep 2024",
    contractor: "Multiple Agencies", tenderNo: "TNHRCE/2023/056",
  },
  {
    id: "P008", title: "Solar Rooftop – 10,000 Govt Buildings",
    titleTa: "10,000 அரசு கட்டிடங்களில் சோலார் பேனல்",
    dept: "Energy", district: "State-wide", stage: "In Progress", status: "on-track",
    cost: 1800, spent: 1450, pct: 81, expectedEnd: "Mar 2025",
    contractor: "TANGEDCO Consortium", tenderNo: "TANGEDCO/2024/021",
  },
];

const statusStyle = {
  "on-track": { bg: "bg-emerald-100", fg: "text-emerald-700", dot: "bg-emerald-500", label: "On Track" },
  "delayed":  { bg: "bg-amber-100",   fg: "text-amber-700",   dot: "bg-amber-500",   label: "Delayed" },
  "stalled":  { bg: "bg-red-100",     fg: "text-red-700",     dot: "bg-red-500",     label: "Stalled" },
};

export default function ProjectsPage() {
  const totalCost  = PROJECTS.reduce((s, p) => s + p.cost, 0);
  const totalSpent = PROJECTS.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <span>/</span><span>Projects</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Government Project Tracker</h1>
              <p className="text-green-200 mt-1 text-lg font-tamil">அரசு திட்ட கண்காணிப்பு</p>
              <p className="text-green-300 text-sm mt-2">7,916 projects · 43 departments · Source: PFMS, e-Governance TN</p>
            </div>
            <div className="flex gap-2">
              <a href="https://pfms.nic.in" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> PFMS Portal
              </a>
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {STATUS_STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="py-5 px-6 first:pl-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-4 h-4", s.fg)} />
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                  </div>
                  <p className="text-xs text-slate-400 font-tamil mb-1">{s.labelTa}</p>
                  <p className={cn("text-2xl font-bold font-data", s.fg)}>{s.count.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.pct}% of all projects</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness + FY selector */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "pfms-projects")!; return (
          <FYSelectorBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* Stage pipeline */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-2">Project Stage Pipeline</h2>
          <p className="text-xs text-slate-400 font-tamil mb-5">திட்ட நிலை குழாய்</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {STAGE_PIPELINE.map((s, i) => (
              <div key={s.stage} className={cn("rounded-xl p-4 text-center", s.light)}>
                <div className={cn("w-2 h-2 rounded-full mx-auto mb-2", s.color)} />
                <p className={cn("text-xl font-bold font-data", s.fg)}>{s.count.toLocaleString("en-IN")}</p>
                <p className="text-xs font-medium text-slate-600 mt-1 leading-tight">{s.stage}</p>
                <p className="text-xs text-slate-400">{s.pct}%</p>
                {i < STAGE_PIPELINE.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-5 overflow-hidden rounded-full h-2">
            {STAGE_PIPELINE.map(s => (
              <div key={s.stage} className={cn("h-full", s.color)} style={{ width: `${s.pct}%` }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {STAGE_PIPELINE.map(s => (
              <span key={s.stage} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={cn("w-2 h-2 rounded-full", s.color)} />{s.stage}
              </span>
            ))}
          </div>
        </div>

        {/* Cost overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Total Project Value",   labelTa: "மொத்த திட்ட மதிப்பு",  value: "₹2,18,400 Cr", sub: "Sanctioned cost across all projects",  color: "text-primary-700", bg: "bg-primary-50" },
            { label: "Amount Spent",          labelTa: "செலவழிக்கப்பட்டது",    value: "₹1,42,600 Cr", sub: "65.3% of total project cost",         color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Remaining (Contracted)",labelTa: "மீதமுள்ள தொகை",        value: "₹75,800 Cr",   sub: "34.7% pending disbursement",           color: "text-amber-700",   bg: "bg-amber-50" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-xl p-5", s.bg)}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-xs text-slate-400 font-tamil mt-0.5 mb-2">{s.labelTa}</p>
              <p className={cn("text-3xl font-bold font-data", s.color)}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Featured projects */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Featured Projects</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">முக்கியமான திட்டங்கள்</p>
            </div>
            <span className="text-xs text-slate-400">Showing 8 of 7,916</span>
          </div>
          <div className="divide-y divide-slate-100">
            {PROJECTS.map((p) => {
              const s = statusStyle[p.status as keyof typeof statusStyle];
              return (
                <div key={p.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">{p.title}</h3>
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0", s.bg, s.fg)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />{s.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-tamil mt-0.5">{p.titleTa}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.dept}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.district}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due {p.expectedEnd}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{p.stage}</span>
                      </div>
                    </div>
                    <div className="md:w-52 flex-shrink-0">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>₹{p.spent.toLocaleString("en-IN")} Cr spent</span>
                        <span className="font-semibold">{p.pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", s.dot)} style={{ width: `${p.pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>of ₹{p.cost.toLocaleString("en-IN")} Cr</span>
                        <span>{p.tenderNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all 7,916 projects →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
