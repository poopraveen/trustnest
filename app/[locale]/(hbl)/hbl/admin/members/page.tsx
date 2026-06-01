"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Users, Loader2, X, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string; name: string; phone: string; email?: string;
  plan: string; status: string; points: number; expiresAt: string; joinedAt: string;
}

const PLAN_COLOR: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700", SILVER: "bg-slate-200 text-slate-800",
  GOLD: "bg-amber-100 text-amber-800", PLATINUM: "bg-purple-100 text-purple-800",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700", EXPIRED: "bg-red-100 text-red-700", SUSPENDED: "bg-slate-100 text-slate-600",
};

export default function AdminMembers() {
  const [pin] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("hbl_admin_pin") ?? "" : "");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", plan: "BASIC" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/hbl/admin/members?${params}`, { headers: { "x-hbl-admin": pin } });
    if (res.ok) { const d = await res.json(); setMembers(d.members ?? []); }
    setLoading(false);
  }, [pin, search, statusFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function addMember() {
    if (!form.name || !form.phone) return;
    setSaving(true); setMsg("");
    const res = await fetch("/api/hbl/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setMsg("Member added!"); setShowAdd(false); setForm({ name: "", phone: "", email: "", plan: "BASIC" }); fetchMembers(); }
    else setMsg(data.error ?? "Failed");
  }

  async function sendRenewalWA(id: string) {
    const res = await fetch("/api/hbl/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hbl-admin": pin },
      body: JSON.stringify({ type: "renewal", memberId: id }),
    });
    const data = await res.json();
    if (res.ok) window.open(data.whatsappUrl, "_blank");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/hbl/admin" className="p-1.5 bg-white/10 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <div className="flex items-center gap-2 flex-1">
            <Users className="w-5 h-5 text-green-400" />
            <h1 className="font-bold">Members</h1>
            <span className="ml-auto text-sm text-slate-400">{members.length} total</span>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-green-600 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-green-700">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-green-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-green-600" /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No members found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const days = Math.ceil((new Date(m.expiresAt).getTime() - Date.now()) / 86400000);
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLOR[m.plan]}`}>{m.plan}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[m.status]}`}>{m.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</span>
                        <span>⭐ {m.points} pts</span>
                        <span className={days <= 7 && days > 0 ? "text-red-500 font-semibold" : ""}>
                          Expires: {new Date(m.expiresAt).toLocaleDateString("en-IN")} {days <= 7 && days > 0 ? `(${days}d!)` : ""}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => sendRenewalWA(m.id)} className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 font-semibold">
                      WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add New Member</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "name", label: "Full Name *", placeholder: "Member name" },
                { key: "phone", label: "Mobile *", placeholder: "10-digit number" },
                { key: "email", label: "Email", placeholder: "Optional" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Plan</label>
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">
                  <option value="BASIC">🌿 Basic (1 month)</option>
                  <option value="SILVER">⭐ Silver (3 months)</option>
                  <option value="GOLD">🥇 Gold (6 months)</option>
                  <option value="PLATINUM">💎 Platinum (12 months)</option>
                </select>
              </div>
            </div>
            {msg && <p className={`text-sm mt-3 font-medium ${msg === "Member added!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
            <button onClick={addMember} disabled={saving} className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Adding..." : "Add Member"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
