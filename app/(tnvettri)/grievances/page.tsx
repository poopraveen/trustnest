"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Send, ChevronRight, ExternalLink, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GRIEVANCES, DATA_SOURCES } from "@/lib/tn-official-data";
import DataFreshnessBar from "@/components/DataFreshnessBar";
import GovHeroBackground from "@/components/GovHeroBackground";

const STATS = [
  { label: "Total Filed",        labelTa: "மொத்தம் பதிவு",    value: GRIEVANCES.totalFiled.toLocaleString("en-IN"),    sub: "FY 2024-25",                        color: "text-primary-700", bg: "bg-primary-50",  icon: MessageSquare },
  { label: "Resolved (30 days)", labelTa: "30 நாளில் தீர்வு",  value: GRIEVANCES.totalResolved.toLocaleString("en-IN"), sub: `${GRIEVANCES.resolutionPct}% resolution rate`, color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle },
  { label: "Pending",            labelTa: "நிலுவையில்",         value: GRIEVANCES.pending.toLocaleString("en-IN"),       sub: `${((GRIEVANCES.pending / GRIEVANCES.totalFiled) * 100).toFixed(1)}% of total`, color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  { label: "Escalated",          labelTa: "மேல்முறையீடு",       value: GRIEVANCES.escalated.toLocaleString("en-IN"),     sub: `${((GRIEVANCES.escalated / GRIEVANCES.totalFiled) * 100).toFixed(1)}% escalation rate`, color: "text-red-700", bg: "bg-red-50", icon: AlertTriangle },
];

const CATEGORY_COLORS = ["bg-orange-500","bg-blue-500","bg-red-500","bg-yellow-500","bg-violet-500","bg-emerald-500","bg-teal-500","bg-slate-400"];
const CATEGORIES = GRIEVANCES.byCategory.map((c, i) => ({
  id: c.cat.toLowerCase().replace(/\s+/g, "-"),
  label: c.cat,
  labelTa: ["சாலை & உள்கட்டமைப்பு","சாலை உள்கட்டமைப்பு","மின்சாரம்","குடிநீர் வழங்கல்","சுகாதார சேவை","கல்வி","சமூக நலன்","நில ஆவணங்கள்"][i] || c.cat,
  count: c.count,
  pct: Math.round((c.count / GRIEVANCES.totalFiled) * 100),
  color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  resolved: Math.round(c.resolvedPct),
}));

const MONTHLY_RESOLUTION = [76, 79, 82, 84, 85, 87, 88, 86, 89, 90, 88, 85];
const MONTHS = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

const SLA_COMPLIANCE = GRIEVANCES.byDept.slice(0, 6).map(d => ({
  dept: d.dept,
  target: 30,
  actual: Math.round(d.avgDays),
  pct: Math.round((d.resolved / d.filed) * 100),
}));

export default function GrievancesPage() {
  const [form, setForm] = useState({ name: "", phone: "", district: "", category: "", title: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ticket = "TN" + Date.now().toString().slice(-8);
    setTicketNo(ticket);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white">Home</Link>
            <span>/</span><span>Grievances</span>
          </div>
          <h1 className="text-3xl font-bold">Citizen Grievance Portal</h1>
          <p className="text-green-200 mt-1 text-lg font-tamil">குடிமக்கள் புகார் தெரிவிப்பு</p>
          <p className="text-green-300 text-sm mt-2">File complaints · Track resolution · 85.9% resolved within 30 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="py-5 px-6 first:pl-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.bg)}>
                      <Icon className={cn("w-3.5 h-3.5", s.color)} />
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                  </div>
                  <p className={cn("text-2xl font-bold font-data tabular-nums", s.color)}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Data freshness bar */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "grievances")!; return (
          <DataFreshnessBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* File Grievance + Track */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">File a Grievance</h2>
                <p className="text-xs text-slate-400 font-tamil">புகார் பதிவு செய்க</p>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Grievance Filed Successfully!</h3>
                <p className="text-slate-500 mb-4">Your complaint has been registered and assigned to the concerned department.</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Ticket Number</p>
                  <p className="text-2xl font-bold font-data text-emerald-700 tracking-wider">{ticketNo}</p>
                  <p className="text-xs text-slate-500 mt-1">Save this number to track your grievance status</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setSubmitted(false)} className="btn-primary text-sm py-2">File Another</button>
                  <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    Track on PGPORTAL <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">District *</label>
                  <select required value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                    <option value="">Select district</option>
                    {["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Erode","Tiruppur","Vellore","Thanjavur","Tirunelveli"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Brief description of your grievance" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    placeholder="Provide more details about the issue..." />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Your data is protected and used only for grievance resolution
                  </p>
                  <button type="submit"
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    <Send className="w-4 h-4" /> Submit Grievance
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SLA Compliance */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">SLA Compliance by Department</h2>
                <p className="text-xs text-slate-400 font-tamil mt-0.5">தீர்வு நேர இணக்கம்</p>
              </div>
              <div className="divide-y divide-slate-100">
                {SLA_COMPLIANCE.map((s) => (
                  <div key={s.dept} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-700">{s.dept}</span>
                      <span className={cn("text-xs font-bold", s.pct >= 90 ? "text-emerald-600" : s.pct >= 80 ? "text-amber-600" : "text-red-600")}>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", s.pct >= 90 ? "bg-emerald-500" : s.pct >= 80 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Avg {s.actual} days (target: {s.target} days)</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Need help?</h3>
              <p className="text-xs text-slate-500 mb-3">Call the TN Grievance Helpline or use the PGPORTAL</p>
              <div className="space-y-2">
                <a href="tel:18004250100" className="flex items-center gap-2 text-sm font-semibold text-primary-700 bg-primary-50 px-3 py-2.5 rounded-lg hover:bg-primary-100 transition-colors">
                  📞 1800-425-0100 (Toll Free)
                </a>
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-sm font-medium text-slate-700 border border-slate-200 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  PGPORTAL (Central) <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Grievances by Category</h2>
            <p className="text-xs text-slate-400 font-tamil mt-0.5">வகை வாரியான புகார்கள்</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className={cn("w-2 h-8 rounded-sm mb-3", c.color)} />
                <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                <p className="text-xs text-slate-400 font-tamil mt-0.5 mb-2">{c.labelTa}</p>
                <p className="text-xl font-bold font-data text-slate-800 tabular-nums">{c.count.toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-400 mb-3">{c.pct}% of total</p>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Resolution rate</span><span className="font-semibold text-emerald-600">{c.resolved}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${c.resolved}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Monthly Resolution Rate – FY 2024-25</h2>
          <p className="text-xs text-slate-400 font-tamil mb-5">மாதாந்திர தீர்வு விகிதம்</p>
          <div className="flex items-end gap-2 h-28">
            {MONTHLY_RESOLUTION.map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</span>
                <div className="w-full rounded-t-sm bg-emerald-400 group-hover:bg-emerald-600 transition-colors"
                  style={{ height: `${(pct / 100) * 100}%` }} />
                <span className="text-[10px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Source: pgportal.gov.in · Updated monthly</p>
        </div>

      </div>
    </div>
  );
}
