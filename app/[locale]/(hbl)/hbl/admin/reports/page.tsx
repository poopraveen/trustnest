"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, BarChart3, TrendingUp, Users, Package, Loader2 } from "lucide-react";
import Link from "next/link";

interface Reports {
  dailySales: Record<string, number>;
  popularProducts: { productId: string; _sum: { qty: number | null }; product?: { name: string; category: string } }[];
  retentionData: { status: string; _count: { id: number } }[];
  newMembers: number;
  totalOrders: number;
  totalRevenue: number;
}


function getAdminSession() {
  if (typeof window === "undefined") return { pin: "", tenantId: "" };
  try {
    const s = JSON.parse(sessionStorage.getItem("hbl_admin_session") ?? "{}");
    return { pin: s.pin ?? "", tenantId: s.tenant?.id ?? "" };
  } catch { return { pin: "", tenantId: "" }; }
}

function adminHeaders() {
  const s = getAdminSession();
  return { "x-hbl-admin": s.pin, ...(s.tenantId ? { "x-hbl-tenant": s.tenantId } : {}) };
}

export default function AdminReports() {

  const [range, setRange] = useState<"week" | "month" | "year">("month");
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/hbl/admin/reports?range=${range}`, { headers: adminHeaders() });
    if (res.ok) { const d = await res.json(); setData(d); }
    setLoading(false);
  }, [ range]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const dailyEntries = data ? Object.entries(data.dailySales).sort(([a], [b]) => a.localeCompare(b)) : [];
  const maxRevenue = dailyEntries.length ? Math.max(...dailyEntries.map(([, v]) => v)) : 1;
  const activeCount = data?.retentionData.find(r => r.status === "ACTIVE")?._count.id ?? 0;
  const totalCount = data?.retentionData.reduce((s, r) => s + r._count.id, 0) ?? 0;
  const retentionRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h1 className="font-bold flex-1">Reports & Analytics</h1>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-2">
          {(["week", "month", "year"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${range === r ? "bg-white text-slate-800" : "bg-white/10 text-white"}`}>
              This {r}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : !data ? (
          <p className="text-center text-slate-400 py-16">No data available</p>
        ) : (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: `₹${data.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                { label: "Total Orders", value: data.totalOrders, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "New Members", value: data.newMembers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Retention Rate", value: `${retentionRate}%`, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-xl font-black text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="font-bold text-slate-800 mb-4">Daily Revenue</h3>
              {dailyEntries.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No sales data</p>
              ) : (
                <div className="flex items-end gap-1 h-32 overflow-x-auto">
                  {dailyEntries.map(([date, amount]) => (
                    <div key={date} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
                      <div className="w-full bg-green-200 rounded-t-md hover:bg-green-400 transition-colors relative group"
                        style={{ height: `${Math.max(4, (amount / maxRevenue) * 100)}px` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          ₹{amount}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 rotate-45 origin-left">{date.slice(5)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Popular Products */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 mb-3">🏆 Popular Products</h3>
                {data.popularProducts.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.popularProducts.map((p, i) => {
                      const maxQty = data.popularProducts[0]._sum.qty ?? 1;
                      const qty = p._sum.qty ?? 0;
                      return (
                        <div key={p.productId}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-700">{i + 1}. {p.product?.name ?? "Unknown"}</span>
                            <span className="text-xs font-bold text-green-700">{qty} sold</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(qty / maxQty) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Member Retention */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 mb-3">👥 Member Status</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                        strokeDasharray={`${retentionRate} ${100 - retentionRate}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xl font-black text-slate-800">{retentionRate}%</p>
                      <p className="text-[10px] text-slate-500">Active</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.retentionData.map(r => (
                    <div key={r.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${r.status === "ACTIVE" ? "bg-green-500" : r.status === "EXPIRED" ? "bg-red-400" : "bg-slate-300"}`} />
                        <span className="text-sm text-slate-600">{r.status}</span>
                      </div>
                      <span className="font-bold text-slate-800">{r._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
