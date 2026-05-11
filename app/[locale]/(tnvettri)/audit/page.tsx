import type { Metadata } from "next";
import { Link } from "@/navigation";
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Download, Eye, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { GRIEVANCES, TENDERS, BUDGET, SCHEMES, PROJECTS } from "@/lib/tn-official-data";

export const metadata: Metadata = { title: "Audit Trail | TN Vettri" };

const magalir = SCHEMES.find(s => s.id === "magalir-urimai")!;

const SOURCES = [
  { id: "tnbudget",  name: "tnbudget.tn.gov.in",  label: "Budget",      icon: "💰", records: 43,                          lastSync: BUDGET.lastUpdated,    health: "live"  },
  { id: "pfms",      name: "pfms.nic.in",          label: "Expenditure", icon: "📊", records: 3241800,                     lastSync: "May 2025",             health: "live"  },
  { id: "pgportal",  name: "pgportal.gov.in",      label: "Grievances",  icon: "📝", records: GRIEVANCES.totalFiled,       lastSync: GRIEVANCES.lastUpdated, health: "live"  },
  { id: "tenders",   name: "tenders.tn.gov.in",    label: "Procurement", icon: "📋", records: TENDERS.totalTenders,        lastSync: TENDERS.lastUpdated,    health: "live"  },
  { id: "pfms2",     name: "pfms.nic.in/projects", label: "Projects",    icon: "🏗️", records: PROJECTS.total,              lastSync: PROJECTS.lastUpdated,   health: "live"  },
  { id: "kmut",      name: "kmut.tn.gov.in",       label: "Magalir",     icon: "👩", records: magalir.beneficiaries,       lastSync: magalir.launched,       health: "live"  },
];

const ANOMALIES = [
  {
    id: "ANO-001", type: "SPEND_SPIKE", severity: "HIGH",
    dept: "Housing & Urban Dev.", title: "Spend spike in Q3 without proportional milestones",
    detail: "₹2,400 Cr released in Q3 but physical progress shows only 32% completion. Expected 55%.",
    detectedAt: "15 Jan 2025", status: "UNDER_REVIEW",
  },
  {
    id: "ANO-002", type: "VENDOR_CONCENTRATION", severity: "MEDIUM",
    dept: "Water Resources", title: "3 vendors awarded 78% of contracts in a single district",
    detail: "Ramanathapuram district — vendor concentration risk. 3 firms (common director) won 12 of 15 tenders.",
    detectedAt: "28 Feb 2025", status: "OPEN",
  },
  {
    id: "ANO-003", type: "DELAYED_WITH_FULL_PAYOUT", severity: "CRITICAL",
    dept: "Transport", title: "Project 60 months overdue — 95% payment released",
    detail: "Tirunelveli bypass road: sanctioned 2019, expected completion Dec 2022. ₹420 Cr (95%) paid.",
    detectedAt: "05 Mar 2025", status: "ESCALATED",
  },
  {
    id: "ANO-004", type: "BENEFICIARY_DUPLICATION", severity: "MEDIUM",
    dept: "Social Welfare", title: "1.2% potential duplicate Magalir Urimai beneficiaries",
    detail: "Cross-referencing Aadhaar with beneficiary DB flags ~1.57 lakh possible duplicates in 5 districts.",
    detectedAt: "12 Apr 2025", status: "UNDER_REVIEW",
  },
  {
    id: "ANO-005", type: "DATA_MISMATCH", severity: "LOW",
    dept: "School Education", title: "Breakfast scheme attendance data inconsistency",
    detail: "3 districts report >100% attendance rate in monthly returns. Likely data entry error.",
    detectedAt: "20 Apr 2025", status: "OPEN",
  },
];

const AUDIT_LOG = [
  { id: "AL-8821", actor: "System Auto-Sync",    action: "BUDGET_FETCH",       entity: "BudgetAllocation", note: "Fetched 43 dept budgets from tnbudget.tn.gov.in",  ts: "08 May 2025 02:00", source: "tnbudget" },
  { id: "AL-8820", actor: "Officer RK Sharma",   action: "ANOMALY_REVIEWED",   entity: "AnomalyFlag",      note: "ANO-003 reviewed; escalated to Secretary level",   ts: "07 May 2025 16:34", source: "manual" },
  { id: "AL-8819", actor: "System Auto-Sync",    action: "TENDER_FETCH",       entity: "Tender",           note: "Synced 1,240 new tenders from eProcurement portal", ts: "07 May 2025 06:00", source: "tenders" },
  { id: "AL-8818", actor: "Auditor VP Nathan",   action: "ANOMALY_FLAGGED",    entity: "AnomalyFlag",      note: "ANO-005 created: attendance data mismatch detected", ts: "20 Apr 2025 11:22", source: "manual" },
  { id: "AL-8817", actor: "System Auto-Sync",    action: "GRIEVANCE_SYNC",     entity: "Grievance",        note: "Updated 8,400 grievance statuses from pgportal",   ts: "08 May 2025 04:00", source: "pgportal" },
  { id: "AL-8816", actor: "Officer S Meena",     action: "PROJECT_UPDATED",    entity: "Project",          note: "P001 milestone 3 marked complete; evidence uploaded", ts: "06 May 2025 10:45", source: "manual" },
  { id: "AL-8815", actor: "System Auto-Sync",    action: "EXPENDITURE_FETCH",  entity: "ExpenditureRecord", note: "Apr 2025 expenditure data ingested from PFMS",      ts: "05 May 2025 08:00", source: "pfms" },
  { id: "AL-8814", actor: "Admin A Kumar",       action: "ANOMALY_CLOSED",     entity: "AnomalyFlag",      note: "ANO-008 (false positive) closed with audit note",   ts: "04 May 2025 14:10", source: "manual" },
];

const severityStyle: Record<string, { bg: string; fg: string; label: string }> = {
  CRITICAL: { bg: "bg-red-100",    fg: "text-red-700",    label: "Critical" },
  HIGH:     { bg: "bg-orange-100", fg: "text-orange-700", label: "High" },
  MEDIUM:   { bg: "bg-amber-100",  fg: "text-amber-700",  label: "Medium" },
  LOW:      { bg: "bg-blue-100",   fg: "text-blue-700",   label: "Low" },
};

const anomalyStatusStyle: Record<string, { bg: string; fg: string }> = {
  OPEN:         { bg: "bg-slate-100",   fg: "text-slate-700" },
  UNDER_REVIEW: { bg: "bg-amber-100",   fg: "text-amber-700" },
  ESCALATED:    { bg: "bg-red-100",     fg: "text-red-700" },
  CLOSED:       { bg: "bg-emerald-100", fg: "text-emerald-700" },
};

const anomalyTypeLabel: Record<string, string> = {
  SPEND_SPIKE: "Spend Spike",
  VENDOR_CONCENTRATION: "Vendor Concentration",
  DELAYED_WITH_FULL_PAYOUT: "Delayed + Full Pay",
  BENEFICIARY_DUPLICATION: "Duplicate Beneficiaries",
  DATA_MISMATCH: "Data Mismatch",
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white">Home</Link>
            <span>/</span><span>Audit</span>
          </div>
          <h1 className="text-3xl font-bold">Audit Trail & Data Provenance</h1>
          <p className="text-blue-200 mt-1 text-lg font-tamil">தணிக்கை சுவடு & தரவு ஆதாரம்</p>
          <p className="text-blue-300 text-sm mt-2">All data changes logged · Auto-sync from 6 official sources · Anomaly detection</p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Data Sources",      value: "6",       sub: "Official TN portals",        color: "text-primary-700" },
              { label: "Audit Records",     value: "44.2 Lakh",sub: "Logged operations",          color: "text-blue-700" },
              { label: "Open Anomalies",    value: "5",       sub: "Requiring review",             color: "text-amber-700" },
              { label: "Last Full Sync",    value: "08 May",  sub: "2025 · 04:00 AM",             color: "text-emerald-700" },
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

        {/* Data sources health */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Data Source Health</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">தரவு மூலம் நிலை</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              5 of 6 sources live
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
            {SOURCES.map((s) => (
              <div key={s.id} className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                      <p className="text-xs text-slate-400 font-data mt-0.5">{s.name}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                    s.health === "live" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.health === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                    {s.health === "live" ? "Live" : "Stale"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" />{s.records.toLocaleString("en-IN")} records</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Synced {s.lastSync}</span>
                </div>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", s.health === "live" ? "bg-emerald-400" : "bg-amber-400")} style={{ width: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly flags */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="text-base font-semibold text-slate-800">Anomaly Flags</h2>
                <p className="text-xs text-slate-400 font-tamil mt-0.5">முரண்பாடு கொடிகள்</p>
              </div>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">5 open</span>
          </div>
          <div className="divide-y divide-slate-100">
            {ANOMALIES.map((a) => {
              const sev = severityStyle[a.severity];
              const st  = anomalyStatusStyle[a.status] || anomalyStatusStyle.OPEN;
              return (
                <div key={a.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", sev.bg, sev.fg)}>
                          {sev.label}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {anomalyTypeLabel[a.type]}
                        </span>
                        <span className="text-xs text-slate-400 font-data">{a.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">{a.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{a.detail}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{a.dept}</span>
                        <span>Detected {a.detectedAt}</span>
                      </div>
                    </div>
                    <span className={cn("flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg", st.bg, st.fg)}>
                      {a.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit log */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">System Audit Log</h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">கணினி தணிக்கை பதிவு</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Log
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Log ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AUDIT_LOG.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-data text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{l.id}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">{l.actor}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded font-data",
                        l.action.includes("FETCH") ? "bg-blue-100 text-blue-700" :
                        l.action.includes("ANOMALY") ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      )}>{l.action}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs">{l.note}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-data whitespace-nowrap">{l.ts}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-medium",
                        l.source === "manual" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                      )}>{l.source === "manual" ? "Manual" : l.source}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            All actions are immutable and cryptographically signed. Audit logs retained for 7 years per RTI Act.
          </div>
        </div>

      </div>
    </div>
  );
}
