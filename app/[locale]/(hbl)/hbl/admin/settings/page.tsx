"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Leaf, Save, Loader2, CheckCircle2, Building2, Lock, QrCode } from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string; name: string; slug: string; legalName: string; address: string;
  email: string; gstin: string; fssai: string; phone: string; adminPin: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [adminPin, setAdminPin] = useState("");
  const [form, setForm] = useState({ name: "", legalName: "", address: "", email: "", gstin: "", fssai: "", phone: "", adminPin: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("hbl_admin_session");
    if (!stored) { router.replace("/hbl/admin"); return; }
    try {
      const { tenant: t, pin: p } = JSON.parse(stored);
      setTenant(t); setAdminPin(p);
      setForm({ name: t.name, legalName: t.legalName ?? "", address: t.address ?? "", email: t.email ?? "", gstin: t.gstin ?? "", fssai: t.fssai ?? "", phone: t.phone ?? "", adminPin: "" });
    } catch { router.replace("/hbl/admin"); }
  }, [router]);

  async function save() {
    if (!tenant) return;
    if (!form.name.trim()) { setError("Branch name is required"); return; }
    setSaving(true); setError("");

    const res = await fetch(`/api/hbl/admin/tenants/${tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-hbl-admin": adminPin, "x-hbl-tenant": tenant.id },
      body: JSON.stringify({ name: form.name, legalName: form.legalName, address: form.address, email: form.email, gstin: form.gstin, fssai: form.fssai, phone: form.phone }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Failed to save"); return; }

    // Update session storage with new name
    const stored = sessionStorage.getItem("hbl_admin_session");
    if (stored) {
      const session = JSON.parse(stored);
      session.tenant = { ...session.tenant, ...data.tenant };
      sessionStorage.setItem("hbl_admin_session", JSON.stringify(session));
      setTenant(session.tenant);
    }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  async function changePin() {
    if (!tenant) return;
    if (!newPin || newPin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    if (newPin !== confirmPin) { setError("PINs do not match"); return; }

    const res = await fetch(`/api/hbl/admin/tenants/${tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-hbl-admin": adminPin, "x-hbl-tenant": tenant.id },
      body: JSON.stringify({ adminPin: newPin }),
    });

    if (!res.ok) { setError("Failed to change PIN"); return; }

    // Update session with new PIN
    const stored = sessionStorage.getItem("hbl_admin_session");
    if (stored) {
      const session = JSON.parse(stored);
      session.pin = newPin;
      sessionStorage.setItem("hbl_admin_session", JSON.stringify(session));
    }
    setAdminPin(newPin); setNewPin(""); setConfirmPin(""); setShowPinChange(false);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  if (!tenant) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

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
              <h1 className="font-bold text-sm">Branch Settings</h1>
              <p className="text-slate-400 text-xs">{tenant.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Branch details */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800">Branch Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Branch / Club Name *</label>
              <input
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                placeholder="e.g. Veppampattu Nutrition Club"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Proprietor / FBO Name</label>
              <input
                value={form.legalName} onChange={e => setForm(f => ({ ...f, legalName: e.target.value }))}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                placeholder="As per FSSAI licence (e.g. S K C Yoganathan)"
              />
              <p className="text-[11px] text-slate-400 mt-1">Shown as the seller name on invoices / bills of supply.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Address</label>
              <textarea
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={2}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 resize-none"
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GSTIN</label>
                <input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="33AAACH..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">FSSAI No.</label>
                <input value={form.fssai} onChange={e => setForm(f => ({ ...f, fssai: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="10013..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Branch Phone / WhatsApp</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Branch Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="branch@example.com" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-2.5">
              <p className="text-xs text-slate-400">Slug (URL identifier): <span className="font-mono font-semibold text-slate-600">{tenant.slug}</span></p>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button onClick={save} disabled={saving}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Branch QR Code */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800">Branch QR Code</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Print and display this at your club entrance. Members scan it to instantly open your branch portal.
          </p>
          <div className="flex items-center gap-4 bg-green-50 rounded-2xl p-4 border border-green-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "https://trustnest-tsgz.vercel.app") + "/hbl?t=" + tenant.slug)}&size=100x100&bgcolor=ffffff&color=14532d&qzone=1`}
              alt="Branch QR" className="w-24 h-24 rounded-xl border-2 border-green-200 shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">{tenant.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">/hbl?t={tenant.slug}</p>
              <Link href="/hbl/admin/branch-qr"
                className="inline-flex items-center gap-1.5 mt-3 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700">
                <QrCode className="w-3.5 h-3.5" /> View Full Poster / Print
              </Link>
            </div>
          </div>
        </div>

        {/* Change PIN */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-500" />
              <h2 className="font-bold text-slate-800">Admin PIN</h2>
            </div>
            <button onClick={() => setShowPinChange(!showPinChange)}
              className="text-xs text-green-600 font-semibold hover:text-green-700">
              {showPinChange ? "Cancel" : "Change PIN"}
            </button>
          </div>

          {!showPinChange ? (
            <p className="text-sm text-slate-500">Current PIN: <span className="font-mono">{"•".repeat(adminPin.length)}</span></p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">New PIN (min 4 digits)</label>
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="New PIN" maxLength={8} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm New PIN</label>
                <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="Confirm PIN" maxLength={8} />
              </div>
              <button onClick={changePin}
                className="w-full bg-slate-700 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 text-sm">
                Update PIN
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
