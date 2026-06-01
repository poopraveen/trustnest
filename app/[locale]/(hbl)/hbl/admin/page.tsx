"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, TrendingUp, ShoppingBag, CheckCircle2, AlertTriangle, RefreshCw, Loader2, Leaf, LogOut, BarChart3, Package, Bell } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalActive: number; totalExpired: number;
  todayCheckIns: number; todayOrders: number;
  todayRevenue: number; weekRevenue: number; monthRevenue: number;
  pendingOrders: number;
  lowStock: { id: string; name: string; stock: number; minStock: number }[];
  renewalsDue: { id: string; name: string; phone: string; plan: string; expiresAt: string }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wa, setWa] = useState<string | null>(null);

  const fetchStats = useCallback(async (adminPin: string) => {
    setLoading(true);
    const res = await fetch("/api/hbl/admin/stats", { headers: { "x-hbl-admin": adminPin } });
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  function login() {
    if (!pin.trim()) { setError("Enter admin PIN"); return; }
    setError("");
    setAuthed(true);
    sessionStorage.setItem("hbl_admin_pin", pin);
    fetchStats(pin);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("hbl_admin_pin");
    if (saved) { setPin(saved); setAuthed(true); fetchStats(saved); }
  }, [fetchStats]);

  async function sendWhatsApp(type: string, memberId: string) {
    const adminPin = sessionStorage.getItem("hbl_admin_pin") ?? pin;
    const res = await fetch("/api/hbl/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": adminPin },
      body: JSON.stringify({ type, memberId }),
    });
    const data = await res.json();
    if (res.ok) { setWa(data.whatsappUrl); window.open(data.whatsappUrl, "_blank"); }
  }

  function logout() { sessionStorage.removeItem("hbl_admin_pin"); setAuthed(false); setPin(""); setStats(null); }

  if (!authed) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-1">Admin Access</h2>
        <p className="text-slate-500 text-sm mb-6">Enter your 4-digit PIN to continue</p>
        <input
          type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="• • • •" maxLength={6}
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono mb-3 outline-none focus:border-green-500"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={login} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Enter</button>
        <Link href="/hbl" className="block mt-4 text-sm text-slate-400 hover:text-slate-600">← Customer Portal</Link>
      </div>
    </div>
  );

  const adminPin = sessionStorage.getItem("hbl_admin_pin") ?? pin;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-6 h-6 text-green-400" />
            <div>
              <h1 className="font-black text-sm">HBL Admin</h1>
              <p className="text-slate-400 text-xs">Nutrition Club Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchStats(adminPin)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Nav */}
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {[
            { href: "/hbl/admin", label: "Dashboard" },
            { href: "/hbl/admin/members", label: "Members" },
            { href: "/hbl/admin/products", label: "Products" },
            { href: "/hbl/admin/orders", label: "Orders" },
            { href: "/hbl/admin/reports", label: "Reports" },
          ].map(n => (
            <Link key={n.href} href={n.href} className="px-3 py-1.5 text-xs font-semibold bg-white/10 rounded-lg hover:bg-white/20 whitespace-nowrap">{n.label}</Link>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {loading || !stats ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : (
          <>
            {/* KPI grid */}
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

            {/* Revenue */}
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
                  <p className="text-xl font-black text-slate-800">₹{amount.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Low Stock Alerts */}
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

              {/* Renewal Reminders */}
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
                            <button
                              onClick={() => sendWhatsApp("renewal", m.id)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700"
                            >
                              WA
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { href: "/hbl/admin/members", icon: Users, label: "Manage Members", color: "bg-green-600" },
                { href: "/hbl/admin/products", icon: Package, label: "Manage Products", color: "bg-emerald-600" },
                { href: "/hbl/admin/orders", icon: ShoppingBag, label: "View Orders", color: "bg-teal-600" },
                { href: "/hbl/admin/reports", icon: BarChart3, label: "Reports", color: "bg-cyan-600" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} className={`${color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity text-center`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
