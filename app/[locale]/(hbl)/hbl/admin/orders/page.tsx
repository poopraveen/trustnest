"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ShoppingBag, Loader2, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string; orderNo: string; status: string; totalAmount: number;
  createdAt: string; pickupTime?: string; notes?: string;
  member: { name: string; phone: string };
  items: { qty: number; price: number; product: { name: string } }[];
}

const STATUS_FLOW: Record<string, string | null> = {
  PENDING: "PREPARING", PREPARING: "READY", READY: "DELIVERED", DELIVERED: null, CANCELLED: null,
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", PREPARING: "bg-blue-100 text-blue-700",
  READY: "bg-green-100 text-green-700", DELIVERED: "bg-slate-100 text-slate-600", CANCELLED: "bg-red-100 text-red-700",
};


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

export default function AdminOrders() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/hbl/admin/orders${params}`, { headers: adminHeaders() });
    if (res.ok) { const d = await res.json(); setOrders(d.orders ?? []); }
    setLoading(false);
  }, [ statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function advanceStatus(id: string, nextStatus: string) {
    setUpdating(id);
    await fetch(`/api/hbl/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders() },
      body: JSON.stringify({ status: nextStatus }),
    });
    setUpdating(null);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <ShoppingBag className="w-5 h-5 text-green-400" />
          <h1 className="font-bold flex-1">Orders</h1>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {["ALL", "PENDING", "PREPARING", "READY", "DELIVERED"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s === "ALL" ? "" : s)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${statusFilter === (s === "ALL" ? "" : s) ? "bg-white text-slate-800" : "bg-white/10 text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-green-600" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No orders</p></div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const next = STATUS_FLOW[o.status];
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{o.orderNo}</p>
                      <p className="font-bold text-slate-800">{o.member.name}</p>
                      <p className="text-xs text-slate-500">{o.member.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                      <p className="font-black text-slate-800 mt-1">₹{o.totalAmount.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {o.items.map((item, i) => (
                      <p key={i} className="text-sm text-slate-600">{item.qty}× {item.product.name} <span className="text-slate-400">@₹{item.price}</span></p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {o.pickupTime && <span>· Pickup {new Date(o.pickupTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
                    </div>
                    {next && (
                      <button onClick={() => advanceStatus(o.id, next)} disabled={updating === o.id}
                        className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-green-700 disabled:opacity-60">
                        {updating === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Mark {next}
                      </button>
                    )}
                  </div>
                  {o.notes && <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-lg px-2 py-1.5">📝 {o.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
