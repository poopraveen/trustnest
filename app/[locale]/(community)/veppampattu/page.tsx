"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import TickerBanner from "@/components/community/TickerBanner";
import {
  Search, FileText, CreditCard, Landmark, GraduationCap,
  HeartPulse, Briefcase, Phone, MessageCircle, CheckCircle2,
  X, Loader2, AlertCircle, ChevronRight, Users, MapPin, Menu,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

// ── Services catalogue ────────────────────────────────────────────────────────

const SERVICES = [
  // GOVT
  { key: "aadhaar", name: "Aadhaar Update", nameTa: "ஆதார் புதுப்பிப்பு", category: "GOVT", icon: "🪪", desc: "Address, mobile, name correction", descTa: "முகவரி, மொபைல், பெயர் திருத்தம்" },
  { key: "ration", name: "Ration Card", nameTa: "ரேஷன் கார்டு", category: "GOVT", icon: "🏠", desc: "New card, member addition, correction", descTa: "புதிய கார்டு, உறுப்பினர் சேர்க்கை, திருத்தம்" },
  { key: "pension", name: "Pension (Old Age / Widow)", nameTa: "ஓய்வூதியம் (வயதானோர் / விதவை)", category: "GOVT", icon: "👴", desc: "Apply or follow up pension", descTa: "ஓய்வூதியம் விண்ணப்பிக்க அல்லது தொடர்பு கொள்ள" },
  { key: "pmay", name: "PMAY Housing", nameTa: "PMAY வீட்டு உதவி", category: "GOVT", icon: "🏗️", desc: "Pradhan Mantri Awas Yojana application", descTa: "PM வீட்டு திட்ட விண்ணப்பம்" },
  // DOCUMENTS
  { key: "patta", name: "Patta / Land Records", nameTa: "பட்டா / நில பதிவேடு", category: "DOCUMENTS", icon: "📄", desc: "Patta transfer, chitta, adangal", descTa: "பட்டா மாற்றம், சிட்டா, அடங்கல்" },
  { key: "caste", name: "Caste / Income Certificate", nameTa: "சாதி / வருமான சான்றிதழ்", category: "DOCUMENTS", icon: "📋", desc: "Community & income certificates", descTa: "சமூக & வருமான சான்றிதழ்கள்" },
  // BANKING
  { key: "bank", name: "Bank Account Help", nameTa: "வங்கி கணக்கு உதவி", category: "BANKING", icon: "🏦", desc: "Account opening, passbook, KYC", descTa: "கணக்கு திறத்தல், பாஸ்புக், KYC" },
  { key: "phonepay", name: "PhonePe / UPI Setup", nameTa: "போன்பே / UPI அமைப்பு", category: "BANKING", icon: "📱", desc: "Digital payment setup & training", descTa: "டிஜிட்டல் பணம் செலுத்துதல் அமைப்பு" },
  // EDUCATION
  { key: "scholarship", name: "Scholarship", nameTa: "உதவித்தொகை", category: "EDUCATION", icon: "🎓", desc: "SC/ST/BC/OBC & merit scholarships", descTa: "SC/ST/BC/OBC மற்றும் தகுதி உதவித்தொகை" },
  { key: "school", name: "School Admission", nameTa: "பள்ளி சேர்க்கை", category: "EDUCATION", icon: "📚", desc: "Govt school admission & TC help", descTa: "அரசு பள்ளி சேர்க்கை & TC உதவி" },
  // HEALTH
  { key: "ayushman", name: "Ayushman / Kalaignar Card", nameTa: "ஆயுஷ்மான் / கலைஞர் அட்டை", category: "HEALTH", icon: "💊", desc: "Health insurance card application", descTa: "சுகாதார காப்பீடு அட்டை விண்ணப்பம்" },
  { key: "hospital", name: "Hospital Guidance", nameTa: "மருத்துவமனை வழிகாட்டல்", category: "HEALTH", icon: "🏥", desc: "Referral, free treatment, ambulance", descTa: "பரிந்துரை, இலவச சிகிச்சை, ஆம்புலன்ஸ்" },
  // JOBS
  { key: "jobs", name: "Job Registration", nameTa: "வேலை பதிவு", category: "JOBS", icon: "💼", desc: "Employment exchange, skill training", descTa: "வேலைவாய்ப்பு பதிவு, திறன் பயிற்சி" },
] as const;

type Category = "ALL" | "GOVT" | "DOCUMENTS" | "BANKING" | "EDUCATION" | "HEALTH" | "JOBS";

const CATEGORIES: { key: Category; label: string; labelTa: string; icon: React.ReactNode }[] = [
  { key: "ALL",       label: "All",       labelTa: "அனைத்தும்",   icon: <Search className="w-3.5 h-3.5" /> },
  { key: "GOVT",      label: "Govt",      labelTa: "அரசு",         icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "DOCUMENTS", label: "Docs",      labelTa: "ஆவணங்கள்",    icon: <CreditCard className="w-3.5 h-3.5" /> },
  { key: "BANKING",   label: "Banking",   labelTa: "வங்கி",        icon: <Landmark className="w-3.5 h-3.5" /> },
  { key: "EDUCATION", label: "Education", labelTa: "கல்வி",        icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { key: "HEALTH",    label: "Health",    labelTa: "சுகாதாரம்",   icon: <HeartPulse className="w-3.5 h-3.5" /> },
  { key: "JOBS",      label: "Jobs",      labelTa: "வேலை",         icon: <Briefcase className="w-3.5 h-3.5" /> },
];

const WHATSAPP_NUMBER = "919876543210"; // ← update with real number
const EMERGENCY_NUMBER = "1800-123-4567";
const WARDS = ["Ward 1","Ward 2","Ward 3","Ward 4","Ward 5","Ward 6","Ward 7","Ward 8","Ward 9","Ward 10","Ward 11","Ward 12"];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function VeppampattuPortal() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [tab, setTab] = useState<"services" | "track">("services");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("ALL");
  const [selected, setSelected] = useState<(typeof SERVICES)[number] | null>(null);
  const [submitted, setSubmitted] = useState<{ ticketNo: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", ward: "", details: "" });
  const [submitting, setSubmitting] = useState(false);
  const [trackMobile, setTrackMobile] = useState("");
  const [tracked, setTracked] = useState<unknown[]>([]);
  const [tracking, setTracking] = useState(false);

  const t = (en: string, ta: string) => lang === "ta" ? ta : en;

  const filtered = SERVICES.filter((s) => {
    const matchCat = category === "ALL" || s.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nameTa.includes(q) || s.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.name.trim() || !form.mobile.trim()) {
      toast(t("Fill name and mobile", "பெயர் மற்றும் மொபைல் நம்பர் உள்ளிடவும்"), "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          ward: form.ward,
          serviceKey: selected.key,
          serviceName: lang === "ta" ? selected.nameTa : selected.name,
          category: selected.category,
          details: form.details,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed", "error"); return; }
      setSubmitted({ ticketNo: data.ticketNo, name: form.name });
      setSelected(null);
      setForm({ name: "", mobile: "", ward: "", details: "" });
    } catch {
      toast(t("Something went wrong", "ஏதோ தவறு நடந்தது"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async () => {
    if (!/^\d{10}$/.test(trackMobile)) {
      toast(t("Enter 10-digit mobile", "10 இலக்க மொபைல் நம்பர் உள்ளிடவும்"), "error");
      return;
    }
    setTracking(true);
    try {
      const res = await fetch(`/api/community/requests?mobile=${trackMobile}`);
      const data = await res.json();
      setTracked(data.requests ?? []);
    } finally {
      setTracking(false);
    }
  };

  const STATUS_LABEL: Record<string, { en: string; ta: string; color: string }> = {
    PENDING:     { en: "Pending",     ta: "நிலுவையில்",  color: "bg-amber-100 text-amber-700" },
    ACCEPTED:    { en: "Accepted",    ta: "ஏற்கப்பட்டது", color: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: { en: "In Progress", ta: "செயலில்",      color: "bg-purple-100 text-purple-700" },
    DONE:        { en: "Done",        ta: "முடிந்தது",     color: "bg-green-100 text-green-700" },
    CANCELLED:   { en: "Cancelled",   ta: "ரத்து",         color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏛️</div>
            <div>
              <h1 className="font-bold text-base leading-tight">
                {t("Veppampattu Community", "வேப்பம்பட்டு சமூக சேவை")}
              </h1>
              <p className="text-green-200 text-xs">{t("Service Portal", "போர்டல்")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ta" ? "en" : "ta")}
              className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium hover:bg-white/30 transition-colors"
            >
              {lang === "ta" ? "English" : "தமிழ்"}
            </button>
            <Link href="/veppampattu/requests" className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium hover:bg-white/30 flex items-center gap-1">
              <Menu className="w-3 h-3" /> {t("Team", "குழு")}
            </Link>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <TickerBanner lang={lang} />

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-6 text-center">
          {[
            { icon: <Users className="w-4 h-4 text-green-600" />, val: "900+", label: t("Voters", "வாக்காளர்கள்") },
            { icon: <MapPin className="w-4 h-4 text-blue-600" />, val: "12", label: t("Wards", "வார்டுகள்") },
            { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, val: "13", label: t("Services", "சேவைகள்") },
          ].map((s) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5">
              {s.icon}
              <span className="text-sm font-bold text-slate-800">{s.val}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 mb-4">
          {([
            { key: "services", label: t("Services", "சேவைகள்") },
            { key: "track",    label: t("Track Request", "கோரிக்கை நிலை") },
          ] as const).map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === tb.key ? "bg-green-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── SERVICES TAB ── */}
        {tab === "services" && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search services...", "சேவைகளை தேடுங்கள்...")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              />
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                    category === cat.key
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
                  }`}
                >
                  {cat.icon}
                  {lang === "ta" ? cat.labelTa : cat.label}
                </button>
              ))}
            </div>

            {/* Service grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {filtered.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSelected(s); setSubmitted(null); }}
                  className="bg-white rounded-2xl p-4 text-left border border-slate-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="font-bold text-sm text-slate-800 leading-snug">
                    {lang === "ta" ? s.nameTa : s.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {lang === "ta" ? s.descTa : s.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-medium">
                    {t("Request →", "கோரிக்கை →")}
                  </div>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("No services found", "சேவைகள் இல்லை")}</p>
              </div>
            )}
          </>
        )}

        {/* ── TRACK TAB ── */}
        {tab === "track" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              {t("Track Your Request", "உங்கள் கோரிக்கை நிலை")}
            </h2>
            <div className="flex gap-2">
              <input
                type="tel"
                value={trackMobile}
                onChange={(e) => setTrackMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={t("Enter mobile number", "மொபைல் நம்பர் உள்ளிடவும்")}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={handleTrack}
                disabled={tracking}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : t("Track", "தேடு")}
              </button>
            </div>

            {tracked.length > 0 && (
              <div className="mt-4 space-y-3">
                {(tracked as Record<string, string>[]).map((r) => (
                  <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-slate-500 font-mono">{r.ticketNo}</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{r.serviceName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_LABEL[r.status]?.color}`}>
                        {lang === "ta" ? STATUS_LABEL[r.status]?.ta : STATUS_LABEL[r.status]?.en}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tracked.length === 0 && trackMobile.length === 10 && !tracking && (
              <div className="mt-4 text-center text-slate-400 text-sm py-6">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                {t("No requests found for this number", "இந்த நம்பருக்கு கோரிக்கைகள் இல்லை")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Request Form Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between z-10">
              <div>
                <div className="text-2xl mb-1">{selected.icon}</div>
                <h2 className="font-bold text-slate-900">
                  {lang === "ta" ? selected.nameTa : selected.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === "ta" ? selected.descTa : selected.desc}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("Full Name", "முழு பெயர்")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("Your name", "உங்கள் பெயர்")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("Mobile Number", "மொபைல் நம்பர்")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                  placeholder="10-digit mobile"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("Ward", "வார்டு")}
                </label>
                <select
                  value={form.ward}
                  onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="">{t("Select ward (optional)", "வார்டு தேர்ந்தெடுக்கவும்")}</option>
                  {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("Details / Additional Info", "விவரங்கள்")}
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                  placeholder={t("Any extra information...", "கூடுதல் தகவல்...")}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {t("Submit Request", "கோரிக்கை சமர்ப்பிக்கவும்")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {submitted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {t("Request Submitted!", "கோரிக்கை பதிவாகியது!")}
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              {t(`Hi ${submitted.name}, your request has been received.`, `வணக்கம் ${submitted.name}, உங்கள் கோரிக்கை பெறப்பட்டது.`)}
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-green-700 font-medium mb-1">
                {t("Your Ticket Number", "உங்கள் டிக்கெட் நம்பர்")}
              </p>
              <p className="text-2xl font-black text-green-700 font-mono tracking-wide">
                {submitted.ticketNo}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {t("Save this number to track your request", "கோரிக்கை நிலை தெரிந்து கொள்ள இந்த நம்பரை சேமிக்கவும்")}
              </p>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t("Our team will contact you within 24 hours.", "எங்கள் குழு 24 மணி நேரத்திற்குள் தொடர்பு கொள்ளும்.")}
            </p>
            <button
              onClick={() => setSubmitted(null)}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700"
            >
              {t("Done", "சரி")}
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lang === "ta" ? "வணக்கம்! எனக்கு சேவை உதவி தேவை." : "Hello! I need assistance with a service.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        title="WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>

      {/* Emergency FAB */}
      <a
        href={`tel:${EMERGENCY_NUMBER}`}
        className="fixed bottom-4 right-4 w-14 h-14 bg-red-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        title={t("Emergency", "அவசர உதவி")}
      >
        <Phone className="w-6 h-6" />
      </a>

    </div>
  );
}
