"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Leaf, Phone, ShieldCheck, ChevronRight, Building2 } from "lucide-react";

interface Tenant { id: string; name: string; slug: string; address: string; }

export default function HblLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"tenant" | "phone" | "otp">("tenant");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hbl/admin/tenants").then(r => r.json()).then(d => {
      const list: Tenant[] = d.tenants ?? [];
      setTenants(list);
      // Auto-select if ?t=slug or only one tenant
      const slug = searchParams.get("t");
      if (slug) {
        const found = list.find(t => t.slug === slug);
        if (found) { setTenant(found); setStep("phone"); return; }
      }
      if (list.length === 1) { setTenant(list[0]); setStep("phone"); }
    });
  }, [searchParams]);

  async function sendOtp() {
    if (!/^\d{10}$/.test(phone)) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/hbl/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, tenantId: tenant?.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setDemoOtp(data.otp); setStep("otp"); }
    else setError(data.error ?? "Failed to send OTP");
  }

  async function verifyOtp() {
    setLoading(true); setError("");
    const res = await fetch("/api/hbl/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, tenantId: tenant?.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push("/hbl/dashboard");
    else setError(data.error ?? "Invalid OTP");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-white">TrustNest</h1>
          <p className="text-green-100 font-semibold text-lg">{tenant?.name ?? "Herbalife Nutrition Club"}</p>
          <p className="text-green-200 text-sm mt-1">Member Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">

          {/* Tenant selection */}
          {step === "tenant" && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Select Your Branch</h2>
              <p className="text-slate-500 text-sm mb-5">Choose your Herbalife club location</p>
              {tenants.length === 0 ? (
                <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" /></div>
              ) : (
                <div className="space-y-2">
                  {tenants.map(t => (
                    <button key={t.id} onClick={() => { setTenant(t); setStep("phone"); }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-green-400 hover:bg-green-50 transition-all text-left">
                      <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                        {t.address && <p className="text-xs text-slate-500 truncate">{t.address}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Phone entry */}
          {step === "phone" && (
            <>
              {tenants.length > 1 && (
                <button onClick={() => setStep("tenant")} className="text-xs text-slate-400 hover:text-slate-600 mb-3 block">← {tenant?.name}</button>
              )}
              <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back!</h2>
              <p className="text-slate-500 text-sm mb-5">Enter your registered mobile number</p>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Mobile Number</label>
                <div className="flex items-center border-2 border-slate-200 rounded-xl focus-within:border-green-500 transition-colors">
                  <div className="flex items-center gap-1.5 px-3 border-r border-slate-200">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-sm font-semibold text-slate-600">+91</span>
                  </div>
                  <input
                    type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" autoFocus
                    className="flex-1 px-3 py-3 text-slate-800 font-medium outline-none rounded-r-xl"
                    onKeyDown={e => e.key === "Enter" && sendOtp()}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button onClick={sendOtp} disabled={loading}
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {/* OTP entry */}
          {step === "otp" && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Verify OTP</h2>
              <p className="text-slate-500 text-sm mb-1">Sent to +91 {phone}</p>
              {demoOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-700">Demo OTP:</span>
                  <span className="font-mono font-bold text-amber-800 text-lg tracking-widest">{demoOtp}</span>
                </div>
              )}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Enter 6-digit OTP</label>
                <input
                  type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •" autoFocus
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-slate-800 outline-none focus:border-green-500"
                  onKeyDown={e => e.key === "Enter" && verifyOtp()}
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button onClick={verifyOtp} disabled={loading}
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button onClick={() => { setStep("phone"); setError(""); setDemoOtp(null); }}
                className="w-full mt-3 text-slate-500 text-sm py-2 hover:text-slate-700">← Change number</button>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a href="/hbl/admin" className="text-xs text-slate-400 hover:text-green-600">Admin Dashboard →</a>
          </div>
        </div>

        <p className="text-center text-green-200 text-xs mt-4">New member? Contact your club admin to register.</p>
      </div>
    </div>
  );
}
