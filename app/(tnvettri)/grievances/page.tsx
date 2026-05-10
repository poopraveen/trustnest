"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, CheckCircle, Clock, AlertTriangle,
  Send, ExternalLink, Shield, User, MapPin, FileText,
  ClipboardCheck, ChevronRight, ChevronLeft, Phone, Mail,
  Home, Search, AlertCircle, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GRIEVANCES, DATA_SOURCES } from "@/lib/tn-official-data";
import { TN_DISTRICTS, getBlocks, getLocalities, LOCALITY_TYPE_LABELS } from "@/lib/tn-areas";
import DataFreshnessBar from "@/components/DataFreshnessBar";
import GovHeroBackground from "@/components/GovHeroBackground";

/* ─── constants ─────────────────────────────────────────────── */

const STATS = [
  { label: "Total Filed",        labelTa: "மொத்தம் பதிவு",   value: GRIEVANCES.totalFiled.toLocaleString("en-IN"),    sub: "FY 2024-25",                        color: "text-primary-700", bg: "bg-primary-50",  icon: MessageSquare },
  { label: "Resolved (30 days)", labelTa: "30 நாளில் தீர்வு", value: GRIEVANCES.totalResolved.toLocaleString("en-IN"), sub: `${GRIEVANCES.resolutionPct}% resolution rate`, color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle },
  { label: "Pending",            labelTa: "நிலுவையில்",        value: GRIEVANCES.pending.toLocaleString("en-IN"),       sub: `${((GRIEVANCES.pending / GRIEVANCES.totalFiled) * 100).toFixed(1)}% of total`, color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  { label: "Escalated",          labelTa: "மேல்முறையீடு",      value: GRIEVANCES.escalated.toLocaleString("en-IN"),     sub: `${((GRIEVANCES.escalated / GRIEVANCES.totalFiled) * 100).toFixed(1)}% escalation rate`, color: "text-red-700", bg: "bg-red-50", icon: AlertTriangle },
];

const CATEGORY_COLORS = ["bg-orange-500","bg-blue-500","bg-red-500","bg-yellow-500","bg-violet-500","bg-emerald-500","bg-teal-500","bg-slate-400"];
const CATEGORY_ICONS  = ["🛣️","⚡","💧","🏥","🎓","🤝","📜","🏗️"];
const CATEGORIES = GRIEVANCES.byCategory.map((c, i) => ({
  id: c.cat.toLowerCase().replace(/\s+/g, "-"),
  label: c.cat,
  labelTa: ["சாலை & உள்கட்டமைப்பு","மின்சாரம்","குடிநீர் வழங்கல்","சுகாதார சேவை","கல்வி","சமூக நலன்","நில ஆவணங்கள்","கட்டுமானம்"][i] || c.cat,
  count: c.count,
  pct: Math.round((c.count / GRIEVANCES.totalFiled) * 100),
  color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  icon: CATEGORY_ICONS[i] || "📋",
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

const STEPS = [
  { id: 1, title: "Personal Info",  titleTa: "தனிப்பட்ட தகவல்", icon: User },
  { id: 2, title: "Location",       titleTa: "இருப்பிடம்",        icon: MapPin },
  { id: 3, title: "Complaint",      titleTa: "புகார் விவரம்",     icon: FileText },
  { id: 4, title: "Review",         titleTa: "சரிபார்க்கவும்",    icon: ClipboardCheck },
];

/* ─── component ──────────────────────────────────────────────── */

export default function GrievancesPage() {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState({
    name: "", phone: "", email: "",
    district: "", block: "", locality: "", address: "",
    category: "", title: "", description: "",
  });
  const [localitySearch, setLocalitySearch] = useState("");
  const [submitted,     setSubmitted]     = useState(false);
  const [ticketNo,      setTicketNo]      = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [signLink,      setSignLink]      = useState<string | null>(null);
  const [emailSent,     setEmailSent]     = useState(false);
  const [pdfGenerated,  setPdfGenerated]  = useState(false);

  const blocks            = form.district ? getBlocks(form.district) : [];
  const localities        = form.block    ? getLocalities(form.district, form.block) : [];
  const filteredLocalities = localitySearch.trim()
    ? localities.filter(l =>
        l.name.toLowerCase().includes(localitySearch.toLowerCase()) ||
        l.nameTa.includes(localitySearch))
    : localities;

  const selectedDistrict = TN_DISTRICTS.find(d => d.id === form.district);
  const selectedBlock    = blocks.find(b => b.id === form.block);
  const selectedLocality = localities.find(l => l.id === form.locality);
  const selectedCategory = CATEGORIES.find(c => c.id === form.category);

  function handleDistrictChange(id: string) {
    setForm(f => ({ ...f, district: id, block: "", locality: "" }));
    setLocalitySearch("");
  }
  function handleBlockChange(id: string) {
    setForm(f => ({ ...f, block: id, locality: "" }));
    setLocalitySearch("");
  }

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim())  e.name  = "Full name is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g, "")))
        e.phone = "Enter a valid 10-digit mobile number";
    }
    if (s === 2) {
      if (!form.district) e.district = "Select your district";
      if (!form.block)    e.block    = "Select your block / taluk";
      if (!form.locality) e.locality = "Select your locality";
    }
    if (s === 3) {
      if (!form.category)     e.category = "Select a category";
      if (!form.title.trim()) e.title    = "Subject is required";
    }
    return e;
  }

  function nextStep() {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, 4));
  }
  function prevStep() { setErrors({}); setStep(s => Math.max(s - 1, 1)); }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res  = await fetch("/api/grievance/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setTicketNo(data.ticketNo);
      setSignLink(data.signLink   ?? null);
      setEmailSent(data.emailSent ?? false);
      setPdfGenerated(data.pdfGenerated ?? false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm({ name: "", phone: "", email: "", district: "", block: "", locality: "", address: "", category: "", title: "", description: "" });
    setStep(1); setErrors({}); setSubmitted(false); setTicketNo("");
    setLocalitySearch(""); setSignLink(null); setEmailSent(false); setPdfGenerated(false);
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-surface">

      <style>{`
        @keyframes stepIn  { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
        @keyframes stepOut { from { opacity:1; transform:translateX(0) }   to { opacity:0; transform:translateX(-24px) } }
        @keyframes popIn   { from { opacity:0; transform:scale(.92) }      to { opacity:1; transform:scale(1) } }
        @keyframes tickPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .step-in   { animation: stepIn  .28s cubic-bezier(.4,0,.2,1) forwards }
        .pop-in    { animation: popIn   .32s cubic-bezier(.4,0,.2,1) forwards }
        .tick-pop  { animation: tickPop .5s  cubic-bezier(.34,1.56,.64,1) forwards }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden text-white">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/tnvettri" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span>Grievances</span>
          </div>
          <h1 className="text-3xl font-bold">Citizen Grievance Portal</h1>
          <p className="text-green-200 mt-1 text-lg font-tamil">குடிமக்கள் புகார் தெரிவிப்பு</p>
          <p className="text-green-300 text-sm mt-2">File complaints · Track resolution · 85.9% resolved within 30 days</p>
        </div>
      </div>

      {/* ── Stats bar ── */}
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

        {/* Data freshness */}
        {(() => { const s = DATA_SOURCES.find(d => d.id === "grievances")!; return (
          <DataFreshnessBar sourceId={s.id} sourceName={s.url.replace("https://","")} sourceUrl={s.url}
            covers={s.covers} lastVerified={s.lastVerified} updateFrequency={s.updateFrequency}
            health={s.health} recordCount={s.recordCount} />
        ); })()}

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Stepper Form ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-card overflow-hidden">

            {submitted ? (
              /* ── Success ── */
              <div className="p-8 pop-in">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white tick-pop" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Grievance Filed Successfully
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Your complaint has been registered</h3>
                  <p className="text-slate-500 text-sm mt-1">Assigned to the concerned department · 30-day SLA</p>
                </div>

                {/* Ticket */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-4 text-center">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">Ticket Number</p>
                  <p className="text-3xl font-bold font-data text-green-800 tracking-widest">{ticketNo}</p>
                  <p className="text-xs text-slate-500 mt-1">Save this to track your grievance status</p>
                </div>

                {/* PDF + Signing status */}
                <div className="space-y-3 mb-5">

                  {/* PDF generated */}
                  {pdfGenerated && (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Legal Acknowledgment PDF Generated</p>
                        <p className="text-xs text-blue-600 mt-0.5">A formal grievance notice has been prepared under your name</p>
                      </div>
                    </div>
                  )}

                  {/* Email sent for signing */}
                  {emailSent && form.email && (
                    <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl p-3.5">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-800">Signature Request Sent</p>
                        <p className="text-xs text-violet-600 mt-0.5">
                          A signing link has been emailed to <span className="font-medium">{form.email}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sign now link (if available) */}
                  {signLink && (
                    <a href={signLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl p-3.5 transition-all shadow-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Sign Acknowledgment Now</p>
                          <p className="text-xs text-violet-200">Click to review and digitally sign the document</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-violet-200 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {/* No email provided — no signing */}
                  {pdfGenerated && !form.email && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800">
                        No email provided — signing request skipped. Please provide your email next time to receive the acknowledgment PDF for signature.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={resetForm}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    File Another
                  </button>
                  <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    Track on PGPORTAL <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* ── Step header ── */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                  {/* Progress bar */}
                  <div className="relative mb-6">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
                    <div className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500 -z-0"
                      style={{ width: `${progress}%` }} />
                    <div className="relative flex justify-between">
                      {STEPS.map((s) => {
                        const Icon = s.icon;
                        const done    = step > s.id;
                        const current = step === s.id;
                        return (
                          <button key={s.id} type="button"
                            onClick={() => { if (done) setStep(s.id); }}
                            className={cn("flex flex-col items-center gap-1.5 group", done && "cursor-pointer")}>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 bg-white",
                              done    ? "border-green-500 bg-green-500 text-white scale-95"
                              : current ? "border-green-600 text-green-700 shadow-md scale-110"
                              : "border-slate-200 text-slate-400"
                            )}>
                              {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={cn(
                              "text-[10px] font-semibold hidden sm:block transition-colors",
                              current ? "text-green-700" : done ? "text-green-600" : "text-slate-400"
                            )}>{s.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{STEPS[step - 1].title}</h2>
                      <p className="text-xs text-slate-400 font-tamil">{STEPS[step - 1].titleTa}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                      Step {step} of {STEPS.length}
                    </span>
                  </div>
                </div>

                {/* ── Step body ── */}
                <div className="p-6 step-in" key={step}>

                  {/* Step 1 — Personal Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name *</span>
                          </label>
                          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all",
                              errors.name ? "border-red-300 bg-red-50" : "border-slate-200")}
                            placeholder="உங்கள் பெயர் / Your full name" />
                          {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Number *</span>
                          </label>
                          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                            className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all",
                              errors.phone ? "border-red-300 bg-red-50" : "border-slate-200")}
                            placeholder="9876543210" maxLength={10} />
                          {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address <span className="text-slate-400 font-normal">(optional — for status updates)</span></span>
                        </label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                          placeholder="yourname@example.com" />
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
                        <Shield className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-green-800 leading-relaxed">
                          Your personal details are used <strong>only</strong> for grievance resolution and status updates.
                          They are not shared with third parties. | உங்கள் தகவல்கள் பாதுகாக்கப்படும்.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2 — Location */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {/* District */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> District / மாவட்டம் *</span>
                        </label>
                        <div className="relative">
                          <select value={form.district} onChange={e => handleDistrictChange(e.target.value)}
                            className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white appearance-none pr-8 transition-all",
                              errors.district ? "border-red-300 bg-red-50" : "border-slate-200")}>
                            <option value="">— Select your district —</option>
                            {TN_DISTRICTS.map(d => (
                              <option key={d.id} value={d.id}>{d.name} — {d.nameTa}</option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                        {errors.district && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.district}</p>}
                      </div>

                      {/* Block */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Block / Taluk / Zone *
                          {!form.district && <span className="text-slate-400 font-normal ml-1">— select district first</span>}
                        </label>
                        <div className="relative">
                          <select value={form.block} onChange={e => handleBlockChange(e.target.value)} disabled={!form.district}
                            className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                              errors.block ? "border-red-300 bg-red-50" : "border-slate-200")}>
                            <option value="">— Select block / taluk —</option>
                            {blocks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.nameTa}</option>)}
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                        {errors.block && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.block}</p>}
                      </div>

                      {/* Locality with search */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Village / Ward / Locality *
                          {!form.block && <span className="text-slate-400 font-normal ml-1">— select block first</span>}
                        </label>
                        {form.block && (
                          <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input value={localitySearch} onChange={e => setLocalitySearch(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                              placeholder="Search locality / ஊர் தேடுக..." />
                          </div>
                        )}
                        <div className="relative">
                          <select value={form.locality} onChange={e => setForm({...form, locality: e.target.value})} disabled={!form.block}
                            className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                              errors.locality ? "border-red-300 bg-red-50" : "border-slate-200")}>
                            <option value="">— Select locality —</option>
                            {filteredLocalities.map(l => (
                              <option key={l.id} value={l.id}>{l.name} — {l.nameTa} [{LOCALITY_TYPE_LABELS[l.type]}]</option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                        {errors.locality && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.locality}</p>}
                        {form.block && filteredLocalities.length === 0 && (
                          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />No results — try different spelling or clear search</p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Street / Landmark <span className="text-slate-400 font-normal">(optional)</span></span>
                        </label>
                        <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                          placeholder="House no., street name, landmark…" />
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Complaint */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Category *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {CATEGORIES.map(c => (
                            <button key={c.id} type="button" onClick={() => setForm({...form, category: c.id})}
                              className={cn(
                                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all duration-200",
                                form.category === c.id
                                  ? "border-green-600 bg-gradient-to-b from-green-50 to-emerald-50 text-green-800 shadow-sm scale-[1.02]"
                                  : "border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/40"
                              )}>
                              {form.category === c.id && (
                                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-green-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                                </span>
                              )}
                              <span className="text-xl">{c.icon}</span>
                              <span className="text-center leading-tight">{c.label}</span>
                              <span className="font-tamil text-[9px] opacity-60 text-center">{c.labelTa}</span>
                            </button>
                          ))}
                        </div>
                        {errors.category && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject / Title *</label>
                        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                          className={cn("w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all",
                            errors.title ? "border-red-300 bg-red-50" : "border-slate-200")}
                          placeholder="Brief one-line description of the issue" />
                        {errors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Detailed Description <span className="text-slate-400 font-normal">(optional but helpful)</span>
                        </label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition-all"
                          placeholder="Describe the issue in detail — when it started, severity, any previous complaints filed…" />
                        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.description.length}/500 characters</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4 — Review */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500 mb-2">Please review your details before submitting.</p>

                      {/* Personal summary */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Personal Info</span>
                          <button type="button" onClick={() => setStep(1)} className="text-xs text-green-700 font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-slate-400 w-16 shrink-0">Name</span><span className="font-medium text-slate-800">{form.name}</span></div>
                          <div className="flex gap-2"><span className="text-slate-400 w-16 shrink-0">Phone</span><span className="font-medium text-slate-800">{form.phone}</span></div>
                          {form.email && <div className="flex gap-2"><span className="text-slate-400 w-16 shrink-0">Email</span><span className="font-medium text-slate-800">{form.email}</span></div>}
                        </div>
                      </div>

                      {/* Location summary */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                          <button type="button" onClick={() => setStep(2)} className="text-xs text-green-700 font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">District</span><span className="font-medium text-slate-800">{selectedDistrict?.name}</span></div>
                          <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">Block</span><span className="font-medium text-slate-800">{selectedBlock?.name}</span></div>
                          <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">Locality</span>
                            <span className="font-medium text-slate-800">
                              {selectedLocality?.name}
                              {selectedLocality && <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{LOCALITY_TYPE_LABELS[selectedLocality.type]}</span>}
                            </span>
                          </div>
                          {form.address && <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">Address</span><span className="font-medium text-slate-800">{form.address}</span></div>}
                        </div>
                      </div>

                      {/* Complaint summary */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Complaint</span>
                          <button type="button" onClick={() => setStep(3)} className="text-xs text-green-700 font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-20 shrink-0">Category</span>
                            <span className="font-medium text-slate-800 flex items-center gap-1">
                              <span>{selectedCategory?.icon}</span> {selectedCategory?.label}
                            </span>
                          </div>
                          <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">Subject</span><span className="font-medium text-slate-800">{form.title}</span></div>
                          {form.description && (
                            <div className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">Details</span>
                              <span className="text-slate-600 text-xs leading-relaxed">{form.description.slice(0, 120)}{form.description.length > 120 ? "…" : ""}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SLA notice */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Upon submission, your grievance will be assigned to the relevant department with a <strong>30-day SLA</strong>. You can track status using your ticket number at pgportal.gov.in.
                        </p>
                      </div>

                      {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-xs text-red-700">{errors.submit}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Navigation ── */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <button type="button" onClick={prevStep} disabled={step === 1}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-4 py-2 rounded-xl hover:bg-slate-100">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="flex items-center gap-1">
                    {STEPS.map(s => (
                      <div key={s.id} className={cn("h-1.5 rounded-full transition-all duration-300",
                        step === s.id ? "w-6 bg-green-600" : step > s.id ? "w-4 bg-green-300" : "w-4 bg-slate-200")} />
                    ))}
                  </div>

                  {step < 4 ? (
                    <button type="button" onClick={nextStep}
                      className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                      className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">
                      {submitting
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating PDF…</>
                      : <><Send className="w-4 h-4" /> Submit Grievance</>
                    }
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
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
                      <div className={cn("h-full rounded-full transition-all", s.pct >= 90 ? "bg-emerald-500" : s.pct >= 80 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Avg {s.actual} days (target: {s.target})</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Need help?</h3>
              <p className="text-xs text-slate-500 mb-3">Call the TN Grievance Helpline or use PGPORTAL</p>
              <div className="space-y-2">
                <a href="tel:18004250100"
                  className="flex items-center gap-2 text-sm font-semibold text-primary-700 bg-primary-50 px-3 py-2.5 rounded-xl hover:bg-primary-100 transition-colors">
                  📞 1800-425-0100 (Toll Free)
                </a>
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between text-sm font-medium text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  PGPORTAL (Central) <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Tips for faster resolution
              </h3>
              <ul className="space-y-2">
                {[
                  "Be specific about the exact location",
                  "Mention how long the issue has persisted",
                  "Add a landmark for on-ground inspection",
                  "Include previous ticket numbers if re-filing",
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-green-800 flex items-start gap-2">
                    <span className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-green-800">{i+1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Category breakdown ── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Grievances by Category</h2>
            <p className="text-xs text-slate-400 font-tamil mt-0.5">வகை வாரியான புகார்கள்</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="text-2xl mb-2">{c.icon}</div>
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

        {/* ── Monthly trend ── */}
        <div className="bg-white rounded-2xl shadow-card p-6">
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
