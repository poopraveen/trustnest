"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Calendar, CheckCircle2, Loader2, Star, TrendingUp, Phone } from "lucide-react";
import Link from "next/link";

interface NewJoiner {
  id: string; name: string; phone: string; plan: string;
  joinedAt: string; daysSinceJoin: number;
  totalCheckIns: number; totalShakes: number; totalOrders: number;
  firstCheckIn: string | null; lastActivity: string | null; daysSinceActivity: number;
  milestones: string[]; engagement: string;
}

const ENGAGEMENT_COLOR: Record<string, string> = {
  HIGH: "bg-green-100 text-green-800", MEDIUM: "bg-blue-100 text-blue-800",
  LOW: "bg-amber-100 text-amber-700", INACTIVE: "bg-red-100 text-red-700",
};

const MILESTONE_LABELS: Record<string, string> = {
  first_checkin: "✅ First Check-in", first_shake: "🥤 First Shake",
  first_order: "🛍️ First Order", "7_day_streak": "🔥 7-Day Streak",
  "2_week_active": "⭐ 2-Week Active", "30_day_champion": "🏆 30-Day Champion",
};

function progressColor(pct: number) {
  if (pct >= 70) return "bg-green-500";
  if (pct >= 40) return "bg-blue-500";
  if (pct >= 20) return "bg-amber-500";
  return "bg-red-400";
}


function getAdminSession() {
  if (typeof window === "undefined") return { pin: "", tenantId: "" };
  try {
    const s = JSON.parse(sessionStorage.getItem("hbl_admin_session") ?? "{}");
    return { pin: s.pin ?? "", tenantId: s.tenant?.id ?? "" };
  } catch { return { pin: "", tenantId: "" }; }
}

function adminHeaders() {
  const s = getAdminSession();
  return { "x-hbl-admin": s.pin, ...(s.tenantId ? { "x-hbl-tenant": s.tenantId } : {}) };
}

export default function NewJoinersPage() {

  const [joiners, setJoiners] = useState<NewJoiner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hbl/admin/new-joiners", { headers: adminHeaders() });
    if (res.ok) { const d = await res.json(); setJoiners(d.newJoiners ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function sendWhatsApp(phone: string, name: string, days: number) {
    const msg = `Hi ${name}! 🌿 You're on Day ${days} of your Herbalife journey. How are you feeling? Let us know if you need any support. Keep it up! 💪`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const filtered = filter === "ALL" ? joiners : joiners.filter(j => j.engagement === filter);

  const stats = {
    total: joiners.length,
    high: joiners.filter(j => j.engagement === "HIGH").length,
    inactive: joiners.filter(j => j.engagement === "INACTIVE").length,
    avgCheckIns: joiners.length ? Math.round(joiners.reduce((s, j) => s + j.totalCheckIns, 0) / joiners.length) : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <Users className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <h1 className="font-bold text-sm">New Joiners (Last 30 Days)</h1>
            <p className="text-slate-400 text-xs">{stats.total} members tracked</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "New Members", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Highly Active", value: stats.high, color: "text-green-600", bg: "bg-green-50" },
            { label: "Inactive", value: stats.inactive, color: "text-red-600", bg: "bg-red-50" },
            { label: "Avg Check-ins", value: stats.avgCheckIns, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "HIGH", "MEDIUM", "LOW", "INACTIVE"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${filter === f ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {f} {f !== "ALL" && `(${joiners.filter(j => j.engagement === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No new joiners</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(m => {
              const progress = Math.min(100, Math.round((m.totalCheckIns / 30) * 100));
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ENGAGEMENT_COLOR[m.engagement]}`}>{m.engagement}</span>
                        <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Day {m.daysSinceJoin}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                        <Phone className="w-3 h-3" />{m.phone}
                        <span>· Joined {new Date(m.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <button onClick={() => sendWhatsApp(m.phone, m.name, m.daysSinceJoin)}
                      className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700">
                      WA
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { icon: CheckCircle2, label: "Check-ins", value: m.totalCheckIns, color: "text-blue-600" },
                      { icon: Star, label: "Shakes", value: m.totalShakes, color: "text-green-600" },
                      { icon: TrendingUp, label: "Orders", value: m.totalOrders, color: "text-purple-600" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-0.5`} />
                        <p className="font-black text-slate-800">{value}</p>
                        <p className="text-[10px] text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress toward 30 days */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500">30-day journey progress</p>
                      <p className="text-xs font-semibold text-slate-700">{m.daysSinceJoin}/30 days</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progressColor(Math.min(100, m.daysSinceJoin / 30 * 100))}`}
                        style={{ width: `${Math.min(100, m.daysSinceJoin / 30 * 100)}%` }} />
                    </div>
                  </div>

                  {/* Check-in rate */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500">Check-in consistency</p>
                      <p className="text-xs font-semibold text-slate-700">{progress}%</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Milestones */}
                  {m.milestones.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.milestones.map(ms => (
                        <span key={ms} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          {MILESTONE_LABELS[ms] ?? ms}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.daysSinceActivity > 2 && (
                    <p className="text-xs text-red-500 mt-2 font-medium">⚠️ No activity for {m.daysSinceActivity} days — needs follow-up</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
