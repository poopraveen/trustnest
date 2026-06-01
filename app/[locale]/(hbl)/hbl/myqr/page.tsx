"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, Printer, Loader2, Leaf, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string; name: string; phone: string; plan: string;
  status: string; points: number; expiresAt: string; qrCode: string;
  checkedInToday: boolean;
}

const PLAN_BADGE: Record<string, string> = { BASIC: "🌿", SILVER: "⭐", GOLD: "🥇", PLATINUM: "💎" };
const PLAN_BG: Record<string, string> = {
  BASIC: "from-green-600 to-emerald-500",
  SILVER: "from-slate-500 to-slate-400",
  GOLD: "from-amber-500 to-yellow-400",
  PLATINUM: "from-purple-600 to-violet-500",
};

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://trustnest-tsgz.vercel.app";
}

export default function MyQrPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch("/api/hbl/auth/me").then((r) => {
      if (r.status === 401) { router.replace("/hbl"); return null; }
      return r.json();
    }).then((d) => { if (d?.member) setMember(d.member); }).finally(() => setLoading(false));
  }, [router]);

  function getQrUrl(size = 280) {
    if (!member) return "";
    const deepLink = `${getBaseUrl()}/en/hbl/qr/${member.qrCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(deepLink)}&size=${size}x${size}&bgcolor=ffffff&color=166534&qzone=2&format=png`;
  }

  async function downloadQr() {
    const url = getQrUrl(600);
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `HBL-QR-${member?.name?.replace(/\s+/g, "-")}.png`;
    a.click();
  }

  async function shareCard() {
    const deepLink = `${getBaseUrl()}/en/hbl/qr/${member?.qrCode}`;
    if (navigator.share) {
      await navigator.share({ title: "My Herbalife Member QR", text: `Scan to access my Herbalife club profile — ${member?.name}`, url: deepLink });
    } else {
      await navigator.clipboard.writeText(deepLink);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  }

  function printCard() { window.print(); }

  if (loading) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  if (!member) return null;

  const deepLink = `${getBaseUrl()}/en/hbl/qr/${member.qrCode}`;
  const gradient = PLAN_BG[member.plan] ?? PLAN_BG.BASIC;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white no-print">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/dashboard" className="p-1.5 bg-white/20 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold">My QR Card</h1>
            <p className="text-green-100 text-xs">Scan to check in & access your account</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center">

        {/* Member Card */}
        <div ref={cardRef} className={`w-full max-w-xs rounded-3xl bg-gradient-to-br ${gradient} shadow-2xl overflow-hidden print-card`}>
          {/* Card header */}
          <div className="px-6 pt-6 pb-4 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Herbalife</p>
                <p className="text-xs font-bold text-white/90">Nutrition Club Member</p>
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{member.name}</h2>
            <p className="text-white/70 text-sm mt-0.5">{member.phone}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                {PLAN_BADGE[member.plan]} {member.plan}
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                ⭐ {member.points} pts
              </span>
            </div>
          </div>

          {/* QR section */}
          <div className="bg-white mx-4 mb-4 rounded-2xl p-5 flex flex-col items-center">
            <img
              src={getQrUrl(240)}
              alt="Member QR Code"
              className="w-48 h-48 rounded-xl"
              crossOrigin="anonymous"
            />
            <p className="text-xs text-slate-500 mt-3 text-center font-medium">Scan to open app & check in</p>
            <p className="font-mono text-[9px] text-slate-300 mt-1 break-all text-center">{member.qrCode}</p>
          </div>

          {/* Card footer */}
          <div className="px-6 pb-5 flex items-center justify-between text-white/70 text-xs">
            <span>Valid until {new Date(member.expiresAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
            <span className={`font-bold ${member.status === "ACTIVE" ? "text-green-200" : "text-red-300"}`}>{member.status}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-4 w-full max-w-xs text-sm text-slate-600 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p>Scanning the QR <strong>automatically logs you in</strong> and records today's check-in.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p>Show this card to the club trainer for in-person verification.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p>Save a screenshot or print this card to always have it ready.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5 w-full max-w-xs">
          <button onClick={downloadQr}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-2xl hover:bg-green-700 text-sm">
            <Download className="w-4 h-4" /> Save QR
          </button>
          <button onClick={shareCard}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 text-sm">
            {shared ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share</>}
          </button>
          <button onClick={printCard}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-2xl hover:bg-slate-200 text-sm no-print">
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Deep link */}
        <div className="mt-4 w-full max-w-xs bg-slate-100 rounded-xl px-4 py-3 no-print">
          <p className="text-xs text-slate-400 mb-1">Your QR link</p>
          <p className="text-xs text-slate-600 font-mono break-all">{deepLink}</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-card { box-shadow: none; margin: 40px auto; }
        }
      `}</style>
    </div>
  );
}
