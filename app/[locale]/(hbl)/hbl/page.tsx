"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Leaf, Phone, ShieldCheck } from "lucide-react";

export default function HblLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function sendOtp() {
    if (!/^\d{10}$/.test(phone)) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/hbl/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setDemoOtp(data.otp); setStep("otp"); }
    else setError(data.error ?? "Failed to send OTP");
  }

  async function verifyOtp() {
    setLoading(true); setError("");
    const res = await fetch("/api/hbl/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push("/hbl/dashboard");
    else setError(data.error ?? "Invalid OTP");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-white">TrustNest</h1>
          <p className="text-green-100 font-semibold text-lg">Herbalife Nutrition Club</p>
          <p className="text-green-200 text-sm mt-1">Member Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {step === "phone" ? (
            <>
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
                    type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" className="flex-1 px-3 py-3 text-slate-800 font-medium outline-none rounded-r-xl"
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button onClick={sendOtp} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
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
                  type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-slate-800 outline-none focus:border-green-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button onClick={verifyOtp} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button onClick={() => { setStep("phone"); setError(""); setDemoOtp(null); }} className="w-full mt-3 text-slate-500 text-sm py-2 hover:text-slate-700">← Change number</button>
            </>
          )}

          {/* Admin link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a href="/hbl/admin" className="text-xs text-slate-400 hover:text-green-600 transition-colors">Admin Dashboard →</a>
          </div>
        </div>

        <p className="text-center text-green-200 text-xs mt-4">New member? Contact your distributor to register.</p>
      </div>
    </div>
  );
}
