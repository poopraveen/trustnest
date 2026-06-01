"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Plus, Minus, ArrowLeft, Clock, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product { id: string; name: string; nameTa: string | null; category: string; price: number; stock: number; imageUrl: string | null; }
interface CartItem { product: Product; qty: number; }

const CATEGORY_EMOJI: Record<string, string> = { SHAKE: "🥤", TEA: "🍵", SUPPLEMENT: "💊", SNACK: "🍪" };

export default function OrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [category, setCategory] = useState("ALL");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hbl/products").then(r => r.json()).then(d => setProducts(d.products ?? [])).finally(() => setLoading(false));
  }, []);

  function addToCart(p: Product) {
    setCart(c => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty ?? 0) + 1 } }));
  }

  function removeFromCart(p: Product) {
    setCart(c => {
      const qty = (c[p.id]?.qty ?? 0) - 1;
      if (qty <= 0) { const { [p.id]: _, ...rest } = c; return rest; }
      return { ...c, [p.id]: { product: p, qty } };
    });
  }

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === "ALL" ? products : products.filter(p => p.category === category);

  async function placeOrder() {
    if (!cartItems.length) return;
    setPlacing(true);
    const res = await fetch("/api/hbl/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems.map(i => ({ productId: i.product.id, qty: i.qty })), pickupTime: pickupTime || undefined, notes }),
    });
    const data = await res.json();
    setPlacing(false);
    if (res.ok) { setSuccess(data.order.orderNo); setCart({}); }
  }

  if (success) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Order Placed!</h2>
        <p className="text-slate-500 mt-2 mb-1">Order number</p>
        <p className="font-mono font-bold text-green-700 text-lg">{success}</p>
        {pickupTime && <p className="text-sm text-slate-500 mt-2">Pickup at {new Date(pickupTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>}
        <Link href="/hbl/dashboard" className="mt-6 block bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/dashboard" className="p-1.5 bg-white/20 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="font-bold">Order Ahead</h1>
            <p className="text-green-100 text-xs">Pick up your shake or tea</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${category === c ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {CATEGORY_EMOJI[c] ?? "🛒"} {c}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-green-600" /></div>
        ) : (
          <div className="space-y-2 mb-6">
            {filtered.map(p => {
              const qty = cart[p.id]?.qty ?? 0;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                  <div className="text-3xl">{CATEGORY_EMOJI[p.category] ?? "🥤"}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{p.name}</p>
                    {p.nameTa && <p className="text-xs text-slate-400">{p.nameTa}</p>}
                    <p className="text-green-700 font-bold">₹{p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {qty > 0 && (
                      <>
                        <button onClick={() => removeFromCart(p)} className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="font-bold w-5 text-center">{qty}</span>
                      </>
                    )}
                    <button onClick={() => addToCart(p)} className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && !loading && <p className="text-center text-slate-400 py-8">No products in this category</p>}
          </div>
        )}

        {/* Pickup time */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2"><Clock className="w-4 h-4" />Pickup Time (optional)</label>
          <input type="datetime-local" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Special notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500 resize-none" placeholder="e.g. Less sugar, extra protein..." />
        </div>
      </div>

      {/* Bottom cart bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 shadow-xl p-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <span className="font-bold">{cartItems.reduce((s, i) => s + i.qty, 0)} items</span>
              </div>
              <span className="font-black text-lg">₹{total.toFixed(2)}</span>
            </div>
            <button onClick={placeOrder} disabled={placing} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
              {placing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
