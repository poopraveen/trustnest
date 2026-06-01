"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, ArrowLeft, Loader2, Camera } from "lucide-react";
import Link from "next/link";

export default function CheckInPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; msg: string } | null>(null);

  async function checkIn() {
    setLoading(true); setResult(null);
    const res = await fetch("/api/hbl/checkin", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult({ success: true, msg: `✅ Checked in! You earned +${data.pointsEarned} point.` });
    else setResult({ success: data.checkedIn, msg: data.checkedIn ? "✅ Already checked in today!" : data.error });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/dashboard" className="p-1.5 bg-white/20 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="font-bold">Daily Check-In</h1>
            <p className="text-green-100 text-xs">Mark your visit for today</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center text-center">
        <div className="w-32 h-32 bg-green-100 rounded-3xl flex items-center justify-center mb-6">
          <QrCode className="w-16 h-16 text-green-600" />
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-2">Check In Today</h2>
        <p className="text-slate-500 mb-8">Tap below to record your visit and earn 1 loyalty point!</p>

        {result ? (
          <div className={`w-full rounded-2xl p-5 mb-6 ${result.success ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
            <p className={`font-bold text-lg ${result.success ? "text-green-700" : "text-red-700"}`}>{result.msg}</p>
          </div>
        ) : null}

        <button onClick={checkIn} disabled={loading || result?.success === true}
          className="w-full max-w-xs bg-green-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-60">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
          {loading ? "Checking in..." : result?.success ? "Checked In ✓" : "Check In Now"}
        </button>

        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-4 w-full text-left">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">QR Scan at Club</p>
          </div>
          <p className="text-xs text-slate-500">Show your QR code from the dashboard to the trainer for in-person scan check-in.</p>
        </div>
      </div>
    </div>
  );
}
