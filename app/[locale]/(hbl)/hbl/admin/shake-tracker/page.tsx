"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Activity, Phone } from "lucide-react";
import Link from "next/link";

interface TrackerItem {
  id: string; name: string; phone: string; plan: string;
  daysSinceJoin: number; lastShake: string | null; daysSinceShake: number; weekShakes: number;
  lastCheckIn: string | null; daysSinceCheckIn: number; weekCheckIns: number;
  isActive: boolean; needsAttention: boolean;
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

export default function ShakeTrackerPage() {

  const [tracker, setTracker] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayShakes, setTodayShakes] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "NEEDS_ATTENTION">("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hbl/admin/shake-tracker", { headers: adminHeaders() });
    if (res.ok) { const d = await res.json(); setTracker(d.tracker ?? []); setTodayShakes(d.todayShakes); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function sendWA(phone: string, name: string) {
    const msg = `Hi ${name}! 🥤 Don't forget your Herbalife shake today! Your body will thank you. See you at the club! 💚`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const filtered = filter === "ALL" ? tracker
    : filter === "ACTIVE" ? tracker.filter(t => t.isActive)
    : tracker.filter(t => t.needsAttention);

  const activeCount = tracker.filter(t => t.isActive).length;
  const attentionCount = tracker.filter(t => t.needsAttention).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <Activity className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <h1 className="font-bold text-sm">Shake Tracker</h1>
            <p className="text-slate-400 text-xs">Daily member activity monitoring</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-black text-green-600">{todayShakes}</p>
            <p className="text-xs text-slate-500 mt-1">Shakes Today</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-black text-blue-600">{activeCount}</p>
            <p className="text-xs text-slate-500 mt-1">Active (≤3 days)</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-black text-red-500">{attentionCount}</p>
            <p className="text-xs text-slate-500 mt-1">Need Attention</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "NEEDS_ATTENTION"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter === f ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl border p-4 ${m.needsAttention ? "border-red-200" : "border-slate-100"}`}>
                <div className="flex items-start gap-3">
                  {/* Status dot */}
                  <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${m.isActive ? "bg-green-500" : m.daysSinceCheckIn <= 5 ? "bg-amber-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />{m.phone}
                        </div>
                      </div>
                      <button onClick={() => sendWA(m.phone, m.name)}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 shrink-0">
                        Remind WA
                      </button>
                    </div>

                    {/* 7-day activity dots */}
                    <div className="mt-2">
                      <p className="text-[10px] text-slate-400 mb-1">This week: {m.weekCheckIns} check-ins · {m.weekShakes} shakes</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }, (_, i) => {
                          const dayIndex = 6 - i;
                          return (
                            <div key={i} title={`Day -${dayIndex}`}
                              className={`w-6 h-6 rounded-md text-[9px] flex items-center justify-center font-bold ${
                                dayIndex < m.weekCheckIns
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}>
                              {dayIndex === 0 ? "T" : `${dayIndex}d`}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span className={m.daysSinceCheckIn <= 1 ? "text-green-600 font-semibold" : m.daysSinceCheckIn > 3 ? "text-red-500 font-semibold" : "text-slate-500"}>
                        Last check-in: {m.daysSinceCheckIn === 0 ? "Today ✓" : m.daysSinceCheckIn === 999 ? "Never" : `${m.daysSinceCheckIn}d ago`}
                      </span>
                      <span className={m.daysSinceShake <= 1 ? "text-green-600 font-semibold" : m.daysSinceShake > 3 ? "text-red-500 font-semibold" : "text-slate-500"}>
                        Last shake: {m.daysSinceShake === 0 ? "Today ✓" : m.daysSinceShake === 999 ? "Not logged" : `${m.daysSinceShake}d ago`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
