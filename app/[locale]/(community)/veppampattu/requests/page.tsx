"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/navigation";
import { Phone, CheckCircle2, Loader2, RefreshCw, ArrowLeft, Clock, Filter } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface Request {
  id: string;
  ticketNo: string;
  name: string;
  mobile: string;
  ward: string | null;
  serviceName: string;
  category: string;
  details: string | null;
  status: string;
  acceptedBy: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; labelTa: string; color: string; next: string | null }> = {
  PENDING:     { label: "Pending",     labelTa: "நிலுவையில்",  color: "bg-amber-100 text-amber-700 border-amber-200",   next: "ACCEPTED" },
  ACCEPTED:    { label: "Accepted",    labelTa: "ஏற்கப்பட்டது", color: "bg-blue-100 text-blue-700 border-blue-200",     next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "In Progress", labelTa: "செயலில்",      color: "bg-purple-100 text-purple-700 border-purple-200", next: "DONE" },
  DONE:        { label: "Done ✓",      labelTa: "முடிந்தது ✓",  color: "bg-green-100 text-green-700 border-green-200",   next: null },
  CANCELLED:   { label: "Cancelled",   labelTa: "ரத்து",         color: "bg-red-100 text-red-700 border-red-200",         next: null },
};

const CATEGORY_EMOJI: Record<string, string> = {
  GOVT: "🏛️", DOCUMENTS: "📄", BANKING: "🏦", EDUCATION: "🎓", HEALTH: "💊", JOBS: "💼",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [lang, setLang] = useState<"ta" | "en">("ta");

  const t = (en: string, ta: string) => lang === "ta" ? ta : en;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter !== "ALL" ? `/api/community/requests?status=${filter}` : "/api/community/requests";
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data.requests ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/community/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { toast("Update failed", "error"); return; }
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast(t("Status updated", "நிலை புதுப்பிக்கப்பட்டது"), "success");
    } finally {
      setUpdating(null);
    }
  };

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((s) => [s, requests.filter((r) => r.status === s).length])
  );
  const totalPending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 text-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/veppampattu" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-sm">{t("Team Dashboard", "குழு டாஷ்போர்டு")}</h1>
              <p className="text-green-200 text-xs">{t("Veppampattu Community", "வேப்பம்பட்டு சமூகம்")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "ta" ? "en" : "ta")} className="text-xs bg-white/20 px-2.5 py-1.5 rounded-full">
              {lang === "ta" ? "EN" : "தமிழ்"}
            </button>
            <button onClick={fetchRequests} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30">
              <RefreshCw className="w-4 h-4" />
            </button>
            {totalPending > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalPending} {t("new", "புதிய")}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4">

        {/* Status summary tiles */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "ALL" : key)}
              className={`rounded-xl p-2.5 text-center border transition-all ${
                filter === key ? cfg.color + " border-current shadow-sm" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
              }`}
            >
              <p className="text-lg font-black">{counts[key] ?? 0}</p>
              <p className="text-[10px] font-medium leading-tight">
                {lang === "ta" ? cfg.labelTa : cfg.label}
              </p>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            {filter === "ALL"
              ? t(`${requests.length} total requests`, `மொத்தம் ${requests.length} கோரிக்கைகள்`)
              : t(`Showing: ${STATUS_CONFIG[filter]?.label}`, `காட்டுகிறது: ${STATUS_CONFIG[filter]?.labelTa}`)}
          </span>
          {filter !== "ALL" && (
            <button onClick={() => setFilter("ALL")} className="text-xs text-green-600 underline ml-auto">
              {t("Show all", "அனைத்தும் காட்டு")}
            </button>
          )}
        </div>

        {/* Request cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t("No requests found", "கோரிக்கைகள் இல்லை")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const cfg = STATUS_CONFIG[r.status];
              const nextStatus = cfg?.next;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-0.5">{CATEGORY_EMOJI[r.category] ?? "📋"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-mono text-xs text-slate-400">{r.ticketNo}</p>
                            <p className="font-bold text-slate-900">{r.name}</p>
                            <p className="text-sm text-slate-600 font-medium">{r.serviceName}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg?.color}`}>
                            {lang === "ta" ? cfg?.labelTa : cfg?.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          {r.ward && <span>📍 {r.ward}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(r.createdAt)}</span>
                        </div>

                        {r.details && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            {r.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-slate-100">
                    <a
                      href={`tel:${r.mobile}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors border-r border-slate-100"
                    >
                      <Phone className="w-4 h-4" />
                      {r.mobile}
                    </a>
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(r.id, nextStatus)}
                        disabled={updating === r.id}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60"
                      >
                        {updating === r.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckCircle2 className="w-4 h-4" />}
                        {lang === "ta"
                          ? STATUS_CONFIG[nextStatus]?.labelTa
                          : t(`Mark ${STATUS_CONFIG[nextStatus]?.label}`, `${STATUS_CONFIG[nextStatus]?.labelTa} செய்`)}
                      </button>
                    )}
                    {!nextStatus && r.status !== "CANCELLED" && (
                      <button
                        onClick={() => updateStatus(r.id, "CANCELLED")}
                        disabled={updating === r.id}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                      >
                        {t("Cancel", "ரத்து செய்")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
