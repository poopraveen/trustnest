"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Printer, Share2, Leaf, CheckCircle2 } from "lucide-react";

export interface QrCardMember {
  id: string;
  name: string;
  phone: string;
  plan: string;
  status: string;
  points: number;
  expiresAt: string;
  qrCode: string;
  memberCode?: string | null;
}

const PLAN_BADGE: Record<string, string> = { BASIC: "🌿", SILVER: "⭐", GOLD: "🥇", PLATINUM: "💎" };
const PLAN_BG: Record<string, string> = {
  BASIC: "from-green-600 to-emerald-500",
  SILVER: "from-slate-500 to-slate-400",
  GOLD: "from-amber-500 to-yellow-400",
  PLATINUM: "from-purple-600 to-violet-500",
};

function baseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://trustnest-tsgz.vercel.app";
}

function qrImageUrl(qrCode: string, size: number) {
  const deepLink = `${baseUrl()}/en/hbl/qr/${qrCode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(deepLink)}&size=${size}x${size}&bgcolor=ffffff&color=166534&qzone=2&format=png`;
}

function Barcode({ code }: { code: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!code || !ref.current) return;
    import("jsbarcode")
      .then(({ default: JsBarcode }) => {
        JsBarcode(ref.current, code, {
          format: "CODE128",
          width: 2,
          height: 54,
          displayValue: true,
          fontSize: 12,
          margin: 8,
          background: "#ffffff",
          lineColor: "#166534",
        });
      })
      .catch(() => {});
  }, [code]);
  return (
    <div className="flex flex-col items-center mt-3 pt-3 border-t border-slate-100 w-full">
      <p className="text-xs text-slate-400 mb-2 font-medium">Member Barcode</p>
      <canvas ref={ref} className="max-w-full" />
    </div>
  );
}

export default function MemberQrCard({
  member,
  clubName = "Herbalife Nutrition Club",
  onClose,
}: {
  member: QrCardMember;
  clubName?: string;
  onClose: () => void;
}) {
  const [shared, setShared] = useState(false);
  const deepLink = `${baseUrl()}/en/hbl/qr/${member.qrCode}`;
  const gradient = PLAN_BG[member.plan] ?? PLAN_BG.BASIC;

  async function download() {
    try {
      const res = await fetch(qrImageUrl(member.qrCode, 600));
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `HBL-QR-${member.name.replace(/\s+/g, "-")}.png`;
      a.click();
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Herbalife Member QR", text: `Scan to log in — ${member.name}`, url: deepLink });
    } else {
      await navigator.clipboard.writeText(deepLink);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-sm my-auto">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 no-print">
          <h3 className="font-bold text-slate-800">Member Login Card</h3>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="px-5 pb-5 flex flex-col items-center">
          {/* Card */}
          <div className={`w-full max-w-xs rounded-3xl bg-gradient-to-br ${gradient} shadow-xl overflow-hidden print-card`}>
            <div className="px-6 pt-6 pb-4 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Herbalife</p>
                  <p className="text-xs font-bold text-white/90 truncate max-w-[180px]">{clubName}</p>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{member.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">{member.phone}</p>
              {member.memberCode && <p className="text-white/60 text-xs font-mono mt-0.5">{member.memberCode}</p>}
              <div className="flex items-center gap-2 mt-3">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {PLAN_BADGE[member.plan]} {member.plan}
                </span>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">⭐ {member.points} pts</span>
              </div>
            </div>

            <div className="bg-white mx-4 mb-4 rounded-2xl p-5 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl(member.qrCode, 240)} alt="Member QR Code" className="w-44 h-44 rounded-xl" crossOrigin="anonymous" />
              <p className="text-xs text-slate-500 mt-3 text-center font-medium">Scan to log in &amp; check in</p>
              {member.memberCode && <Barcode code={member.memberCode} />}
            </div>

            <div className="px-6 pb-5 flex items-center justify-between text-white/70 text-xs">
              <span>Valid until {new Date(member.expiresAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              <span className={`font-bold ${member.status === "ACTIVE" ? "text-green-200" : "text-red-300"}`}>{member.status}</span>
            </div>
          </div>

          <div className="mt-4 w-full max-w-xs bg-slate-50 rounded-xl px-4 py-2.5 no-print">
            <p className="text-[11px] text-slate-400 mb-0.5">Login link</p>
            <p className="text-[11px] text-slate-600 font-mono break-all">{deepLink}</p>
          </div>

          <div className="flex gap-2.5 mt-4 w-full max-w-xs no-print">
            <button onClick={download} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2.5 rounded-2xl hover:bg-green-700 text-sm">
              <Download className="w-4 h-4" /> Save
            </button>
            <button onClick={share} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-2xl hover:bg-blue-700 text-sm">
              {shared ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share</>}
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-2xl hover:bg-slate-200 text-sm">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
