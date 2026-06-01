"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ScanLine, CheckCircle2, XCircle, Loader2, User, Search, Leaf } from "lucide-react";
import Link from "next/link";

interface ScanResult {
  success?: boolean;
  alreadyCheckedIn?: boolean;
  pointsEarned?: number;
  member?: { id: string; name: string; phone: string; plan: string; status: string; points: number; memberCode: string | null };
  error?: string;
}

const PLAN_COLORS: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700",
  SILVER: "bg-slate-200 text-slate-800",
  GOLD: "bg-amber-100 text-amber-800",
  PLATINUM: "bg-purple-100 text-purple-800",
};

export default function BarcodeScanner() {
  const router = useRouter();
  const [adminPin, setAdminPin] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("hbl_admin_session");
    if (!saved) { router.replace("/hbl/admin"); return; }
    try {
      const { tenant, pin } = JSON.parse(saved);
      setAdminPin(pin); setTenantId(tenant.id);
    } catch { router.replace("/hbl/admin"); }
  }, [router]);

  async function processCode(code: string) {
    if (processing || !code.trim()) return;
    setProcessing(true); setResult(null);

    const res = await fetch("/api/hbl/admin/barcode-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": adminPin, "x-hbl-tenant": tenantId },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setResult(data);
    setProcessing(false);
  }

  async function startScanner() {
    setScannerStarted(true);
    setScanning(true);
    setResult(null);

    // Dynamic import to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    html5QrRef.current = scanner as unknown as { stop: () => Promise<void> };

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          // Extract member code from QR deep-link if needed
          const code = decodedText.includes("/hbl/qr/")
            ? decodedText.split("/hbl/qr/").pop() ?? decodedText
            : decodedText;
          stopScanner();
          processCode(code);
        },
        () => { /* ignore scan failures */ }
      );
    } catch {
      setScanning(false); setScannerStarted(false);
      setResult({ error: "Camera not available. Use manual entry below." });
    }
  }

  async function stopScanner() {
    try { await html5QrRef.current?.stop(); } catch {}
    setScanning(false);
  }

  useEffect(() => () => { html5QrRef.current?.stop().catch(() => {}); }, []);

  const resultBg = result?.success ? "bg-green-50 border-green-200" :
    result?.alreadyCheckedIn ? "bg-blue-50 border-blue-200" :
    result?.error ? "bg-red-50 border-red-200" : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/20 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <div>
              <h1 className="font-bold text-sm">Barcode Scanner</h1>
              <p className="text-slate-400 text-xs">Scan member card for check-in</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Camera Scanner */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800">Camera Scan</h2>
          </div>

          {scannerStarted && (
            <div id="qr-reader" ref={scannerRef} className="w-full" />
          )}

          <div className="p-4 flex gap-3">
            {!scanning ? (
              <button onClick={startScanner} disabled={!adminPin}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50">
                <ScanLine className="w-4 h-4" /> Start Scanner
              </button>
            ) : (
              <button onClick={stopScanner}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600">
                <XCircle className="w-4 h-4" /> Stop Scanner
              </button>
            )}
          </div>

          {scanning && (
            <p className="text-center text-xs text-slate-500 pb-4 -mt-2">
              Point camera at member QR code or barcode
            </p>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800">Manual Entry</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={manualCode} onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processCode(manualCode)}
              placeholder="Member code or QR token (e.g. VPT-0001)"
              className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-400"
            />
            <button onClick={() => processCode(manualCode)} disabled={processing || !manualCode.trim()}
              className="bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Result */}
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-slate-600 font-medium">Looking up member...</p>
          </div>
        )}

        {result && !processing && (
          <div className={`rounded-2xl border-2 p-5 ${resultBg}`}>
            {result.error ? (
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Not Found</p>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
              </div>
            ) : result.member ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-800 text-lg">{result.member.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PLAN_COLORS[result.member.plan]}`}>{result.member.plan}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{result.member.status}</span>
                    </div>
                    <p className="text-sm text-slate-600">{result.member.phone}</p>
                    {result.member.memberCode && <p className="text-xs text-slate-400 font-mono mt-0.5">{result.member.memberCode}</p>}
                    <p className="text-sm text-slate-600 mt-1">⭐ {result.member.points} pts</p>
                  </div>
                </div>

                {result.success && (
                  <div className="bg-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">Checked In!</p>
                      <p className="text-sm text-green-700">+{result.pointsEarned} point earned today</p>
                    </div>
                  </div>
                )}
                {result.alreadyCheckedIn && (
                  <div className="bg-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-blue-800">Already Checked In Today</p>
                      <p className="text-sm text-blue-700">Member visited earlier today</p>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Scan another */}
        {result && !processing && (
          <button onClick={() => { setResult(null); setManualCode(""); }}
            className="w-full border-2 border-teal-500 text-teal-700 font-semibold py-3 rounded-xl hover:bg-teal-50">
            Scan Another Member
          </button>
        )}
      </div>
    </div>
  );
}
