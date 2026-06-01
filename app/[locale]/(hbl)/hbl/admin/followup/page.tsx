"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Bell, Phone, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface FollowUp {
  id: string; memberId: string; memberName: string; phone: string;
  reason: string; reasonLabel: string; priority: string; detail: string; daysOverdue?: number;
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "border-l-red-500 bg-red-50",
  MEDIUM: "border-l-amber-500 bg-amber-50",
  LOW: "border-l-blue-400 bg-blue-50",
};
const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-blue-100 text-blue-700",
};
const REASON_EMOJI: Record<string, string> = {
  NO_CHECKIN: "📅", EXPIRING: "⏰", NEW_JOINER: "🌱", NO_ORDER: "🛒",
};

export default function FollowUpPage() {
  const [pin] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("hbl_admin_pin") ?? "" : "");
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hbl/admin/followup", { headers: { "x-hbl-admin": pin } });
    if (res.ok) { const d = await res.json(); setFollowUps(d.followUps ?? []); }
    setLoading(false);
  }, [pin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function markDone(item: FollowUp, method: "wa" | "call") {
    setDoneIds(prev => { const s = new Set(Array.from(prev)); s.add(item.id); return s; });
    await fetch("/api/hbl/admin/followup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify({ memberId: item.memberId, reason: item.reason, note: `Contacted via ${method}` }),
    });
  }

  function sendWA(item: FollowUp) {
    let msg = "";
    if (item.reason === "EXPIRING")
      msg = `Hi ${item.memberName}! ⏰ Your Herbalife membership is expiring soon. Contact us to renew and keep your wellness journey going! 💚`;
    else if (item.reason === "NO_CHECKIN")
      msg = `Hi ${item.memberName}! 🌿 We miss you at the nutrition club! Come check in and have your daily shake. Your wellness matters! 💪`;
    else if (item.reason === "NEW_JOINER")
      msg = `Hi ${item.memberName}! 🌱 How's your Herbalife journey going? We're here to support you every step of the way! 🥤`;
    else
      msg = `Hi ${item.memberName}! 👋 Just checking in — how can we support your wellness journey today? 💚`;
    window.open(`https://wa.me/91${item.phone}?text=${encodeURIComponent(msg)}`, "_blank");
    markDone(item, "wa");
  }

  const filtered = filter === "ALL"
    ? followUps.filter(f => !doneIds.has(f.id))
    : followUps.filter(f => f.priority === filter && !doneIds.has(f.id));

  const counts = { HIGH: followUps.filter(f => f.priority === "HIGH" && !doneIds.has(f.id)).length,
    MEDIUM: followUps.filter(f => f.priority === "MEDIUM" && !doneIds.has(f.id)).length,
    LOW: followUps.filter(f => f.priority === "LOW" && !doneIds.has(f.id)).length };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <Bell className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <h1 className="font-bold text-sm">Follow-Up List</h1>
            <p className="text-slate-400 text-xs">{filtered.length} pending actions</p>
          </div>
          <button onClick={fetchData} className="p-1.5 bg-white/10 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Priority summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "HIGH", label: "🔴 High", color: "text-red-600", bg: "bg-red-50" },
            { key: "MEDIUM", label: "🟡 Medium", color: "text-amber-600", bg: "bg-amber-50" },
            { key: "LOW", label: "🔵 Low", color: "text-blue-600", bg: "bg-blue-50" },
          ].map(({ key, label, color, bg }) => (
            <button key={key} onClick={() => setFilter(filter === key ? "ALL" : key)}
              className={`${bg} rounded-2xl border-2 p-3 text-center transition-all ${filter === key ? "border-current shadow-sm" : "border-transparent"}`}>
              <p className={`text-2xl font-black ${color}`}>{counts[key as keyof typeof counts]}</p>
              <p className="text-xs text-slate-600 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-bold text-slate-700">All caught up! 🎉</p>
            <p className="text-sm text-slate-400">No pending follow-ups</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl border border-l-4 overflow-hidden ${PRIORITY_COLOR[item.priority]}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg">{REASON_EMOJI[item.reason] ?? "📌"}</span>
                        <p className="font-bold text-slate-800">{item.memberName}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.reasonLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Phone className="w-3 h-3" />{item.phone}
                      </div>
                      <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-slate-100">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => sendWA(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700">
                      💬 WhatsApp
                    </button>
                    <a href={`tel:${item.phone}`} onClick={() => markDone(item, "call")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                    <button onClick={() => setDoneIds(prev => { const s = new Set(Array.from(prev)); s.add(item.id); return s; })}
                      className="px-4 bg-slate-100 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200">
                      ✓ Done
                    </button>
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
