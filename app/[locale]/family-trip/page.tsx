"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Edit2, X, Check, Send, Settings,
  Wallet, Users, TrendingUp, Tag, Calendar,
  Bell, BellOff, ChevronDown, Loader2, RefreshCw,
  Plane, UtensilsCrossed, Hotel, Car, ShoppingBag, Ticket, MoreHorizontal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "Food" | "Transport" | "Hotel" | "Shopping" | "Entertainment" | "Other";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  paidBy: string;
  date: string;
  note: string;
}

interface TelegramConfig {
  token: string;
  chatId: string;
  enabled: boolean;
}

interface TripConfig {
  name: string;
  members: string[];
  currency: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: "Food",          icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: "#f97316" },
  { label: "Transport",     icon: <Car className="w-3.5 h-3.5" />,            color: "#3b82f6" },
  { label: "Hotel",         icon: <Hotel className="w-3.5 h-3.5" />,          color: "#a855f7" },
  { label: "Shopping",      icon: <ShoppingBag className="w-3.5 h-3.5" />,    color: "#ec4899" },
  { label: "Entertainment", icon: <Ticket className="w-3.5 h-3.5" />,         color: "#22c55e" },
  { label: "Other",         icon: <MoreHorizontal className="w-3.5 h-3.5" />, color: "#64748b" },
];

const catColor = (c: Category) => CATEGORIES.find(x => x.label === c)?.color ?? "#64748b";
const catIcon  = (c: Category) => CATEGORIES.find(x => x.label === c)?.icon;

const STORAGE_KEYS = {
  expenses: "ft_expenses",
  trip:     "ft_trip",
  telegram: "ft_telegram",
};

const DEFAULT_TRIP: TripConfig = {
  name: "Family Trip 2025",
  members: ["You", "Brother", "Sister", "Dad", "Mom"],
  currency: "₹",
};

const DEFAULT_TG: TelegramConfig = { token: "", chatId: "", enabled: false };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmt(n: number, cur: string) {
  return `${cur}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ ...card, padding: "16px 20px", flex: 1, minWidth: 140 }}>
      <p className="text-xs mb-1" style={{ color: "#64748b" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyTripPage() {
  const [expenses,  setExpenses]  = useState<Expense[]>([]);
  const [trip,      setTrip]      = useState<TripConfig>(DEFAULT_TRIP);
  const [tg,        setTg]        = useState<TelegramConfig>(DEFAULT_TG);

  const [showForm,     setShowForm]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editId,       setEditId]       = useState<string | null>(null);
  const [tgStatus,     setTgStatus]     = useState<"idle"|"sending"|"ok"|"error">("idle");
  const [tgError,      setTgError]      = useState("");
  const [filterCat,    setFilterCat]    = useState<Category | "All">("All");
  const [filterMember, setFilterMember] = useState("All");

  // form state
  const blank = { description: "", amount: "", category: "Food" as Category, paidBy: "", date: today(), note: "" };
  const [form, setForm] = useState(blank);

  // Load from localStorage
  useEffect(() => {
    try {
      const e = localStorage.getItem(STORAGE_KEYS.expenses);
      if (e) setExpenses(JSON.parse(e));
      const t = localStorage.getItem(STORAGE_KEYS.trip);
      if (t) setTrip(JSON.parse(t));
      const tg = localStorage.getItem(STORAGE_KEYS.telegram);
      if (tg) setTg(JSON.parse(tg));
    } catch {}
  }, []);

  // Persist expenses
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
  }, [expenses]);

  // Persist trip config
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.trip, JSON.stringify(trip));
  }, [trip]);

  // Persist telegram config
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.telegram, JSON.stringify(tg));
  }, [tg]);

  // ── Telegram notify ────────────────────────────────────────────────────────
  const sendTelegram = useCallback(async (message: string) => {
    if (!tg.enabled || !tg.token || !tg.chatId) return;
    setTgStatus("sending");
    setTgError("");
    try {
      const res = await fetch("/api/family-trip/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tg.token, chatId: tg.chatId, message }),
      });
      const data = await res.json();
      if (data.ok) {
        setTgStatus("ok");
        setTimeout(() => setTgStatus("idle"), 3000);
      } else {
        setTgStatus("error");
        setTgError(data.error ?? "Unknown error");
      }
    } catch (e) {
      setTgStatus("error");
      setTgError(String(e));
    }
  }, [tg]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  const byMember = trip.members.reduce<Record<string, number>>((acc, m) => {
    acc[m] = expenses.filter(e => e.paidBy === m).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const byCat = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.label] = expenses.filter(e => e.category === c.label).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const filtered = expenses
    .filter(e => filterCat === "All" || e.category === filterCat)
    .filter(e => filterMember === "All" || e.paidBy === filterMember)
    .sort((a, b) => b.date.localeCompare(a.date));

  // ── Form submit ────────────────────────────────────────────────────────────
  const submitForm = async () => {
    if (!form.description.trim() || !form.amount || !form.paidBy) return;
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return;

    if (editId) {
      const updated = expenses.map(e => e.id === editId
        ? { ...e, description: form.description, amount: amt, category: form.category, paidBy: form.paidBy, date: form.date, note: form.note }
        : e);
      setExpenses(updated);
      const exp = updated.find(e => e.id === editId)!;
      await sendTelegram(
        `✏️ <b>${trip.name}</b> — Expense Updated\n\n` +
        `📝 <b>${exp.description}</b>\n` +
        `💵 ${trip.currency}${amt.toLocaleString()}\n` +
        `🏷 ${exp.category}  |  👤 Paid by <b>${exp.paidBy}</b>\n` +
        `📅 ${exp.date}\n\n` +
        `💰 Total trip spend: <b>${fmt(updated.reduce((s,e) => s+e.amount,0), trip.currency)}</b>`
      );
    } else {
      const exp: Expense = { id: uid(), description: form.description, amount: amt, category: form.category, paidBy: form.paidBy, date: form.date, note: form.note };
      const updated = [exp, ...expenses];
      setExpenses(updated);
      await sendTelegram(
        `💰 <b>${trip.name}</b> — New Expense Added!\n\n` +
        `📝 <b>${exp.description}</b>\n` +
        `💵 ${trip.currency}${amt.toLocaleString()}\n` +
        `🏷 ${exp.category}  |  👤 Paid by <b>${exp.paidBy}</b>\n` +
        `📅 ${exp.date}${exp.note ? `\n📌 ${exp.note}` : ""}\n\n` +
        `💰 Total trip spend: <b>${fmt(updated.reduce((s,e) => s+e.amount,0), trip.currency)}</b>`
      );
    }
    setForm(blank);
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (e: Expense) => {
    setForm({ description: e.description, amount: String(e.amount), category: e.category, paidBy: e.paidBy, date: e.date, note: e.note });
    setEditId(e.id);
    setShowForm(true);
  };

  const deleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    if (exp) {
      await sendTelegram(
        `🗑️ <b>${trip.name}</b> — Expense Deleted\n\n` +
        `📝 <del>${exp.description}</del>\n` +
        `💵 ${trip.currency}${exp.amount.toLocaleString()}\n\n` +
        `💰 Remaining total: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0), trip.currency)}</b>`
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#060912", color: "white" }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(6,9,18,0.96)", borderBottom: "1px solid rgba(249,115,22,0.15)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{trip.name}</p>
            <p className="text-xs" style={{ color: "#64748b" }}>{expenses.length} expenses · {trip.members.length} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Telegram status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
            style={{
              background: tg.enabled ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
              border: `1px solid ${tg.enabled ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.2)"}`,
              color: tg.enabled ? "#4ade80" : "#64748b",
            }}>
            {tgStatus === "sending" ? <Loader2 className="w-3 h-3 animate-spin" />
              : tgStatus === "ok"  ? <Check className="w-3 h-3" />
              : tgStatus === "error" ? <X className="w-3 h-3" style={{ color: "#f87171" }} />
              : tg.enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            {tgStatus === "sending" ? "Sending…"
              : tgStatus === "ok"  ? "Sent!"
              : tgStatus === "error" ? "Error"
              : tg.enabled ? "Telegram ON" : "Telegram OFF"}
          </div>
          <button onClick={() => setShowSettings(s => !s)} className="p-2 rounded-lg transition-colors hover:bg-white/5">
            <Settings className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
          <button onClick={() => { setForm(blank); setEditId(null); setShowForm(s => !s); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "#f97316", color: "white" }}>
            <Plus className="w-4 h-4" />Add Expense
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Telegram error ────────────────────────────────────────────────── */}
        {tgStatus === "error" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            <X className="w-4 h-4 flex-shrink-0" />
            <span>Telegram error: {tgError}</span>
            <button onClick={() => setTgStatus("idle")} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ── Settings panel ────────────────────────────────────────────────── */}
        {showSettings && (
          <div style={{ ...card, padding: 20 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4" style={{ color: "#f97316" }} />Settings</p>
              <button onClick={() => setShowSettings(false)}><X className="w-4 h-4" style={{ color: "#64748b" }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trip config */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#f97316" }}>Trip Details</p>
                <input value={trip.name} onChange={e => setTrip(t => ({ ...t, name: e.target.value }))}
                  placeholder="Trip name" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <input value={trip.currency} onChange={e => setTrip(t => ({ ...t, currency: e.target.value }))}
                  placeholder="Currency symbol (₹, $, €)" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <p className="text-xs mb-1" style={{ color: "#64748b" }}>Members (comma-separated)</p>
                <input value={trip.members.join(", ")}
                  onChange={e => setTrip(t => ({ ...t, members: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              {/* Telegram config */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#f97316" }}>Telegram Notifications</p>
                <p className="text-xs mb-2" style={{ color: "#64748b" }}>Your brother will get a message on every change.</p>
                <input value={tg.token} onChange={e => setTg(t => ({ ...t, token: e.target.value }))}
                  placeholder="Bot Token (from @BotFather)" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2 font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <input value={tg.chatId} onChange={e => setTg(t => ({ ...t, chatId: e.target.value }))}
                  placeholder="Brother's Chat ID (from @userinfobot)" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-3 font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setTg(t => ({ ...t, enabled: !t.enabled }))}
                      className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
                      style={{ background: tg.enabled ? "#22c55e" : "rgba(255,255,255,0.1)" }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
                        style={{ left: tg.enabled ? "22px" : "2px" }} />
                    </div>
                    <span className="text-xs" style={{ color: tg.enabled ? "#4ade80" : "#64748b" }}>
                      {tg.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                  <button onClick={() => sendTelegram(`🔔 <b>${trip.name}</b> — Test notification!\n\nTelegram alerts are working. ✅`)}
                    disabled={!tg.token || !tg.chatId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <Send className="w-3 h-3" />Test
                  </button>
                </div>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: "#475569" }}>
                  1. Create a bot via <b style={{ color: "#94a3b8" }}>@BotFather</b> → /newbot → copy token<br />
                  2. Your brother messages <b style={{ color: "#94a3b8" }}>@userinfobot</b> to get his chat ID<br />
                  3. Brother must send <b style={{ color: "#94a3b8" }}>/start</b> to your bot first
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Add / Edit form ───────────────────────────────────────────────── */}
        {showForm && (
          <div style={{ ...card, padding: 20 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white">{editId ? "Edit Expense" : "Add New Expense"}</p>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(blank); }}>
                <X className="w-4 h-4" style={{ color: "#64748b" }} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Description *</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Dinner at restaurant" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Amount ({trip.currency}) *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.label} onClick={() => setForm(f => ({ ...f, category: c.label }))}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.category === c.label ? `${c.color}22` : "rgba(255,255,255,0.04)",
                        color: form.category === c.label ? c.color : "#64748b",
                        border: `1px solid ${form.category === c.label ? c.color + "50" : "rgba(255,255,255,0.08)"}`,
                      }}>
                      {c.icon}{c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Paid by *</label>
                <div className="flex flex-wrap gap-2">
                  {trip.members.map(m => (
                    <button key={m} onClick={() => setForm(f => ({ ...f, paidBy: m }))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.paidBy === m ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.04)",
                        color: form.paidBy === m ? "#f97316" : "#64748b",
                        border: `1px solid ${form.paidBy === m ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`,
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>Note (optional)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Any extra details…" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(blank); }}
                className="px-4 py-2 rounded-lg text-sm" style={{ color: "#64748b" }}>Cancel</button>
              <button onClick={submitForm} disabled={!form.description || !form.amount || !form.paidBy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ background: "#f97316", color: "white" }}>
                {tgStatus === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? "Save Changes" : "Add Expense"}
                {tg.enabled && <Bell className="w-3.5 h-3.5 opacity-70" />}
              </button>
            </div>
          </div>
        )}

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <StatCard label="Total Spend" value={fmt(totalSpend, trip.currency)} sub={`${expenses.length} expenses`} color="#f97316" />
          <StatCard label="Avg per Expense" value={fmt(expenses.length ? totalSpend / expenses.length : 0, trip.currency)} color="#a78bfa" />
          <StatCard label="Members" value={String(trip.members.length)} sub="on this trip" color="#22c55e" />
          <StatCard label="Top Spender" value={Object.entries(byMember).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—"} color="#38bdf8" />
        </div>

        {/* ── Per-member breakdown ─────────────────────────────────────────── */}
        <div style={{ ...card, padding: 18 }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" style={{ color: "#f97316" }} />
            <p className="text-sm font-semibold text-white">Member Breakdown</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {trip.members.map(m => {
              const amt = byMember[m] ?? 0;
              const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
              return (
                <div key={m} style={{ flex: "1 1 140px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                  <p className="text-xs font-semibold text-white mb-1">{m}</p>
                  <p className="text-base font-bold" style={{ color: "#f97316" }}>{fmt(amt, trip.currency)}</p>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#f97316" }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Category breakdown ───────────────────────────────────────────── */}
        <div style={{ ...card, padding: 18 }}>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4" style={{ color: "#f97316" }} />
            <p className="text-sm font-semibold text-white">By Category</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const amt = byCat[c.label] ?? 0;
              if (amt === 0 && expenses.length > 0) return null;
              return (
                <div key={c.label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: `${c.color}12`, border: `1px solid ${c.color}25` }}>
                  <span style={{ color: c.color }}>{c.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-xs font-bold text-white">{fmt(amt, trip.currency)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Expense list ─────────────────────────────────────────────────── */}
        <div style={card}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-sm font-semibold text-white">Expenses</p>
            <div className="flex gap-2">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value as Category | "All")}
                className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                <option value="All">All Members</option>
                {trip.members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-14 gap-3">
              <Wallet className="w-10 h-10" style={{ color: "#1e293b" }} />
              <p className="text-sm" style={{ color: "#334155" }}>No expenses yet</p>
              <button onClick={() => { setForm(blank); setEditId(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold mt-1"
                style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
                <Plus className="w-4 h-4" />Add First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
              {filtered.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${catColor(e.category)}18`, color: catColor(e.category) }}>
                    {catIcon(e.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: catColor(e.category) }}>{e.category}</span>
                      <span className="text-xs" style={{ color: "#475569" }}>·</span>
                      <span className="text-xs" style={{ color: "#64748b" }}>Paid by <b style={{ color: "#94a3b8" }}>{e.paidBy}</b></span>
                      <span className="text-xs" style={{ color: "#475569" }}>·</span>
                      <span className="text-xs" style={{ color: "#475569" }}>{e.date}</span>
                    </div>
                    {e.note && <p className="text-xs mt-0.5" style={{ color: "#475569" }}>📌 {e.note}</p>}
                  </div>
                  <p className="text-base font-bold flex-shrink-0" style={{ color: "#f97316" }}>
                    {fmt(e.amount, trip.currency)}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(e)} className="p-1.5 rounded-lg hover:bg-white/5">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
                    </button>
                    <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
