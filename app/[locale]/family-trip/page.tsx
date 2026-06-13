"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Trash2, Edit2, X, Check, Send, Settings,
  Wallet, Users, Tag, Bell, BellOff, Loader2,
  Plane, UtensilsCrossed, Hotel, Car, ShoppingBag, Ticket, MoreHorizontal,
  Mic, MicOff, MapPin, Navigation,
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
  location: string;   // ← NEW
}

interface TelegramConfig { token: string; chatId: string; enabled: boolean; }
interface TripConfig     { name: string; members: string[]; currency: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: "Food",          icon: <UtensilsCrossed className="w-3.5 h-3.5"/>, color: "#f97316" },
  { label: "Transport",     icon: <Car className="w-3.5 h-3.5"/>,            color: "#3b82f6" },
  { label: "Hotel",         icon: <Hotel className="w-3.5 h-3.5"/>,          color: "#a855f7" },
  { label: "Shopping",      icon: <ShoppingBag className="w-3.5 h-3.5"/>,    color: "#ec4899" },
  { label: "Entertainment", icon: <Ticket className="w-3.5 h-3.5"/>,         color: "#22c55e" },
  { label: "Other",         icon: <MoreHorizontal className="w-3.5 h-3.5"/>, color: "#64748b" },
];
const catColor = (c: Category) => CATEGORIES.find(x => x.label === c)?.color ?? "#64748b";
const catIcon  = (c: Category) => CATEGORIES.find(x => x.label === c)?.icon;

const STORAGE_KEYS = { expenses: "ft_expenses", trip: "ft_trip", telegram: "ft_telegram" };
const DEFAULT_TRIP: TripConfig   = { name: "Family Trip 2025", members: ["You","Brother","Sister","Dad","Mom"], currency: "₹" };
const DEFAULT_TG: TelegramConfig = { token: "", chatId: "", enabled: false };

// ─── Voice parser ─────────────────────────────────────────────────────────────

const CAT_WORDS: Record<string, Category> = {
  food:true, eat:true, ate:true, restaurant:true, dinner:true, lunch:true,
  breakfast:true, snack:true, cafe:true, chai:true, tea:true,
  transport:true, taxi:true, uber:true, ola:true, auto:true, cab:true,
  bus:true, train:true, flight:true, fuel:true, petrol:true, metro:true,
  hotel:true, stay:true, lodge:true, room:true, accommodation:true, resort:true,
  shopping:true, shop:true, buy:true, bought:true, mall:true, market:true, clothes:true,
  entertainment:true, movie:true, cinema:true, ticket:true, show:true, game:true, park:true,
} as unknown as Record<string, Category>;

const CAT_MAP: Record<string, Category> = {
  food:true,eat:true,ate:true,restaurant:true,dinner:true,lunch:true,breakfast:true,snack:true,cafe:true,chai:true,tea:true
    ? "Food" : "Food",
} as unknown as Record<string, Category>;

function mapWord(w: string): Category | null {
  const food = ["food","eat","ate","restaurant","dinner","lunch","breakfast","snack","cafe","chai","tea","drink","drinks","biryani","dosa","rice"];
  const transport = ["transport","taxi","uber","ola","auto","cab","bus","train","flight","fuel","petrol","metro","rick","rickshaw","travel"];
  const hotel = ["hotel","stay","lodge","room","accommodation","resort","hostel","airbnb","guesthouse"];
  const shopping = ["shopping","shop","buy","bought","mall","market","clothes","cloth","souvenir","gift","store"];
  const entertainment = ["entertainment","movie","cinema","ticket","show","game","park","amusement","fun","ride","rides"];
  if (food.includes(w))          return "Food";
  if (transport.includes(w))     return "Transport";
  if (hotel.includes(w))         return "Hotel";
  if (shopping.includes(w))      return "Shopping";
  if (entertainment.includes(w)) return "Entertainment";
  return null;
}

interface ParsedVoice {
  description: string;
  amount: string;
  category: Category;
  paidBy: string;
}

function parseVoice(transcript: string, members: string[]): Partial<ParsedVoice> {
  const lower = transcript.toLowerCase().replace(/[,\.]/g, "");
  const words = lower.split(/\s+/);
  const result: Partial<ParsedVoice> = {};

  // amount — first number in the transcript
  const amtMatch = transcript.match(/\b(\d[\d,]*(?:\.\d+)?)\b/);
  if (amtMatch) result.amount = amtMatch[1].replace(/,/g, "");

  // category — scan all words
  for (const w of words) {
    const cat = mapWord(w);
    if (cat) { result.category = cat; break; }
  }

  // paidBy — match member names (case-insensitive)
  for (const m of members) {
    if (lower.includes(m.toLowerCase())) { result.paidBy = m; break; }
  }

  // description — remove amount, "rupees"/"rs", category keywords, member name, filler words
  const fillers = new Set(["spent","add","paid","for","on","at","by","the","a","an","of","to","in","and","rupees","rs","inr","dollars","dollar"]);
  const desc = words
    .filter(w => {
      if (fillers.has(w)) return false;
      if (/^\d[\d,\.]*$/.test(w)) return false;
      if (mapWord(w)) return false;
      if (result.paidBy && w === result.paidBy.toLowerCase()) return false;
      return true;
    })
    .join(" ")
    .trim();
  if (desc) result.description = desc.charAt(0).toUpperCase() + desc.slice(1);

  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid()  { return Math.random().toString(36).slice(2,10); }
function fmt(n: number, cur: string) {
  return `${cur}${n.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
function today() { return new Date().toISOString().slice(0,10); }

// ─── Sub-components ───────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
};

function StatCard({label,value,sub,color}:{label:string;value:string;sub?:string;color:string}) {
  return (
    <div style={{...card,padding:"16px 20px",flex:1,minWidth:140}}>
      <p className="text-xs mb-1" style={{color:"#64748b"}}>{label}</p>
      <p className="text-xl font-bold" style={{color}}>{value}</p>
      {sub&&<p className="text-xs mt-0.5" style={{color:"#475569"}}>{sub}</p>}
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
  const [editId,       setEditId]       = useState<string|null>(null);
  const [tgStatus,     setTgStatus]     = useState<"idle"|"sending"|"ok"|"error">("idle");
  const [tgError,      setTgError]      = useState("");
  const [filterCat,    setFilterCat]    = useState<Category|"All">("All");
  const [filterMember, setFilterMember] = useState("All");

  // ── Voice state ──────────────────────────────────────────────────────────────
  const [listening,      setListening]      = useState(false);
  const [voiceTranscript,setVoiceTranscript]= useState("");
  const [voiceError,     setVoiceError]     = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // ── Location state ───────────────────────────────────────────────────────────
  const [locating,  setLocating]  = useState(false);
  const [locError,  setLocError]  = useState("");

  // ── Form ─────────────────────────────────────────────────────────────────────
  const blank = { description:"", amount:"", category:"Food" as Category, paidBy:"", date:today(), note:"", location:"" };
  const [form, setForm] = useState(blank);

  // Persist
  useEffect(()=>{ try{ const e=localStorage.getItem(STORAGE_KEYS.expenses); if(e) setExpenses(JSON.parse(e)); const t=localStorage.getItem(STORAGE_KEYS.trip); if(t) setTrip(JSON.parse(t)); const tg=localStorage.getItem(STORAGE_KEYS.telegram); if(tg) setTg(JSON.parse(tg)); }catch{} },[]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEYS.expenses,JSON.stringify(expenses)); },[expenses]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEYS.trip,JSON.stringify(trip)); },[trip]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEYS.telegram,JSON.stringify(tg)); },[tg]);

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
    setShowForm(true); // open form so parsed values land there

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onresult = (e: any)=>{
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          setVoiceTranscript(t);
          const parsed = parseVoice(t, trip.members);
          setForm(f=>({
            ...f,
            ...(parsed.description && {description: parsed.description}),
            ...(parsed.amount      && {amount:      parsed.amount}),
            ...(parsed.category    && {category:    parsed.category}),
            ...(parsed.paidBy      && {paidBy:      parsed.paidBy}),
          }));
        } else { interim = t; setVoiceTranscript(interim); }
      }
    };
    rec.onerror = (e: any)=>{
      setVoiceError(e.error==="not-allowed"?"Microphone permission denied":e.error);
      setListening(false);
    };
    rec.onend = ()=>{ setListening(false); recognitionRef.current=null; };
    rec.start();
  },[trip.members]);

  const stopVoice = useCallback(()=>{
    recognitionRef.current?.stop();
    setListening(false);
  },[]);

  // ── Computed ──────────────────────────────────────────────────────────────────
  const totalSpend = expenses.reduce((s,e)=>s+e.amount,0);
  const byMember   = trip.members.reduce<Record<string,number>>((acc,m)=>{ acc[m]=expenses.filter(e=>e.paidBy===m).reduce((s,e)=>s+e.amount,0); return acc; },{});
  const byCat      = CATEGORIES.reduce<Record<string,number>>((acc,c)=>{ acc[c.label]=expenses.filter(e=>e.category===c.label).reduce((s,e)=>s+e.amount,0); return acc; },{});
  const filtered   = expenses.filter(e=>filterCat==="All"||e.category===filterCat).filter(e=>filterMember==="All"||e.paidBy===filterMember).sort((a,b)=>b.date.localeCompare(a.date));

  // ── Form submit ───────────────────────────────────────────────────────────────
  const submitForm = async ()=>{
    if (!form.description.trim()||!form.amount||!form.paidBy) return;
    const amt = parseFloat(form.amount);
    if (isNaN(amt)||amt<=0) return;
    const locLine = form.location ? `\n📍 ${form.location}` : "";

    if (editId) {
      const updated = expenses.map(e=>e.id===editId?{...e,description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location}:e);
      setExpenses(updated);
      const exp = updated.find(e=>e.id===editId)!;
      await sendTelegram(`✏️ <b>${trip.name}</b> — Expense Updated\n\n📝 <b>${exp.description}</b>\n💵 ${trip.currency}${amt.toLocaleString()}\n🏷 ${exp.category}  |  👤 <b>${exp.paidBy}</b>\n📅 ${exp.date}${locLine}\n\n💰 Total: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
    } else {
      const exp: Expense = {id:uid(),description:form.description,amount:amt,category:form.category,paidBy:form.paidBy,date:form.date,note:form.note,location:form.location};
      const updated = [exp,...expenses];
      setExpenses(updated);
      await sendTelegram(`💰 <b>${trip.name}</b> — New Expense!\n\n📝 <b>${exp.description}</b>\n💵 ${trip.currency}${amt.toLocaleString()}\n🏷 ${exp.category}  |  👤 <b>${exp.paidBy}</b>\n📅 ${exp.date}${locLine}${exp.note?`\n📌 ${exp.note}`:""}\n\n💰 Total: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
    }
    setForm(blank); setEditId(null); setShowForm(false); setVoiceTranscript("");
  };

  const startEdit = (e: Expense)=>{
    setForm({description:e.description,amount:String(e.amount),category:e.category,paidBy:e.paidBy,date:e.date,note:e.note,location:e.location});
    setEditId(e.id); setShowForm(true);
  };

  const deleteExpense = async (id: string)=>{
    const exp = expenses.find(e=>e.id===id);
    const updated = expenses.filter(e=>e.id!==id);
    setExpenses(updated);
    if (exp) await sendTelegram(`🗑️ <b>${trip.name}</b> — Deleted\n\n📝 <del>${exp.description}</del>\n💵 ${trip.currency}${exp.amount.toLocaleString()}\n\n💰 Remaining: <b>${fmt(updated.reduce((s,e)=>s+e.amount,0),trip.currency)}</b>`);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{background:"#060912",color:"white"}}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{background:"rgba(6,9,18,0.96)",borderBottom:"1px solid rgba(249,115,22,0.15)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#f97316,#ea580c)"}}>
            <Plane className="w-4 h-4 text-white"/>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{trip.name}</p>
            <p className="text-xs" style={{color:"#64748b"}}>{expenses.length} expenses · {trip.members.length} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Telegram pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
            style={{background:tg.enabled?"rgba(34,197,94,0.1)":"rgba(100,116,139,0.1)",border:`1px solid ${tg.enabled?"rgba(34,197,94,0.3)":"rgba(100,116,139,0.2)"}`,color:tg.enabled?"#4ade80":"#64748b"}}>
            {tgStatus==="sending"?<Loader2 className="w-3 h-3 animate-spin"/>:tgStatus==="ok"?<Check className="w-3 h-3"/>:tgStatus==="error"?<X className="w-3 h-3" style={{color:"#f87171"}}/>:tg.enabled?<Bell className="w-3 h-3"/>:<BellOff className="w-3 h-3"/>}
            {tgStatus==="sending"?"Sending…":tgStatus==="ok"?"Sent!":tgStatus==="error"?"Error":tg.enabled?"Telegram ON":"OFF"}
          </div>
          {/* Voice button */}
          <button onClick={listening?stopVoice:startVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{background:listening?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.05)",color:listening?"#f87171":"#94a3b8",border:`1px solid ${listening?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.1)"}`}}>
            {listening?<><MicOff className="w-4 h-4"/>Stop</>:<><Mic className="w-4 h-4"/>Voice</>}
          </button>
          <button onClick={()=>setShowSettings(s=>!s)} className="p-2 rounded-lg hover:bg-white/5">
            <Settings className="w-4 h-4" style={{color:"#94a3b8"}}/>
          </button>
          <button onClick={()=>{setForm(blank);setEditId(null);setShowForm(s=>!s);}}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold"
            style={{background:"#f97316",color:"white"}}>
            <Plus className="w-4 h-4"/>Add
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">

        {/* ── Voice overlay ─────────────────────────────────────────────────── */}
        {(listening||voiceTranscript||voiceError) && (
          <div className="rounded-xl p-4" style={{background:listening?"rgba(239,68,68,0.08)":"rgba(34,197,94,0.08)",border:`1px solid ${listening?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.3)"}`}}>
            <div className="flex items-center gap-3">
              {listening
                ?<><div className="relative"><Mic className="w-5 h-5" style={{color:"#f87171"}}/><span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"/></div><span className="text-sm font-semibold" style={{color:"#f87171"}}>Listening… speak now</span></>
                :voiceError?<><MicOff className="w-5 h-5" style={{color:"#f87171"}}/><span className="text-sm" style={{color:"#f87171"}}>{voiceError}</span></>
                :<><Check className="w-5 h-5" style={{color:"#4ade80"}}/><span className="text-sm font-semibold" style={{color:"#4ade80"}}>Got it! Form filled below ↓</span></>}
              <button onClick={()=>{setVoiceTranscript("");setVoiceError("");}} className="ml-auto"><X className="w-4 h-4" style={{color:"#64748b"}}/></button>
            </div>
            {voiceTranscript && <p className="text-sm mt-2 italic" style={{color:"#94a3b8"}}>"{voiceTranscript}"</p>}
            {listening && (
              <p className="text-xs mt-2" style={{color:"#64748b"}}>
                Try: <span style={{color:"#94a3b8"}}>"Spent 500 on dinner"</span> · <span style={{color:"#94a3b8"}}>"200 taxi paid by brother"</span> · <span style={{color:"#94a3b8"}}>"Hotel 3000 dad"</span>
              </p>
            )}
          </div>
        )}

        {/* ── Errors ───────────────────────────────────────────────────────────── */}
        {tgStatus==="error" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"}}>
            <X className="w-4 h-4 flex-shrink-0"/>Telegram error: {tgError}
            <button onClick={()=>setTgStatus("idle")} className="ml-auto"><X className="w-3.5 h-3.5"/></button>
          </div>
        )}
        {locError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"}}>
            <MapPin className="w-4 h-4 flex-shrink-0"/>{locError}
            <button onClick={()=>setLocError("")} className="ml-auto"><X className="w-3.5 h-3.5"/></button>
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────────────────── */}
        {showSettings && (
          <div style={{...card,padding:20}}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4" style={{color:"#f97316"}}/>Settings</p>
              <button onClick={()=>setShowSettings(false)}><X className="w-4 h-4" style={{color:"#64748b"}}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold mb-2" style={{color:"#f97316"}}>Trip Details</p>
                <input value={trip.name} onChange={e=>setTrip(t=>({...t,name:e.target.value}))} placeholder="Trip name" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                <input value={trip.currency} onChange={e=>setTrip(t=>({...t,currency:e.target.value}))} placeholder="₹ / $ / €" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                <p className="text-xs mb-1" style={{color:"#64748b"}}>Members (comma-separated)</p>
                <input value={trip.members.join(", ")} onChange={e=>setTrip(t=>({...t,members:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{color:"#f97316"}}>Telegram Notifications</p>
                <p className="text-xs mb-2" style={{color:"#64748b"}}>Brother gets a message on every add/edit/delete.</p>
                <input value={tg.token} onChange={e=>setTg(t=>({...t,token:e.target.value}))} placeholder="Bot Token (from @BotFather)" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-2 font-mono" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                <input value={tg.chatId} onChange={e=>setTg(t=>({...t,chatId:e.target.value}))} placeholder="Brother's Chat ID (@userinfobot)" className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none mb-3 font-mono" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                <div className="flex items-center justify-between">
                  <div onClick={()=>setTg(t=>({...t,enabled:!t.enabled}))} className="w-10 h-5 rounded-full relative cursor-pointer" style={{background:tg.enabled?"#22c55e":"rgba(255,255,255,0.1)"}}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{left:tg.enabled?"22px":"2px"}}/>
                  </div>
                  <span className="text-xs ml-2 flex-1" style={{color:tg.enabled?"#4ade80":"#64748b"}}>{tg.enabled?"Enabled":"Disabled"}</span>
                  <button onClick={()=>sendTelegram(`🔔 <b>${trip.name}</b> — Test! ✅`)} disabled={!tg.token||!tg.chatId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{background:"rgba(249,115,22,0.15)",color:"#f97316",border:"1px solid rgba(249,115,22,0.3)"}}>
                    <Send className="w-3 h-3"/>Test
                  </button>
                </div>
                <p className="text-xs mt-3 leading-relaxed" style={{color:"#475569"}}>
                  1. Message <b style={{color:"#94a3b8"}}>@BotFather</b> → /newbot → copy token<br/>
                  2. Brother messages <b style={{color:"#94a3b8"}}>@userinfobot</b> for his Chat ID<br/>
                  3. Brother sends <b style={{color:"#94a3b8"}}>/start</b> to your bot first
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Add / Edit form ───────────────────────────────────────────────── */}
        {showForm && (
          <div style={{...card,padding:20}}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white">{editId?"Edit Expense":"Add Expense"}</p>
              <button onClick={()=>{setShowForm(false);setEditId(null);setForm(blank);}}><X className="w-4 h-4" style={{color:"#64748b"}}/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Description *</label>
                <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  placeholder="e.g. Dinner at restaurant" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Amount ({trip.currency}) *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                  placeholder="0.00" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Date</label>
                <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                  className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>

              {/* Location — auto + manual */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Location</label>
                <div className="flex gap-2">
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
                    placeholder="Where did you spend? (auto-fill or type)"
                    className="flex-1 text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                  <button onClick={getLocation} disabled={locating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 flex-shrink-0 transition-all"
                    style={{background:form.location?"rgba(34,197,94,0.15)":"rgba(249,115,22,0.12)",color:form.location?"#4ade80":"#f97316",border:`1px solid ${form.location?"rgba(34,197,94,0.3)":"rgba(249,115,22,0.3)"}`}}>
                    {locating?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:form.location?<MapPin className="w-3.5 h-3.5"/>:<Navigation className="w-3.5 h-3.5"/>}
                    {locating?"Locating…":form.location?"Update":"Auto-locate"}
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c=>(
                    <button key={c.label} onClick={()=>setForm(f=>({...f,category:c.label}))}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{background:form.category===c.label?`${c.color}22`:"rgba(255,255,255,0.04)",color:form.category===c.label?c.color:"#64748b",border:`1px solid ${form.category===c.label?c.color+"50":"rgba(255,255,255,0.08)"}`}}>
                      {c.icon}{c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid by */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Paid by *</label>
                <div className="flex flex-wrap gap-2">
                  {trip.members.map(m=>(
                    <button key={m} onClick={()=>setForm(f=>({...f,paidBy:m}))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{background:form.paidBy===m?"rgba(249,115,22,0.18)":"rgba(255,255,255,0.04)",color:form.paidBy===m?"#f97316":"#64748b",border:`1px solid ${form.paidBy===m?"rgba(249,115,22,0.4)":"rgba(255,255,255,0.08)"}`}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{color:"#94a3b8"}}>Note (optional)</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                  placeholder="Any extra details…" className="w-full text-sm rounded-lg px-3 py-2.5 text-white outline-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={()=>{setShowForm(false);setEditId(null);setForm(blank);}} className="px-4 py-2 rounded-lg text-sm" style={{color:"#64748b"}}>Cancel</button>
              <button onClick={submitForm} disabled={!form.description||!form.amount||!form.paidBy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{background:"#f97316",color:"white"}}>
                {tgStatus==="sending"?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}
                {editId?"Save Changes":"Add Expense"}
                {tg.enabled&&<Bell className="w-3.5 h-3.5 opacity-70"/>}
              </button>
            </div>
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <StatCard label="Total Spend"     value={fmt(totalSpend,trip.currency)} sub={`${expenses.length} expenses`} color="#f97316"/>
          <StatCard label="Avg per Expense" value={fmt(expenses.length?totalSpend/expenses.length:0,trip.currency)} color="#a78bfa"/>
          <StatCard label="Members"         value={String(trip.members.length)} sub="on this trip" color="#22c55e"/>
          <StatCard label="Top Spender"     value={Object.entries(byMember).sort((a,b)=>b[1]-a[1])[0]?.[0]??"—"} color="#38bdf8"/>
        </div>

        {/* ── Member breakdown ─────────────────────────────────────────────────── */}
        <div style={{...card,padding:18}}>
          <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4" style={{color:"#f97316"}}/><p className="text-sm font-semibold text-white">Member Breakdown</p></div>
          <div className="flex flex-wrap gap-3">
            {trip.members.map(m=>{
              const amt=byMember[m]??0; const pct=totalSpend>0?(amt/totalSpend)*100:0;
              return (
                <div key={m} style={{flex:"1 1 130px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"12px 14px"}}>
                  <p className="text-xs font-semibold text-white mb-1">{m}</p>
                  <p className="text-base font-bold" style={{color:"#f97316"}}>{fmt(amt,trip.currency)}</p>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.07)"}}>
                    <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:"#f97316"}}/>
                  </div>
                  <p className="text-xs mt-1" style={{color:"#475569"}}>{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Category breakdown ───────────────────────────────────────────────── */}
        <div style={{...card,padding:18}}>
          <div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4" style={{color:"#f97316"}}/><p className="text-sm font-semibold text-white">By Category</p></div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c=>{
              const amt=byCat[c.label]??0;
              if (amt===0&&expenses.length>0) return null;
              return (
                <div key={c.label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{background:`${c.color}12`,border:`1px solid ${c.color}25`}}>
                  <span style={{color:c.color}}>{c.icon}</span>
                  <span className="text-xs font-semibold" style={{color:c.color}}>{c.label}</span>
                  <span className="text-xs font-bold text-white">{fmt(amt,trip.currency)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Expense list ─────────────────────────────────────────────────────── */}
        <div style={card}>
          <div className="flex items-center justify-between p-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <p className="text-sm font-semibold text-white">Expenses</p>
            <div className="flex gap-2">
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value as Category|"All")}
                className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8"}}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c=><option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <select value={filterMember} onChange={e=>setFilterMember(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8"}}>
                <option value="All">All Members</option>
                {trip.members.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {filtered.length===0?(
            <div className="flex flex-col items-center py-14 gap-3">
              <Wallet className="w-10 h-10" style={{color:"#1e293b"}}/>
              <p className="text-sm" style={{color:"#334155"}}>No expenses yet</p>
              <button onClick={()=>{setForm(blank);setEditId(null);setShowForm(true);}}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold mt-1"
                style={{background:"rgba(249,115,22,0.12)",color:"#f97316",border:"1px solid rgba(249,115,22,0.25)"}}>
                <Plus className="w-4 h-4"/>Add First Expense
              </button>
            </div>
          ):(
            <div>
              {filtered.map(e=>(
                <div key={e.id} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-white/[0.02] transition-colors" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{background:`${catColor(e.category)}18`,color:catColor(e.category)}}>
                    {catIcon(e.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.description}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs" style={{color:catColor(e.category)}}>{e.category}</span>
                      <span className="text-xs" style={{color:"#475569"}}>·</span>
                      <span className="text-xs" style={{color:"#64748b"}}>by <b style={{color:"#94a3b8"}}>{e.paidBy}</b></span>
                      <span className="text-xs" style={{color:"#475569"}}>·</span>
                      <span className="text-xs" style={{color:"#475569"}}>{e.date}</span>
                      {e.location&&<><span className="text-xs" style={{color:"#475569"}}>·</span><span className="flex items-center gap-1 text-xs" style={{color:"#38bdf8"}}><MapPin className="w-2.5 h-2.5"/>{e.location}</span></>}
                    </div>
                    {e.note&&<p className="text-xs mt-0.5" style={{color:"#475569"}}>📌 {e.note}</p>}
                  </div>
                  <p className="text-base font-bold flex-shrink-0" style={{color:"#f97316"}}>{fmt(e.amount,trip.currency)}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={()=>startEdit(e)} className="p-1.5 rounded-lg hover:bg-white/5"><Edit2 className="w-3.5 h-3.5" style={{color:"#64748b"}}/></button>
                    <button onClick={()=>deleteExpense(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" style={{color:"#64748b"}}/></button>
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
