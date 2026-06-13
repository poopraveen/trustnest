"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus, Trash2, Edit2, X, Check, Send, Settings,
  Wallet, Users, Tag, Bell, BellOff, Loader2,
  Plane, UtensilsCrossed, Hotel, Car, ShoppingBag, Ticket, MoreHorizontal,
  Mic, MicOff, MapPin, Navigation, ChevronDown, TrendingUp,
  Share2, RefreshCw, Database, WifiOff,
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
  location: string;
}

interface TelegramConfig { token: string; chatId: string; enabled: boolean; }
interface TripConfig     { name: string; members: string[]; currency: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string; bg: string }[] = [
  { label: "Food",          icon: <UtensilsCrossed className="w-3.5 h-3.5"/>, color: "#fb923c", bg: "#fb923c20" },
  { label: "Transport",     icon: <Car className="w-3.5 h-3.5"/>,            color: "#38bdf8", bg: "#38bdf820" },
  { label: "Hotel",         icon: <Hotel className="w-3.5 h-3.5"/>,          color: "#c084fc", bg: "#c084fc20" },
  { label: "Shopping",      icon: <ShoppingBag className="w-3.5 h-3.5"/>,    color: "#f472b6", bg: "#f472b620" },
  { label: "Entertainment", icon: <Ticket className="w-3.5 h-3.5"/>,         color: "#34d399", bg: "#34d39920" },
  { label: "Other",         icon: <MoreHorizontal className="w-3.5 h-3.5"/>, color: "#94a3b8", bg: "#94a3b820" },
];
const catColor = (c: Category) => CATEGORIES.find(x => x.label === c)?.color ?? "#94a3b8";
const catBg    = (c: Category) => CATEGORIES.find(x => x.label === c)?.bg    ?? "#94a3b820";
const catIcon  = (c: Category) => CATEGORIES.find(x => x.label === c)?.icon;

const DEFAULT_TRIP: TripConfig   = { name: "Family Trip 2025", members: ["You","Brother","Sister","Dad","Mom"], currency: "₹" };
const DEFAULT_TG: TelegramConfig = { token: "", chatId: "", enabled: false };
const STORAGE_KEYS = { expenses: "ft_expenses", trip: "ft_trip", telegram: "ft_telegram", code: "ft_code" };

const MEMBER_COLORS = ["#a855f7","#ec4899","#38bdf8","#34d399","#fb923c","#f472b6","#818cf8"];
const memberColor = (i: number) => MEMBER_COLORS[i % MEMBER_COLORS.length];

// ─── Voice parser ─────────────────────────────────────────────────────────────

function mapWord(w: string): Category | null {
  if (["food","eat","ate","restaurant","dinner","lunch","breakfast","snack","cafe","chai","tea","drink","drinks","biryani","dosa","rice"].includes(w)) return "Food";
  if (["transport","taxi","uber","ola","auto","cab","bus","train","flight","fuel","petrol","metro","rick","rickshaw","travel"].includes(w)) return "Transport";
  if (["hotel","stay","lodge","room","accommodation","resort","hostel","airbnb","guesthouse"].includes(w)) return "Hotel";
  if (["shopping","shop","buy","bought","mall","market","clothes","cloth","souvenir","gift","store"].includes(w)) return "Shopping";
  if (["entertainment","movie","cinema","ticket","show","game","park","amusement","fun","ride","rides"].includes(w)) return "Entertainment";
  return null;
}

interface ParsedVoice { description: string; amount: string; category: Category; paidBy: string; }

function parseVoice(transcript: string, members: string[]): Partial<ParsedVoice> {
  const lower = transcript.toLowerCase().replace(/[,.]/g, "");
  const words = lower.split(/\s+/);
  const result: Partial<ParsedVoice> = {};
  const amtMatch = transcript.match(/\b(\d[\d,]*(?:\.\d+)?)\b/);
  if (amtMatch) result.amount = amtMatch[1].replace(/,/g, "");
  for (const w of words) { const cat = mapWord(w); if (cat) { result.category = cat; break; } }
  for (const m of members) { if (lower.includes(m.toLowerCase())) { result.paidBy = m; break; } }
  const fillers = new Set(["spent","add","paid","for","on","at","by","the","a","an","of","to","in","and","rupees","rs","inr","dollars","dollar"]);
  const desc = words.filter(w => !fillers.has(w) && !/^\d[\d,.]*$/.test(w) && !mapWord(w) && !(result.paidBy && w === result.paidBy.toLowerCase())).join(" ").trim();
  if (desc) result.description = desc.charAt(0).toUpperCase() + desc.slice(1);
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid()  { return Math.random().toString(36).slice(2,10); }
function fmt(n: number, cur: string) { return `${cur}${n.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`; }
function today() { return new Date().toISOString().slice(0,10); }
function initials(name: string) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
function genCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }

// ─── Design tokens ────────────────────────────────────────────────────────────

const G = {
  bg: "#07030f",
  surface: "rgba(139,92,246,0.06)",
  surfaceBorder: "rgba(139,92,246,0.18)",
  surfaceHover: "rgba(139,92,246,0.1)",
  accent: "#a855f7",
  accentBright: "#c084fc",
  accentGrad: "linear-gradient(135deg,#7c3aed,#a855f7)",
  text: "#f1e6ff",
  textMuted: "#9370b8",
  textFaint: "#4a3560",
  border: "rgba(139,92,246,0.15)",
  borderHover: "rgba(139,92,246,0.35)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(139,92,246,0.07)",
  border: `1px solid ${G.border}`,
  borderRadius: 12,
  color: G.text,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 32, colorIdx = 0 }: { name: string; size?: number; colorIdx?: number }) {
  const c = memberColor(colorIdx);
  return (
    <div style={{ width: size, height: size, borderRadius: size/2, background: `${c}22`, border: `1.5px solid ${c}55`,
      display:"flex", alignItems:"center", justifyContent:"center", fontSize: size*0.38, fontWeight:700, color: c, flexShrink:0 }}>
      {initials(name)}
    </div>
  );
}

function StatPill({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: G.surface, border: `1px solid ${G.surfaceBorder}`, borderRadius: 16, padding: "14px 16px", flex: "1 1 140px", minWidth: 130 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <span style={{ color, opacity:0.8 }}>{icon}</span>
        <span style={{ fontSize:11, color: G.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</span>
      </div>
      <p style={{ fontSize:20, fontWeight:800, color: G.text, letterSpacing:"-0.02em" }}>{value}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyTripPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [expenses,  setExpenses]  = useState<Expense[]>([]);
  const [trip,      setTrip]      = useState<TripConfig>(DEFAULT_TRIP);
  const [tg,        setTg]        = useState<TelegramConfig>(DEFAULT_TG);
  const [tripCode,  setTripCode]  = useState<string>("");

  const [showForm,     setShowForm]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakdown,setShowBreakdown]= useState(false);
  const [editId,       setEditId]       = useState<string|null>(null);
  const [tgStatus,     setTgStatus]     = useState<"idle"|"sending"|"ok"|"error">("idle");
  const [tgError,      setTgError]      = useState("");
  const [filterCat,    setFilterCat]    = useState<Category|"All">("All");
  const [filterMember, setFilterMember] = useState("All");
  const [dbOnline,     setDbOnline]     = useState<boolean|null>(null);
  const [syncing,      setSyncing]      = useState(false);
  const [copied,       setCopied]       = useState(false);

  const [listening,       setListening]       = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError,      setVoiceError]      = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const blank = { description:"", amount:"", category:"Food" as Category, paidBy:"", date:today(), note:"", location:"" };
  const [form, setForm] = useState(blank);

  // ── Trip code init ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const urlCode = searchParams.get("trip");
    const saved = localStorage.getItem(STORAGE_KEYS.code);
    const code = urlCode || saved || genCode();
    setTripCode(code);
    localStorage.setItem(STORAGE_KEYS.code, code);
    if (!urlCode) {
      const url = new URL(window.location.href);
      url.searchParams.set("trip", code);
      router.replace(url.pathname + url.search);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ── Load from API or localStorage ─────────────────────────────────────────────
  const loadData = useCallback(async (code: string) => {
    setSyncing(true);
    try {
      // Try trip config
      const tripRes = await fetch(`/api/family-trip/trip?code=${code}`);
      if (tripRes.ok) {
        const { trip: dbTrip } = await tripRes.json();
        if (dbTrip) {
          setTrip({ name: dbTrip.name, members: dbTrip.members, currency: dbTrip.currency });
          setTg({ token: dbTrip.tgToken||"", chatId: dbTrip.tgChatId||"", enabled: dbTrip.tgEnabled });
        }
      }
      // Try expenses
      const expRes = await fetch(`/api/family-trip/expenses?code=${code}`);
      if (expRes.ok) {
        const { expenses: dbExpenses } = await expRes.json();
        if (Array.isArray(dbExpenses)) {
          const mapped: Expense[] = dbExpenses.map((e: any) => ({
            id: e.id, description: e.description, amount: e.amount, category: e.category as Category,
            paidBy: e.paidBy, date: e.date, note: e.note||"", location: e.location||"",
          }));
          setExpenses(mapped);
          setDbOnline(true);
          return;
        }
      }
      throw new Error("DB unavailable");
    } catch {
      setDbOnline(false);
      // Fall back to localStorage
      try {
        const e=localStorage.getItem(STORAGE_KEYS.expenses); if(e) setExpenses(JSON.parse(e));
        const t=localStorage.getItem(STORAGE_KEYS.trip);     if(t) setTrip(JSON.parse(t));
        const tgData=localStorage.getItem(STORAGE_KEYS.telegram); if(tgData) setTg(JSON.parse(tgData));
      } catch {}
    } finally { setSyncing(false); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  },[]);

  useEffect(()=>{ if(tripCode) loadData(tripCode); },[tripCode, loadData]);

  // Persist to localStorage as backup
  useEffect(()=>{ if(expenses.length>0||dbOnline===false) localStorage.setItem(STORAGE_KEYS.expenses,JSON.stringify(expenses)); },[expenses, dbOnline]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEYS.trip,JSON.stringify(trip)); },[trip]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEYS.telegram,JSON.stringify(tg)); },[tg]);

  // ── Save trip config to API ────────────────────────────────────────────────────
  const saveTrip = useCallback(async (t: TripConfig, tgCfg: TelegramConfig)=>{
    if (!tripCode||dbOnline===false) return;
    try {
      await fetch(`/api/family-trip/trip?code=${tripCode}`,{method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:t.name,members:t.members,currency:t.currency,tgToken:tgCfg.token,tgChatId:tgCfg.chatId,tgEnabled:tgCfg.enabled})});
    } catch {}
  },[tripCode, dbOnline]);

  // ── Telegram ─────────────────────────────────────────────────────────────────
  const sendTelegram = useCallback(async (message: string)=>{
    if (!tg.enabled||!tg.token||!tg.chatId) return;
    setTgStatus("sending"); setTgError("");
    try {
      const res = await fetch("/api/family-trip/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:tg.token,chatId:tg.chatId,message})});
      const data = await res.json();
      if(data.ok){ setTgStatus("ok"); setTimeout(()=>setTgStatus("idle"),3000); }
      else { setTgStatus("error"); setTgError(data.error??"Unknown error"); }
    } catch(e){ setTgStatus("error"); setTgError(String(e)); }
  },[tg]);

  // ── Location ─────────────────────────────────────────────────────────────────
  const getLocation = useCallback(async ()=>{
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setLocating(true); setLocError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve,reject)=>
        navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:10000,enableHighAccuracy:true})
      );
      const {latitude:lat,longitude:lon} = pos.coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16`,{headers:{"Accept-Language":"en"}});
        const d = await r.json();
        const a = d.address;
        const place = a?.tourism||a?.amenity||a?.road||a?.suburb||a?.city_district||a?.city||a?.town||a?.village||d.display_name?.split(",")[0];
        setForm(f=>({...f,location:place?`${place}, ${a?.city||a?.town||""}`:`${lat.toFixed(4)},${lon.toFixed(4)}`}));
      } catch {
        setForm(f=>({...f,location:`${lat.toFixed(5)}, ${lon.toFixed(5)}`}));
      }
    } catch(e:any){
      setLocError(e?.code===1?"Location permission denied":"Could not get location");
    } finally { setLocating(false); }
  },[]);

  // ── Voice ─────────────────────────────────────────────────────────────────────
  const startVoice = useCallback(()=>{
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceError("Speech recognition not supported in this browser"); return; }
    setVoiceError(""); setVoiceTranscript(""); setListening(true);
    setShowForm(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = "en-IN"; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onresult = (e: any)=>{
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          setVoiceTranscript(t);
          const parsed = parseVoice(t, trip.members);
          setForm(f=>({...f,...(parsed.description&&{description:parsed.description}),...(parsed.amount&&{amount:parsed.amount}),...(parsed.category&&{category:parsed.category}),...(parsed.paidBy&&{paidBy:parsed.paidBy})}));
        } else { setVoiceTranscript(t); }
      }
    };
    rec.onerror = (e: any)=>{ setVoiceError(e.error==="not-allowed"?"Microphone permission denied":e.error); setListening(false); };
    rec.onend = ()=>{ setListening(false); recognitionRef.current=null; };
    rec.start();
  },[trip.members]);

  const stopVoice = useCallback(()=>{ recognitionRef.current?.stop(); setListening(false); },[]);

  // ── Computed ──────────────────────────────────────────────────────────────────
  const totalSpend = expenses.reduce((s,e)=>s+e.amount,0);
  const byMember   = trip.members.reduce<Record<string,number>>((acc,m)=>{ acc[m]=expenses.filter(e=>e.paidBy===m).reduce((s,e)=>s+e.amount,0); return acc; },{});
  const byCat      = CATEGORIES.reduce<Record<string,number>>((acc,c)=>{ acc[c.label]=expenses.filter(e=>e.category===c.label).reduce((s,e)=>s+e.amount,0); return acc; },{});
  const filtered   = expenses.filter(e=>filterCat==="All"||e.category===filterCat).filter(e=>filterMember==="All"||e.paidBy===filterMember).sort((a,b)=>b.date.localeCompare(a.date));

  // ── CRUD via API ──────────────────────────────────────────────────────────────
  const submitForm = async ()=>{
    if (!form.description.trim()||!form.amount||!form.paidBy) return;
    const amt = parseFloat(form.amount);
    if (isNaN(amt)||amt<=0) return;
    const locLine = form.location ? `\n📍 ${form.location}` : "";

    if (editId) {
      // Update via API
      let updated = expenses;
      if (dbOnline) {
        try {
          const res = await fetch(`/api/family-trip/expenses/${editId}`,{method:"PUT",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location})});
          if (res.ok) {
            const { expense: up } = await res.json();
            updated = expenses.map(e=>e.id===editId?{...e,...up,amount:up.amount,category:up.category as Category}:e);
          }
        } catch {}
      } else {
        updated = expenses.map(e=>e.id===editId?{...e,description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location}:e);
      }
      setExpenses(updated);
      const exp = updated.find(e=>e.id===editId)!;
      await sendTelegram(`✏️ <b>${trip.name}</b> — Expense Updated\n\n📝 <b>${exp.description}</b>\n💵 ${trip.currency}${amt.toLocaleString()}\n🏷 ${exp.category}  |  👤 <b>${exp.paidBy}</b>\n📅 ${exp.date}${locLine}\n\n💰 Total: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
    } else {
      // Create via API
      let newExp: Expense;
      if (dbOnline) {
        try {
          const res = await fetch(`/api/family-trip/expenses?code=${tripCode}`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location})});
          if (res.ok) {
            const { expense: saved } = await res.json();
            newExp = {...saved, amount: saved.amount, category: saved.category as Category, note: saved.note||"", location: saved.location||""};
          } else { throw new Error("API error"); }
        } catch {
          newExp = {id:uid(),description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location};
        }
      } else {
        newExp = {id:uid(),description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location};
      }
      const updated = [newExp, ...expenses];
      setExpenses(updated);
      await sendTelegram(`💰 <b>${trip.name}</b> — New Expense!\n\n📝 <b>${newExp.description}</b>\n💵 ${trip.currency}${amt.toLocaleString()}\n🏷 ${newExp.category}  |  👤 <b>${newExp.paidBy}</b>\n📅 ${newExp.date}${locLine}${newExp.note?`\n📌 ${newExp.note}`:""}\n\n💰 Total: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
    }
    setForm(blank); setEditId(null); setShowForm(false); setVoiceTranscript("");
  };

  const startEdit = (e: Expense)=>{ setForm({description:e.description,amount:String(e.amount),category:e.category,paidBy:e.paidBy,date:e.date,note:e.note,location:e.location}); setEditId(e.id); setShowForm(true); };

  const deleteExpense = async (id: string)=>{
    const exp = expenses.find(e=>e.id===id);
    if (dbOnline) {
      try { await fetch(`/api/family-trip/expenses/${id}`,{method:"DELETE"}); } catch {}
    }
    const updated = expenses.filter(e=>e.id!==id);
    setExpenses(updated);
    if (exp) await sendTelegram(`🗑️ <b>${trip.name}</b> — Deleted\n\n📝 <del>${exp.description}</del>\n💵 ${trip.currency}${exp.amount.toLocaleString()}\n\n💰 Remaining: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
  };

  const handleShareCode = ()=>{
    const url = `${window.location.origin}/family-trip?trip=${tripCode}`;
    navigator.clipboard.writeText(url).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); }).catch(()=>{});
  };

  const closeModal = ()=>{ setShowForm(false); setEditId(null); setForm(blank); setVoiceTranscript(""); setVoiceError(""); };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:"100vh", background: G.bg, color: G.text, fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:600, height:400,
        background:"radial-gradient(ellipse,rgba(139,92,246,0.18) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(7,3,15,0.92)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${G.border}`, padding:"12px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:12, background: G.accentGrad,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Plane className="w-4 h-4" style={{ color:"white" }}/>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color: G.text, lineHeight:1.2 }}>{trip.name}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <p style={{ fontSize:11, color: G.textMuted }}>{expenses.length} expenses</p>
                {dbOnline !== null && (
                  <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, padding:"1px 6px", borderRadius:6,
                    background: dbOnline?"rgba(52,211,153,0.12)":"rgba(251,146,60,0.12)",
                    color: dbOnline?"#34d399":"#fb923c" }}>
                    {dbOnline?<Database className="w-2.5 h-2.5"/>:<WifiOff className="w-2.5 h-2.5"/>}
                    {dbOnline?"Synced":"Local"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {/* Telegram status */}
            <div className="hidden sm:flex" style={{ alignItems:"center", gap:6, padding:"6px 10px", borderRadius:20,
              background: tg.enabled?"rgba(168,85,247,0.12)":"rgba(100,116,139,0.08)",
              border:`1px solid ${tg.enabled?"rgba(168,85,247,0.35)":"rgba(100,116,139,0.15)"}`,
              color: tg.enabled?"#c084fc":"#64748b", fontSize:12, fontWeight:600 }}>
              {tgStatus==="sending"?<Loader2 className="w-3 h-3 animate-spin"/>:tgStatus==="ok"?<Check className="w-3 h-3"/>:tgStatus==="error"?<X className="w-3 h-3" style={{color:"#f87171"}}/>:tg.enabled?<Bell className="w-3 h-3"/>:<BellOff className="w-3 h-3"/>}
              {tgStatus==="sending"?"…":tgStatus==="ok"?"✓":tgStatus==="error"?"!":tg.enabled?"Live":"Off"}
            </div>
            {/* Sync / refresh */}
            <button onClick={()=>loadData(tripCode)} disabled={syncing} title="Refresh from server"
              style={{ padding:8, borderRadius:10, background: G.surface, border:`1px solid ${G.border}`, cursor:"pointer", color: G.textMuted }}>
              <RefreshCw className={`w-4 h-4${syncing?" animate-spin":""}`}/>
            </button>
            {/* Voice */}
            <button onClick={listening?stopVoice:startVoice}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 10px", borderRadius:10,
                background: listening?"rgba(239,68,68,0.15)":G.surface,
                border:`1px solid ${listening?"rgba(239,68,68,0.4)":G.border}`,
                color: listening?"#f87171":G.textMuted, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              {listening?<><MicOff className="w-4 h-4"/>Stop</>:<><Mic className="w-4 h-4"/>Voice</>}
            </button>
            <button onClick={()=>setShowSettings(s=>!s)}
              style={{ padding:8, borderRadius:10, background: showSettings?G.surface:"transparent",
                border:`1px solid ${showSettings?G.border:"transparent"}`, cursor:"pointer", color: G.textMuted }}>
              <Settings className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"16px 12px 100px", position:"relative", zIndex:1 }}>

        {/* ── Share banner ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom:14, borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"center", gap:10,
          background:"rgba(139,92,246,0.08)", border:`1px solid ${G.border}` }}>
          <Share2 className="w-4 h-4" style={{ color: G.accent, flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:12, color: G.textMuted }}>Trip code: </span>
            <span style={{ fontSize:13, fontWeight:700, color: G.accentBright, letterSpacing:"0.1em" }}>{tripCode}</span>
            <span style={{ fontSize:11, color: G.textFaint, marginLeft:8 }}>Share URL with family to sync</span>
          </div>
          <button onClick={handleShareCode}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, flexShrink:0,
              background: copied?"rgba(52,211,153,0.15)":G.surface, border:`1px solid ${copied?"rgba(52,211,153,0.3)":G.borderHover}`,
              color: copied?"#34d399":G.accent, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {copied?<><Check className="w-3.5 h-3.5"/>Copied!</>:<><Share2 className="w-3.5 h-3.5"/>Share</>}
          </button>
        </div>

        {/* DB offline warning */}
        {dbOnline===false && (
          <div style={{ marginBottom:12, borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", gap:8,
            background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.25)", color:"#fb923c", fontSize:12 }}>
            <WifiOff className="w-4 h-4" style={{ flexShrink:0 }}/>
            <span><b>Offline mode</b> — data saved locally on this device only. Your brother won't see changes until the database is connected.</span>
          </div>
        )}

        {/* ── Voice banner ─────────────────────────────────────────────────────── */}
        {(listening||voiceTranscript||voiceError) && (
          <div style={{ marginBottom:12, borderRadius:16, padding:"14px 16px",
            background: listening?"rgba(239,68,68,0.08)":voiceError?"rgba(239,68,68,0.08)":"rgba(139,92,246,0.1)",
            border:`1px solid ${listening?"rgba(239,68,68,0.3)":voiceError?"rgba(239,68,68,0.3)":"rgba(139,92,246,0.3)"}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {listening ? (
                <div style={{ position:"relative" }}>
                  <Mic className="w-5 h-5" style={{ color:"#f87171" }}/>
                  <span style={{ position:"absolute", top:-3, right:-3, width:10, height:10, borderRadius:"50%", background:"#ef4444", animation:"ping 1s infinite" }}/>
                </div>
              ) : voiceError ? <MicOff className="w-5 h-5" style={{ color:"#f87171" }}/> : <Check className="w-5 h-5" style={{ color:"#c084fc" }}/>}
              <span style={{ fontSize:13, fontWeight:600, color: listening?"#f87171":voiceError?"#f87171":"#c084fc" }}>
                {listening?"Listening… speak now":voiceError?voiceError:"Form filled from voice ↓"}
              </span>
              <button onClick={()=>{setVoiceTranscript("");setVoiceError("");}} style={{ marginLeft:"auto", color: G.textMuted, cursor:"pointer" }}>
                <X className="w-4 h-4"/>
              </button>
            </div>
            {voiceTranscript && <p style={{ fontSize:13, marginTop:8, color: G.textMuted, fontStyle:"italic" }}>"{voiceTranscript}"</p>}
            {listening && (
              <p style={{ fontSize:11, marginTop:8, color: G.textFaint }}>
                Try: <span style={{ color: G.textMuted }}>"Spent 500 on dinner"</span> · <span style={{ color: G.textMuted }}>"200 taxi paid by brother"</span>
              </p>
            )}
          </div>
        )}

        {/* Errors */}
        {tgStatus==="error" && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, marginBottom:10,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", fontSize:13 }}>
            <X className="w-4 h-4" style={{ flexShrink:0 }}/>{tgError}
            <button onClick={()=>setTgStatus("idle")} style={{ marginLeft:"auto", cursor:"pointer" }}><X className="w-3.5 h-3.5"/></button>
          </div>
        )}
        {locError && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, marginBottom:10,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", fontSize:13 }}>
            <MapPin className="w-4 h-4" style={{ flexShrink:0 }}/>{locError}
            <button onClick={()=>setLocError("")} style={{ marginLeft:"auto", cursor:"pointer" }}><X className="w-3.5 h-3.5"/></button>
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────────────────── */}
        {showSettings && (
          <div style={{ marginBottom:14, borderRadius:20, padding:20, background: G.surface, border:`1px solid ${G.surfaceBorder}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color: G.text, display:"flex", alignItems:"center", gap:8 }}>
                <Settings className="w-4 h-4" style={{ color: G.accent }}/> Settings
              </p>
              <button onClick={()=>setShowSettings(false)} style={{ color: G.textMuted, cursor:"pointer" }}><X className="w-4 h-4"/></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color: G.accent, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Trip Details</p>
                <input style={inputStyle} value={trip.name} onChange={e=>setTrip(t=>({...t,name:e.target.value}))} placeholder="Trip name"/>
                <input style={{...inputStyle,marginTop:8}} value={trip.currency} onChange={e=>setTrip(t=>({...t,currency:e.target.value}))} placeholder="₹ / $ / €"/>
                <p style={{ fontSize:11, color: G.textMuted, marginTop:10, marginBottom:4 }}>Members (comma-separated)</p>
                <input style={inputStyle} value={trip.members.join(", ")} onChange={e=>setTrip(t=>({...t,members:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}/>
                <button onClick={()=>saveTrip(trip,tg)} style={{ marginTop:10, padding:"8px 16px", borderRadius:10, background:"rgba(168,85,247,0.15)",
                  border:`1px solid rgba(168,85,247,0.3)`, color: G.accent, fontSize:13, fontWeight:600, cursor:"pointer" }}>Save Trip Config</button>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color: G.accent, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Telegram Notifications</p>
                <p style={{ fontSize:11, color: G.textMuted, marginBottom:8 }}>Brother gets notified on every add/edit/delete.</p>
                <input style={{...inputStyle,fontFamily:"monospace",fontSize:12}} value={tg.token} onChange={e=>setTg(t=>({...t,token:e.target.value}))} placeholder="Bot Token (@BotFather)"/>
                <input style={{...inputStyle,marginTop:8,fontFamily:"monospace",fontSize:12}} value={tg.chatId} onChange={e=>setTg(t=>({...t,chatId:e.target.value}))} placeholder="Chat ID (@userinfobot)"/>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
                  <div onClick={()=>setTg(t=>({...t,enabled:!t.enabled}))} style={{ width:42, height:24, borderRadius:12, position:"relative", cursor:"pointer",
                    background: tg.enabled?G.accentGrad:"rgba(255,255,255,0.1)", transition:"background 0.2s" }}>
                    <div style={{ position:"absolute", top:3, width:18, height:18, borderRadius:9, background:"white", boxShadow:"0 1px 4px rgba(0,0,0,0.4)",
                      left: tg.enabled?"21px":"3px", transition:"left 0.2s" }}/>
                  </div>
                  <span style={{ fontSize:12, color: tg.enabled?"#c084fc":G.textMuted, flex:1 }}>{tg.enabled?"Enabled":"Disabled"}</span>
                  <button onClick={()=>{sendTelegram(`🔔 <b>${trip.name}</b> — Test ✅`);saveTrip(trip,tg);}} disabled={!tg.token||!tg.chatId}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:600,
                      background:"rgba(168,85,247,0.15)", color: G.accent, border:`1px solid rgba(168,85,247,0.3)`, cursor:"pointer",
                      opacity: (!tg.token||!tg.chatId)?0.4:1 }}>
                    <Send className="w-3 h-3"/>Test
                  </button>
                </div>
                <p style={{ fontSize:11, color: G.textFaint, marginTop:12, lineHeight:1.7 }}>
                  1. Message <b style={{ color: G.textMuted }}>@BotFather</b> → /newbot → copy token<br/>
                  2. Brother messages <b style={{ color: G.textMuted }}>@userinfobot</b> for Chat ID<br/>
                  3. Brother sends <b style={{ color: G.textMuted }}>/start</b> to your bot first
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Hero stats ───────────────────────────────────────────────────────── */}
        <div style={{ borderRadius:24, padding:"20px", marginBottom:14,
          background:"linear-gradient(135deg,rgba(109,40,217,0.35) 0%,rgba(168,85,247,0.15) 100%)",
          border:`1px solid rgba(139,92,246,0.3)` }}>
          <p style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Total Spent</p>
          <p style={{ fontSize:36, fontWeight:900, color: G.text, letterSpacing:"-0.03em", lineHeight:1 }}>{fmt(totalSpend, trip.currency)}</p>
          <p style={{ fontSize:12, color: G.textMuted, marginTop:6 }}>{expenses.length} expenses across {trip.members.length} members</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
            {CATEGORIES.map(c=>{ const amt=byCat[c.label]??0; if(!amt) return null; return (
              <div key={c.label} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:20,
                background:`${c.color}18`, border:`1px solid ${c.color}30`, fontSize:11, fontWeight:600, color:c.color }}>
                {c.icon}<span>{trip.currency}{Math.round(amt).toLocaleString()}</span>
              </div>
            );})}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
          <StatPill label="Avg/Expense" value={fmt(expenses.length?totalSpend/expenses.length:0, trip.currency)} icon={<TrendingUp className="w-3.5 h-3.5"/>} color="#c084fc"/>
          <StatPill label="Top Spender" value={Object.entries(byMember).sort((a,b)=>b[1]-a[1])[0]?.[0]??"—"} icon={<Users className="w-3.5 h-3.5"/>} color="#f472b6"/>
          <StatPill label="Categories"  value={String(Object.values(byCat).filter(v=>v>0).length)} icon={<Tag className="w-3.5 h-3.5"/>} color="#38bdf8"/>
        </div>

        {/* ── Member breakdown ─────────────────────────────────────────────────── */}
        <div style={{ borderRadius:20, marginBottom:14, background: G.surface, border:`1px solid ${G.surfaceBorder}`, overflow:"hidden" }}>
          <button onClick={()=>setShowBreakdown(v=>!v)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 16px", background:"transparent", border:"none", cursor:"pointer", color: G.text }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Users className="w-4 h-4" style={{ color: G.accent }}/>
              <span style={{ fontSize:13, fontWeight:700 }}>Member Breakdown</span>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: G.textMuted, transform: showBreakdown?"rotate(180deg)":"none", transition:"0.2s" }}/>
          </button>
          {showBreakdown && (
            <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12 }}>
              {trip.members.map((m,i)=>{
                const amt=byMember[m]??0; const pct=totalSpend>0?(amt/totalSpend)*100:0;
                const c=memberColor(i);
                return (
                  <div key={m} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar name={m} size={34} colorIdx={i}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color: G.text }}>{m}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:c }}>{fmt(amt,trip.currency)}</span>
                      </div>
                      <div style={{ height:5, borderRadius:4, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${c}aa,${c})`, width:`${pct}%`, transition:"width 0.4s ease" }}/>
                      </div>
                      <span style={{ fontSize:10, color: G.textFaint }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Expense list ─────────────────────────────────────────────────────── */}
        <div style={{ borderRadius:20, background: G.surface, border:`1px solid ${G.surfaceBorder}`, overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
            <p style={{ fontSize:13, fontWeight:700, color: G.text }}>Expenses</p>
            <div style={{ display:"flex", gap:8 }}>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value as Category|"All")}
                style={{ ...inputStyle, padding:"6px 10px", fontSize:12, width:"auto", borderRadius:10 }}>
                <option value="All">All</option>
                {CATEGORIES.map(c=><option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <select value={filterMember} onChange={e=>setFilterMember(e.target.value)}
                style={{ ...inputStyle, padding:"6px 10px", fontSize:12, width:"auto", borderRadius:10 }}>
                <option value="All">Everyone</option>
                {trip.members.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {filtered.length===0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 20px", gap:12 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:"rgba(139,92,246,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Wallet className="w-8 h-8" style={{ color:"rgba(139,92,246,0.3)" }}/>
              </div>
              <p style={{ color: G.textFaint, fontSize:14 }}>No expenses yet</p>
              <button onClick={()=>{setForm(blank);setEditId(null);setShowForm(true);}}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600,
                  background:"rgba(168,85,247,0.15)", color: G.accent, border:`1px solid rgba(168,85,247,0.3)`, cursor:"pointer" }}>
                <Plus className="w-4 h-4"/>Add First Expense
              </button>
            </div>
          ) : (
            <div>
              {filtered.map((e, idx)=>{
                const memberIdx = trip.members.indexOf(e.paidBy);
                return (
                  <div key={e.id}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                      borderBottom: idx<filtered.length-1?`1px solid ${G.border}`:"none", transition:"background 0.15s" }}
                    onMouseEnter={ev=>(ev.currentTarget.style.background=G.surfaceHover)}
                    onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                    <div style={{ width:40, height:40, borderRadius:14, background:catBg(e.category),
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:catColor(e.category) }}>
                      {catIcon(e.category)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color: G.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.description}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", marginTop:3 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:catColor(e.category), background:catBg(e.category), padding:"2px 7px", borderRadius:6 }}>{e.category}</span>
                        <Avatar name={e.paidBy} size={16} colorIdx={memberIdx>=0?memberIdx:0}/>
                        <span style={{ fontSize:11, color: G.textMuted }}>{e.paidBy}</span>
                        <span style={{ fontSize:11, color: G.textFaint }}>·</span>
                        <span style={{ fontSize:11, color: G.textFaint }}>{e.date}</span>
                        {e.location && <><span style={{ fontSize:11, color: G.textFaint }}>·</span><span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#818cf8" }}><MapPin className="w-2.5 h-2.5"/>{e.location}</span></>}
                      </div>
                      {e.note && <p style={{ fontSize:11, marginTop:2, color: G.textFaint }}>📌 {e.note}</p>}
                    </div>
                    <p style={{ fontSize:15, fontWeight:800, color: G.text, flexShrink:0, letterSpacing:"-0.02em" }}>{fmt(e.amount,trip.currency)}</p>
                    <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                      <button onClick={()=>startEdit(e)} style={{ padding:7, borderRadius:9, background:"transparent", border:"none", cursor:"pointer", color: G.textMuted }}
                        onMouseEnter={ev=>(ev.currentTarget.style.background=G.surface)} onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                        <Edit2 className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={()=>deleteExpense(e.id)} style={{ padding:7, borderRadius:9, background:"transparent", border:"none", cursor:"pointer", color: G.textMuted }}
                        onMouseEnter={ev=>(ev.currentTarget.style.background="rgba(239,68,68,0.12)")} onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────────────── */}
      <button onClick={()=>{setForm(blank);setEditId(null);setShowForm(true);}}
        style={{ position:"fixed", bottom:24, right:20, width:56, height:56, borderRadius:18, background: G.accentGrad,
          display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer",
          boxShadow:"0 8px 32px rgba(139,92,246,0.45)", zIndex:40, transition:"transform 0.15s" }}
        onMouseEnter={ev=>(ev.currentTarget.style.transform="scale(1.08)")}
        onMouseLeave={ev=>(ev.currentTarget.style.transform="scale(1)")}>
        <Plus className="w-6 h-6" style={{ color:"white" }}/>
      </button>

      {/* ── Form modal ───────────────────────────────────────────────────────────── */}
      {showForm && (
        <>
          <div onClick={closeModal} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:60 }}/>
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:70, borderRadius:"24px 24px 0 0",
            background:"#0f0720", border:`1px solid ${G.surfaceBorder}`, borderBottom:"none",
            maxHeight:"90vh", overflowY:"auto", maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.15)" }}/>
            </div>
            <div style={{ padding:"8px 20px 32px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <p style={{ fontSize:17, fontWeight:800, color: G.text }}>{editId?"Edit Expense":"New Expense"}</p>
                <button onClick={closeModal} style={{ width:32, height:32, borderRadius:10, background: G.surface, border:`1px solid ${G.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: G.textMuted }}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Description *</label>
                  <input style={inputStyle} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Dinner at restaurant"/>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Amount ({trip.currency}) *</label>
                    <input type="number" min="0" step="0.01" style={inputStyle} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00"/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Date</label>
                    <input type="date" style={inputStyle} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Location</label>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{...inputStyle,flex:1}} value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Where did you spend?"/>
                    <button onClick={getLocation} disabled={locating}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"10px 12px", borderRadius:12, flexShrink:0,
                        background: form.location?"rgba(139,92,246,0.15)":G.surface, border:`1px solid ${form.location?G.borderHover:G.border}`,
                        color: form.location?G.accent:G.textMuted, fontSize:12, fontWeight:600, cursor:locating?"not-allowed":"pointer", opacity:locating?0.6:1 }}>
                      {locating?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:form.location?<MapPin className="w-3.5 h-3.5"/>:<Navigation className="w-3.5 h-3.5"/>}
                      {locating?"…":form.location?"Update":"Auto"}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Category</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {CATEGORIES.map(c=>(
                      <button key={c.label} onClick={()=>setForm(f=>({...f,category:c.label}))}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:12,
                          background: form.category===c.label?`${c.color}25`:G.surface,
                          border:`1.5px solid ${form.category===c.label?c.color:G.border}`,
                          color: form.category===c.label?c.color:G.textMuted,
                          fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                        {c.icon}{c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Paid By *</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {trip.members.map((m,i)=>{
                      const c = memberColor(i);
                      const sel = form.paidBy===m;
                      return (
                        <button key={m} onClick={()=>setForm(f=>({...f,paidBy:m}))}
                          style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:12,
                            background: sel?`${c}20`:G.surface, border:`1.5px solid ${sel?c:G.border}`,
                            color: sel?c:G.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                          <Avatar name={m} size={20} colorIdx={i}/>{m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Note (optional)</label>
                  <input style={inputStyle} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Any extra details…"/>
                </div>

                <button onClick={submitForm} disabled={!form.description||!form.amount||!form.paidBy}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:16,
                    background: (!form.description||!form.amount||!form.paidBy)?"rgba(139,92,246,0.2)":G.accentGrad,
                    color:"white", fontSize:14, fontWeight:700, border:"none", cursor:(!form.description||!form.amount||!form.paidBy)?"not-allowed":"pointer",
                    opacity:(!form.description||!form.amount||!form.paidBy)?0.5:1, transition:"all 0.15s",
                    boxShadow:(!form.description||!form.amount||!form.paidBy)?"none":"0 4px 20px rgba(139,92,246,0.4)" }}>
                  {tgStatus==="sending"?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}
                  {editId?"Save Changes":"Add Expense"}
                  {tg.enabled && <Bell className="w-3.5 h-3.5" style={{ opacity:0.7 }}/>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(1) saturate(3) hue-rotate(230deg); }
        select option { background: #0f0720; color: #f1e6ff; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}
