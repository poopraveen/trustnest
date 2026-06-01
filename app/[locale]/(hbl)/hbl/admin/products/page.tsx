"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Package, Loader2, X, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string; name: string; nameTa: string | null; category: string;
  price: number; stock: number; minStock: number; isActive: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = { SHAKE: "🥤", TEA: "🍵", SUPPLEMENT: "💊", SNACK: "🍪" };

export default function AdminProducts() {
  const [pin] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("hbl_admin_pin") ?? "" : "");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editStock, setEditStock] = useState<{ id: string; stock: number } | null>(null);
  const [form, setForm] = useState({ name: "", nameTa: "", category: "SHAKE", price: "", stock: "0", minStock: "10" });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hbl/products?active=false", { headers: { "x-hbl-admin": pin } });
    if (res.ok) { const d = await res.json(); setProducts(d.products ?? []); }
    setLoading(false);
  }, [pin]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function seedDefaults() {
    setSeeding(true);
    const res = await fetch("/api/hbl/admin/seed-products", { method: "POST", headers: { "x-hbl-admin": pin } });
    const d = await res.json();
    setSeeding(false);
    if (res.ok) { setMsg(`✅ Added ${d.created} products (${d.skipped} already existed)`); fetchProducts(); }
    else setMsg("Seed failed");
    setTimeout(() => setMsg(""), 4000);
  }

  async function addProduct() {
    if (!form.name || !form.category || !form.price) return;
    setSaving(true); setMsg("");
    const res = await fetch("/api/hbl/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), minStock: parseInt(form.minStock) }),
    });
    setSaving(false);
    if (res.ok) { setMsg("Product added!"); setShowAdd(false); setForm({ name: "", nameTa: "", category: "SHAKE", price: "", stock: "0", minStock: "10" }); fetchProducts(); }
    else { const d = await res.json(); setMsg(d.error ?? "Failed"); }
  }

  async function updateStock(id: string, stock: number) {
    setSaving(true);
    await fetch(`/api/hbl/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify({ stock }),
    });
    setSaving(false); setEditStock(null); fetchProducts();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/hbl/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <Package className="w-5 h-5 text-green-400" />
          <h1 className="font-bold flex-1">Products & Stock</h1>
          <button onClick={seedDefaults} disabled={seeding} className="flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Load Defaults
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-green-600 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-green-700">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {msg && <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-800 font-medium">{msg}</div>}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-green-600" /></div>
        ) : (
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border p-4 ${!p.isActive ? "opacity-50 border-slate-100" : p.stock <= p.minStock ? "border-red-200" : "border-slate-100"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJI[p.category] ?? "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      {p.nameTa && <p className="text-xs text-slate-400">{p.nameTa}</p>}
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                      {!p.isActive && <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>}
                      {p.stock <= p.minStock && p.isActive && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Low Stock</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="font-bold text-green-700">₹{p.price}</span>
                      <span className="text-slate-500">Stock: <strong className={p.stock <= p.minStock ? "text-red-600" : "text-slate-800"}>{p.stock}</strong> / min {p.minStock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editStock?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editStock.stock} onChange={e => setEditStock({ id: p.id, stock: parseInt(e.target.value) || 0 })}
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center outline-none" />
                        <button onClick={() => updateStock(p.id, editStock.stock)} className="p-1.5 bg-green-600 text-white rounded-lg"><CheckCircle2 className="w-4 h-4" /></button>
                        <button onClick={() => setEditStock(null)} className="p-1.5 bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setEditStock({ id: p.id, stock: p.stock })} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl hover:bg-slate-200 font-semibold">Edit Stock</button>
                    )}
                    <button onClick={() => toggleActive(p)} className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold ${p.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                      {p.isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="text-center py-16 text-slate-400"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No products yet</p></div>}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Product</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Tamil Name</label>
                <input value={form.nameTa} onChange={e => setForm(f => ({ ...f, nameTa: e.target.value }))} placeholder="Optional" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">
                  <option value="SHAKE">🥤 Shake</option><option value="TEA">🍵 Tea</option>
                  <option value="SUPPLEMENT">💊 Supplement</option><option value="SNACK">🍪 Snack</option>
                </select></div>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: "price", label: "Price (₹)" }, { key: "stock", label: "Initial Stock" }, { key: "minStock", label: "Min Stock" }].map(({ key, label }) => (
                  <div key={key}><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{label}</label>
                    <input type="number" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
                ))}
              </div>
            </div>
            {msg && <p className={`text-sm mt-3 font-medium ${msg === "Product added!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
            <button onClick={addProduct} disabled={saving} className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
