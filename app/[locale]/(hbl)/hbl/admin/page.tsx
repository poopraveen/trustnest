"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, TrendingUp, ShoppingBag, CheckCircle2, AlertTriangle, RefreshCw, Loader2, Leaf, LogOut, BarChart3, Package, Bell, ScanLine, Settings, ChevronRight, Building2, Download } from "lucide-react";
import Link from "next/link";

interface Tenant { id: string; name: string; slug: string; address: string; }
interface Stats {
  totalActive: number; totalExpired: number;
  todayCheckIns: number; todayOrders: number;
  todayRevenue: number; weekRevenue: number; monthRevenue: number;
  pendingOrders: number;
  lowStock: { id: string; name: string; stock: number; minStock: number }[];
  renewalsDue: { id: string; name: string; phone: string; plan: string; expiresAt: string }[];
}

function adminHeaders(pin: string, tenantId: string) {
  return { "x-hbl-admin": pin, "x-hbl-tenant": tenantId };
}

export default function AdminDashboard() {
  const [step, setStep] = useState<"tenant" | "pin" | "dash" | "setup">("tenant");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoaded, setTenantsLoaded] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [pin, setPin] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wa, setWa] = useState<string | null>(null);
  const [setupForm, setSetupForm] = useState({ name: "", slug: "", address: "", gstin: "", fssai: "", phone: "", adminPin: "9999", superPin: "" });
  const [setupSaving, setSetupSaving] = useState(false);

  useEffect(() => {
    fetch("/api/hbl/admin/tenants").then(r => r.json()).then(d => {
      const list = d.tenants ?? [];
      setTenants(list);
      setTenantsLoaded(true);
    }).catch(() => setTenantsLoaded(true));
    const saved = sessionStorage.getItem("hbl_admin_session");
    if (saved) {
      try {
        const { tenant: t, pin: p } = JSON.parse(saved);
        setTenant(t); setPin(p); setStep("dash");
      } catch {}
    }
  }, []);

  const fetchStats = useCallback(async (p: string, t: Tenant) => {
    setLoading(true);
    const res = await fetch("/api/hbl/admin/stats", { headers: adminHeaders(p, t.id) });
    if (res.status === 401) { setStep("tenant"); setError("Invalid PIN"); setLoading(false); return; }
    setStats(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (step === "dash" && tenant && pin && !stats) fetchStats(pin, tenant);
  }, [step, tenant, pin, stats, fetchStats]);

  function selectTenant(t: Tenant) { setTenant(t); setStep("pin"); setError(""); }

  async function createFirstBranch() {
    if (!setupForm.name || !setupForm.superPin) { setError("Branch name and super PIN required"); return; }
    setSetupSaving(true); setError("");
    const slug = setupForm.slug || setupForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const res = await fetch("/api/hbl/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": setupForm.superPin },
      body: JSON.stringify({ name: setupForm.name, slug, address: setupForm.address, gstin: setupForm.gstin, fssai: setupForm.fssai, phone: setupForm.phone }),
    });
    const data = await res.json();
    setSetupSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed — check your super PIN (default: 9999)"); return; }
    // If custom adminPin, update it
    if (setupForm.adminPin && setupForm.adminPin !== "9999") {
      await fetch(`/api/hbl/admin/tenants/${data.tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-hbl-admin": setupForm.superPin },
        body: JSON.stringify({ adminPin: setupForm.adminPin }),
      });
    }
    // Refresh tenant list and proceed to pin step
    const newTenant = { ...data.tenant, adminPin: setupForm.adminPin || "9999" };
    setTenants([newTenant]); setTenant(newTenant); setPin(setupForm.adminPin || setupForm.superPin);
    sessionStorage.setItem("hbl_admin_session", JSON.stringify({ tenant: newTenant, pin: setupForm.adminPin || setupForm.superPin }));
    setStep("dash");
  }

  async function login() {
    if (!pin.trim() || !tenant) { setError("Enter PIN"); return; }
    setError("");
    // Verify PIN
    const res = await fetch("/api/hbl/admin/stats", { headers: adminHeaders(pin, tenant.id) });
    if (res.status === 401) { setError("Invalid PIN"); return; }
    sessionStorage.setItem("hbl_admin_session", JSON.stringify({ tenant, pin }));
    setStats(await res.json());
    setStep("dash");
  }

  function logout() {
    sessionStorage.removeItem("hbl_admin_session");
    setStep("tenant"); setTenant(null); setPin(""); setStats(null); setError("");
  }

  async function sendWhatsApp(type: string, memberId: string) {
    if (!tenant) return;
    const res = await fetch("/api/hbl/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...adminHeaders(pin, tenant.id) },
      body: JSON.stringify({ type, memberId }),
    });
    const data = await res.json();
    if (res.ok) { setWa(data.whatsappUrl); window.open(data.whatsappUrl, "_blank"); }
  }

  // ── Tenant selection ────────────────────────────────────────────────────────
  if (step === "setup") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <button onClick={() => { setStep("tenant"); setError(""); }} className="text-xs text-slate-400 hover:text-slate-600 mb-4 block">← Back</button>
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-1">Create First Branch</h2>
          <p className="text-slate-500 text-xs">One-time setup for your Herbalife club</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Branch / Club Name *</label>
            <input value={setupForm.name} onChange={e => setSetupForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))}
              placeholder="e.g. Veppampattu Nutrition Club"
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Address</label>
            <input value={setupForm.address} onChange={e => setSetupForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Full address"
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">GSTIN</label>
              <input value={setupForm.gstin} onChange={e => setSetupForm(f => ({ ...f, gstin: e.target.value }))}
                placeholder="Optional"
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">FSSAI</label>
              <input value={setupForm.fssai} onChange={e => setSetupForm(f => ({ ...f, fssai: e.target.value }))}
                placeholder="Optional"
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Branch Admin PIN</label>
            <input type="password" value={setupForm.adminPin} onChange={e => setSetupForm(f => ({ ...f, adminPin: e.target.value }))}
              placeholder="PIN for this branch (default: 9999)"
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Super Admin PIN *</label>
            <input type="password" value={setupForm.superPin} onChange={e => setSetupForm(f => ({ ...f, superPin: e.target.value }))}
              placeholder="Master PIN from Vercel env (default: 9999)"
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
            <p className="text-xs text-slate-400 mt-1">This is the HBL_ADMIN_PIN in your Vercel settings (default: 9999)</p>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <button onClick={createFirstBranch} disabled={setupSaving}
          className="mt-5 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
          {setupSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Branch & Continue"}
        </button>
      </div>
    </div>
  );

  if (step === "tenant") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">HBL Admin</h2>
          <p className="text-slate-500 text-sm">Select your branch to continue</p>
        </div>
        {!tenantsLoaded ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm font-semibold">No branches set up yet</p>
            <p className="text-slate-400 text-xs">Create your first branch to get started</p>
            <button onClick={() => { setStep("setup"); setError(""); }}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 text-sm">
              + Create First Branch
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tenants.map(t => (
              <button key={t.id} onClick={() => selectTenant(t)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-green-400 hover:bg-green-50 transition-all text-left">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  {t.address && <p className="text-xs text-slate-500 truncate">{t.address}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
            <button onClick={() => { setStep("setup"); setError(""); }}
              className="w-full mt-1 text-xs text-slate-400 hover:text-green-600 py-2 border border-dashed border-slate-200 rounded-xl hover:border-green-400 transition-colors">
              + Add Another Branch
            </button>
          </div>
        )}
        <Link href="/hbl" className="block mt-6 text-center text-sm text-slate-400 hover:text-slate-600">← Customer Portal</Link>
      </div>
    </div>
  );

  // ── PIN entry ───────────────────────────────────────────────────────────────
  if (step === "pin") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <button onClick={() => setStep("tenant")} className="text-xs text-slate-400 hover:text-slate-600 mb-4 block mx-auto">← Change branch</button>
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-0.5">{tenant?.name}</h2>
        <p className="text-slate-500 text-sm mb-6">Enter your admin PIN</p>
        <input
          type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="• • • •" maxLength={8} autoFocus
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono mb-3 outline-none focus:border-green-500"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={login} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Enter</button>
      </div>
    </div>
  );

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const navLinks = [
    { href: "/hbl/admin", label: "Dashboard" },
    { href: "/hbl/admin/members", label: "Members" },
    { href: "/hbl/admin/scanner", label: "🔍 Scanner" },
    { href: "/hbl/admin/new-joiners", label: "New Joiners" },
    { href: "/hbl/admin/shake-tracker", label: "Shake Tracker" },
    { href: "/hbl/admin/followup", label: "Follow-Ups" },
    { href: "/hbl/admin/products", label: "Products" },
    { href: "/hbl/admin/orders", label: "Orders" },
    { href: "/hbl/admin/reports", label: "Reports" },
    { href: "/hbl/admin/settings", label: "⚙ Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-6 h-6 text-green-400" />
            <div>
              <h1 className="font-black text-sm">{tenant?.name ?? "HBL Admin"}</h1>
              <p className="text-slate-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/hbl/admin/scanner" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 title='Barcode Scanner'">
              <ScanLine className="w-4 h-4" />
            </Link>
            <button onClick={() => tenant && fetchStats(pin, tenant)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {navLinks.map(n => (
            <Link key={n.href} href={n.href} className="px-3 py-1.5 text-xs font-semibold bg-white/10 rounded-lg hover:bg-white/20 whitespace-nowrap">{n.label}</Link>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {loading || !stats ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Active Members", value: stats.totalActive, icon: Users, color: "text-green-600", bg: "bg-green-50" },
                { label: "Today Check-ins", value: stats.todayCheckIns, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Today Orders", value: stats.todayOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Pending Orders", value: stats.pendingOrders, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Today", amount: stats.todayRevenue },
                { label: "This Week", amount: stats.weekRevenue },
                { label: "This Month", amount: stats.monthRevenue },
              ].map(({ label, amount }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                  <p className="text-xl font-black text-slate-800">Rs.{amount.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-slate-800">Low Stock Alerts</h3>
                  {stats.lowStock.length > 0 && <span className="ml-auto text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{stats.lowStock.length}</span>}
                </div>
                {stats.lowStock.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">All products well-stocked ✓</p>
                ) : (
                  <div className="space-y-2">
                    {stats.lowStock.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                        <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                        <span className="text-xs font-bold text-red-600">{p.stock} left (min {p.minStock})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-800">Renewals Due (7 days)</h3>
                  {stats.renewalsDue.length > 0 && <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{stats.renewalsDue.length}</span>}
                </div>
                {stats.renewalsDue.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No renewals due soon ✓</p>
                ) : (
                  <div className="space-y-2">
                    {stats.renewalsDue.map(m => {
                      const days = Math.ceil((new Date(m.expiresAt).getTime() - Date.now()) / 86400000);
                      return (
                        <div key={m.id} className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.phone} · {m.plan}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-700">{days}d left</span>
                            <button onClick={() => sendWhatsApp("renewal", m.id)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700">WA</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { href: "/hbl/admin/scanner", icon: ScanLine, label: "Scanner", color: "bg-teal-600" },
                { href: "/hbl/admin/members", icon: Users, label: "Members", color: "bg-green-600" },
                { href: "/hbl/admin/new-joiners", icon: Users, label: "New Joiners", color: "bg-blue-600" },
                { href: "/hbl/admin/shake-tracker", icon: BarChart3, label: "Shake Tracker", color: "bg-cyan-600" },
                { href: "/hbl/admin/followup", icon: Bell, label: "Follow-Ups", color: "bg-amber-500" },
                { href: "/hbl/admin/products", icon: Package, label: "Products", color: "bg-emerald-600" },
                { href: "/hbl/admin/orders", icon: ShoppingBag, label: "Orders", color: "bg-purple-600" },
                { href: "/hbl/admin/settings", icon: Settings, label: "Settings", color: "bg-slate-600" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} className={`${color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity text-center`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{label}</span>
                </Link>
              ))}
              <a href="/TrustNest_HBL_Brochure.pdf" download className="bg-indigo-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity text-center">
                <Download className="w-6 h-6" />
                <span className="text-xs font-bold">Brochure PDF</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
