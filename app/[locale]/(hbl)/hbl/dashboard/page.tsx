"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, CheckCircle2, ShoppingBag, History, Star, Calendar, AlertTriangle, LogOut, ChevronRight, Loader2, QrCode, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Member {
  id: string; name: string; phone: string; plan: string; status: string;
  points: number; joinedAt: string; expiresAt: string; qrCode: string; checkedInToday: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700",
  SILVER: "bg-slate-200 text-slate-800",
  GOLD: "bg-amber-100 text-amber-800",
  PLATINUM: "bg-purple-100 text-purple-800",
};

const PLAN_BADGE: Record<string, string> = { BASIC: "🌿", SILVER: "⭐", GOLD: "🥇", PLATINUM: "💎" };

export default function HblDashboard() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState("");
  const searchParams = useSearchParams();
  const qrCheckin = searchParams.get("qr_checkin");

  useEffect(() => {
    fetch("/api/hbl/auth/me").then((r) => {
      if (r.status === 401) { router.replace("/hbl"); return null; }
      return r.json();
    }).then((d) => { if (d?.member) setMember(d.member); }).finally(() => setLoading(false));
  }, [router]);

  async function doCheckIn() {
    setCheckingIn(true); setCheckInMsg("");
    const res = await fetch("/api/hbl/checkin", { method: "POST" });
    const data = await res.json();
    if (res.ok) { setCheckInMsg(`✅ Checked in! +${data.pointsEarned} point`); setMember((m) => m ? { ...m, checkedInToday: true, points: m.points + 1 } : m); }
    else setCheckInMsg(data.error === "Already checked in today" ? "✅ Already checked in today!" : data.error);
    setCheckingIn(false);
  }

  async function logout() {
    await fetch("/api/hbl/auth/me", { method: "DELETE" });
    router.replace("/hbl");
  }

  const daysLeft = member ? Math.ceil((new Date(member.expiresAt).getTime() - Date.now()) / 86400000) : 0;

  if (loading) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  if (!member) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-green-100">Good morning!</p>
              <p className="font-bold text-lg leading-tight">{member.name}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Membership card */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-100 text-xs font-semibold uppercase tracking-wide">Membership Plan</p>
              <p className="text-2xl font-black mt-0.5">{PLAN_BADGE[member.plan]} {member.plan}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${member.status === "ACTIVE" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"}`}>
              {member.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Expires</p>
              <p className="font-bold">{new Date(member.expiresAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-xs">Points</p>
              <p className="font-black text-2xl">{member.points}<span className="text-sm font-normal text-green-100"> pts</span></p>
            </div>
          </div>
          {daysLeft <= 7 && daysLeft > 0 && (
            <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs font-semibold">Membership expires in {daysLeft} days!</p>
            </div>
          )}
        </div>

        {/* Check-in */}
        <div className={`rounded-2xl p-4 border-2 ${member.checkedInToday ? "bg-green-50 border-green-200" : "bg-white border-slate-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Daily Check-In</p>
              <p className="text-sm text-slate-500">{member.checkedInToday ? "Done today! +1 point earned" : "Check in to earn 1 point"}</p>
            </div>
            <button
              onClick={doCheckIn} disabled={checkingIn || member.checkedInToday}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                member.checkedInToday ? "bg-green-100 text-green-700 cursor-default" : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {checkingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {member.checkedInToday ? "Done" : "Check In"}
            </button>
          </div>
          {checkInMsg && <p className="text-sm font-medium text-green-700 mt-2">{checkInMsg}</p>}
        </div>

        {/* QR scan success banner */}
        {qrCheckin === "done" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-green-800 text-sm">QR Check-In Successful! 🎉</p>
              <p className="text-xs text-green-600">+1 point earned. Welcome to the club!</p>
            </div>
          </div>
        )}
        {qrCheckin === "already" && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="font-bold text-blue-800 text-sm">Already checked in today ✓</p>
          </div>
        )}

        {/* QR Code — tap to view full card */}
        <Link href="/hbl/myqr" className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-green-300 hover:shadow-sm transition-all group">
          <div className="relative shrink-0">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "https://trustnest-tsgz.vercel.app") + "/en/hbl/qr/" + member.qrCode)}&size=80x80&bgcolor=ffffff&color=166534&qzone=1`}
              alt="QR Code" className="w-20 h-20 rounded-xl border border-slate-100"
            />
            <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 rounded-xl transition-colors flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-green-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-green-600" />
              <p className="font-bold text-slate-800 text-sm">Your QR Code</p>
              <span className="text-xs text-green-600 font-semibold ml-auto">Tap to view →</span>
            </div>
            <p className="font-mono text-xs text-slate-400 truncate">{member.qrCode}</p>
            <p className="text-xs text-slate-500 mt-1">Scan to login + auto check-in</p>
          </div>
        </Link>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: "/hbl/order", icon: ShoppingBag, label: "Order", color: "bg-emerald-50 text-emerald-700" },
            { href: "/hbl/checkin", icon: CheckCircle2, label: "Check-in", color: "bg-blue-50 text-blue-700" },
            { href: "/hbl/myqr", icon: QrCode, label: "My QR", color: "bg-green-50 text-green-700" },
            { href: "/hbl/history", icon: History, label: "History", color: "bg-purple-50 text-purple-700" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity`}>
              <Icon className="w-6 h-6" />
              <span className="text-xs font-bold">{label}</span>
            </Link>
          ))}
        </div>

        {/* Loyalty points card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-500" />
            <p className="font-bold text-slate-800">Loyalty Points</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900">{member.points}</p>
              <p className="text-xs text-slate-500">Available points</p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-1">
              <p>1 pt = Daily check-in</p>
              <p>1 pt = ₹100 spent</p>
              <p>10 pts = 1 free shake</p>
            </div>
          </div>
          <div className="mt-3 bg-slate-50 rounded-xl h-2.5 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-xl transition-all" style={{ width: `${Math.min((member.points % 10) * 10, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{10 - (member.points % 10)} more points until free shake</p>
        </div>

        {/* Member since */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Member since</p>
            <p className="text-xs text-slate-500">{new Date(member.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
        </div>
      </div>
    </div>
  );
}
