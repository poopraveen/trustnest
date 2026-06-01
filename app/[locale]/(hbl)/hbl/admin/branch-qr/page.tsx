"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, QrCode, Leaf, Loader2 } from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string; name: string; slug: string; address: string;
  gstin: string; fssai: string; phone: string;
}

export default function BranchQrPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [origin, setOrigin] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("hbl_admin_session");
    if (!stored) { router.replace("/hbl/admin"); return; }
    try {
      const { tenant: t } = JSON.parse(stored);
      setTenant(t);
    } catch { router.replace("/hbl/admin"); }
    setOrigin(window.location.origin);
  }, [router]);

  if (!tenant) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  const memberPortalUrl = `${origin}/hbl?t=${tenant.slug}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memberPortalUrl)}&size=300x300&bgcolor=ffffff&color=14532d&qzone=2&format=png`;
  const qrSmallUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memberPortalUrl)}&size=180x180&bgcolor=ffffff&color=14532d&qzone=2&format=png`;

  function handlePrint() {
    window.print();
  }

  async function handleDownload() {
    const res = await fetch(qrApiUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tenant!.slug}-branch-qr.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100">
        {/* Header — hidden when printing */}
        <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white no-print">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/hbl/admin/settings" className="p-1.5 bg-white/20 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 flex-1">
              <QrCode className="w-5 h-5 text-green-400" />
              <div>
                <h1 className="font-bold text-sm">Branch QR Code</h1>
                <p className="text-slate-400 text-xs">{tenant.name}</p>
              </div>
            </div>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 no-print">
            <p className="text-sm text-slate-600">
              Display or print this QR code at your club entrance. Members scan it to instantly access your branch portal — no need to type the URL or select from a list.
            </p>
            <p className="mt-2 text-xs text-slate-400 font-mono break-all">{memberPortalUrl}</p>
          </div>

          {/* Printable QR Poster */}
          <div ref={printRef} className="print-area bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Poster header */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-600 px-8 py-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Herbalife</p>
                  <p className="text-white font-black text-xl leading-tight">Nutrition Club</p>
                </div>
              </div>
              <h2 className="text-white font-black text-2xl mt-2">{tenant.name}</h2>
              {tenant.address && (
                <p className="text-green-100 text-sm mt-1">{tenant.address}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="px-8 py-8 flex flex-col items-center">
              <div className="bg-white rounded-2xl border-4 border-green-600 p-4 shadow-md mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSmallUrl}
                  alt="Branch QR Code"
                  className="w-44 h-44"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <p className="text-slate-800 font-black text-lg text-center mb-1">Scan to Access Member Portal</p>
              <p className="text-slate-500 text-sm text-center mb-6">
                Point your phone camera at this QR code
              </p>

              {/* Steps */}
              <div className="w-full grid grid-cols-3 gap-3 mb-6">
                {[
                  { step: "1", text: "Open camera app", emoji: "📷" },
                  { step: "2", text: "Scan QR code",    emoji: "🔍" },
                  { step: "3", text: "Login & check in", emoji: "✅" },
                ].map(({ step, text, emoji }) => (
                  <div key={step} className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl mb-1">{emoji}</p>
                    <p className="text-xs font-bold text-green-800">Step {step}</p>
                    <p className="text-xs text-slate-600">{text}</p>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="w-full border-t border-slate-100 pt-4 space-y-1">
                {tenant.fssai && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">FSSAI Reg. No.</span>
                    <span className="font-mono font-bold text-slate-700">{tenant.fssai}</span>
                  </div>
                )}
                {tenant.gstin && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">GSTIN</span>
                    <span className="font-mono font-bold text-slate-700">{tenant.gstin}</span>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Contact</span>
                    <span className="font-bold text-slate-700">+91 {tenant.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Powered by</span>
                  <span className="font-bold text-green-700">TrustNest HBL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 no-print pb-8">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3.5 rounded-2xl hover:bg-slate-800">
              <Printer className="w-5 h-5" /> Print Poster
            </button>
            <button onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3.5 rounded-2xl hover:bg-green-700">
              <Download className="w-5 h-5" /> Save QR PNG
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
