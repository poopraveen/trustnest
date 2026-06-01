"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Star, Loader2, Clock } from "lucide-react";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PREPARING: "bg-blue-100 text-blue-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"orders" | "points">("orders");
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/hbl/orders").then(r => { if (r.status === 401) { router.replace("/hbl"); return null; } return r.json(); }),
      fetch("/api/hbl/auth/me").then(r => r.json()),
    ]).then(([ordersData, meData]) => {
      if (ordersData) setOrders(ordersData.orders ?? []);
      if (meData?.member) setPoints([]);
    }).finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/dashboard" className="p-1.5 bg-white/20 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="font-bold">My History</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-3">
          {(["orders", "points"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "bg-white text-green-700" : "bg-white/20 text-white"}`}>
              {t === "orders" ? "Orders" : "Points"}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-green-600" /></div>
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o: any) => (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{o.orderNo}</p>
                      <p className="font-bold text-slate-800">₹{o.totalAmount.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="space-y-1">
                    {o.items.map((item: any) => (
                      <p key={item.id} className="text-sm text-slate-600">{item.qty}× {item.product.name} <span className="text-slate-400">₹{item.price}</span></p>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-500">Points history coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Earn 1 pt/check-in, 1 pt/₹100 spent</p>
          </div>
        )}
      </div>
    </div>
  );
}
