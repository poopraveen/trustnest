"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Wifi, WifiOff, Send, AlertTriangle, Users, Radio,
  CheckCircle, HelpCircle, Heart, Truck, Package,
  MessageCircle, ArrowLeft, Loader2, Bell, Paperclip,
  FileText, Image as ImageIcon, X,
} from "lucide-react";

/* ── Channel config ─────────────────────────────────────────────────────────── */
const CHANNELS = [
  { id: "general",    label: "General",    icon: MessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10",   border: "border-blue-500/40" },
  { id: "sos",        label: "SOS",        icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10",    border: "border-red-500/40" },
  { id: "medical",    label: "Medical",    icon: Heart,         color: "text-pink-400",    bg: "bg-pink-500/10",   border: "border-pink-500/40" },
  { id: "evacuation", label: "Evacuation", icon: Truck,         color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/40" },
  { id: "resources",  label: "Resources",  icon: Package,       color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/40" },
] as const;

type ChannelId = typeof CHANNELS[number]["id"];

/* ── User status ────────────────────────────────────────────────────────────── */
const STATUSES = [
  { id: "safe",      label: "Safe",          icon: CheckCircle, color: "text-emerald-400" },
  { id: "help",      label: "Need Help",     icon: HelpCircle,  color: "text-red-400" },
  { id: "providing", label: "Providing Help",icon: Heart,       color: "text-amber-400" },
] as const;
type StatusId = typeof STATUSES[number]["id"];

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Message {
  id: string;
  channel: string;
  author: string;
  content: string;
  priority: boolean;
  status?: string | null;
  createdAt: string;
  _pending?: boolean;
}
interface OnlineUser { userId: string; name: string; channel: string; status: string; }

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const OFFLINE_KEY = "mesh_chat_queue";
function loadQueue(): Message[] {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) ?? "[]"); } catch { return []; }
}
function saveQueue(q: Message[]) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function MeshChatClient() {
  const [joined, setJoined]           = useState(false);
  const [name, setName]               = useState("");
  const [userId]                      = useState(() => {
    if (typeof window === "undefined") return genId();
    return localStorage.getItem("mesh_uid") ?? (() => { const id = genId(); localStorage.setItem("mesh_uid", id); return id; })();
  });
  const [channel, setChannel]         = useState<ChannelId>("general");
  const [myStatus, setMyStatus]       = useState<StatusId>("safe");
  const [messages, setMessages]       = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput]             = useState("");
  const [priority, setPriority]       = useState(false);
  const [online, setOnline]           = useState(true);
  const [attachment, setAttachment]   = useState<{ url: string; name: string; type: string } | null>(null);
  const [uploading, setUploading]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUsers, setShowUsers]     = useState(false);
  const [unread, setUnread]           = useState<Record<ChannelId, number>>({
    general: 0, sos: 0, medical: 0, evacuation: 0, resources: 0,
  });
  const lastSeenRef   = useRef<Record<ChannelId, string>>({
    general: "", sos: "", medical: "", evacuation: "", resources: "",
  });
  const sinceRef      = useRef<string>("");
  const bottomRef     = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Restore session ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("mesh_name");
    if (saved) { setName(saved); setJoined(true); }
  }, []);

  /* ── Fetch messages ───────────────────────────────────────────────────────── */
  const fetchMessages = useCallback(async (ch: ChannelId, since?: string) => {
    try {
      const url = `/api/mesh-chat/messages?channel=${ch}${since ? `&since=${encodeURIComponent(since)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("server error");
      const data = await res.json();
      setOnline(true);
      return (data.messages ?? []) as Message[];
    } catch {
      setOnline(false);
      return [];
    }
  }, []);

  /* ── Initial load when joining / switching channel ───────────────────────── */
  useEffect(() => {
    if (!joined) return;
    setMessages([]);
    sinceRef.current = "";
    fetchMessages(channel).then(msgs => {
      if (msgs.length > 0) {
        setMessages(msgs);
        sinceRef.current = msgs[msgs.length - 1].createdAt;
      }
    });
  }, [joined, channel, fetchMessages]);

  /* ── Polling loop ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!joined) return;
    pollRef.current = setInterval(async () => {
      const newMsgs = await fetchMessages(channel, sinceRef.current || undefined);
      if (newMsgs.length > 0) {
        sinceRef.current = newMsgs[newMsgs.length - 1].createdAt;
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const added = newMsgs.filter(m => !ids.has(m.id));
          return added.length ? [...prev, ...added] : prev;
        });
      }
      // count unread for other channels
      for (const ch of CHANNELS) {
        if (ch.id === channel) continue;
        const chMsgs = await fetchMessages(ch.id, lastSeenRef.current[ch.id] || undefined);
        if (chMsgs.length > 0) {
          setUnread(prev => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + chMsgs.length }));
          lastSeenRef.current[ch.id] = chMsgs[chMsgs.length - 1].createdAt;
        }
      }
    }, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [joined, channel, fetchMessages]);

  /* ── Heartbeat / presence ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!joined || !name) return;
    const beat = async () => {
      try {
        await fetch("/api/mesh-chat/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name, channel, status: myStatus }),
        });
        const res  = await fetch("/api/mesh-chat/presence");
        const data = await res.json();
        setOnlineUsers(data.users ?? []);
      } catch { /* offline */ }
    };
    beat();
    heartbeatRef.current = setInterval(beat, 10_000);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [joined, name, channel, myStatus, userId]);

  /* ── Auto-scroll ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Offline queue sync ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!online) return;
    const queue = loadQueue();
    if (queue.length === 0) return;
    (async () => {
      for (const msg of queue) {
        try {
          await fetch("/api/mesh-chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(msg),
          });
        } catch { break; }
      }
      saveQueue([]);
    })();
  }, [online]);

  /* ── Upload file ──────────────────────────────────────────────────────────── */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/mesh-chat/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachment({ url: data.url, name: data.name, type: data.type });
    } catch {
      alert("File upload failed. Make sure you are running on local server.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ── Send ─────────────────────────────────────────────────────────────────── */
  async function send() {
    const text = input.trim();
    const hasAttachment = Boolean(attachment);
    if (!text && !hasAttachment) return;
    if (!name) return;
    setInput("");
    const msgContent = attachment
      ? `${text ? text + "\n" : ""}[FILE:${attachment.name}:${attachment.url}:${attachment.type}]`
      : text;
    setAttachment(null);

    const optimistic: Message = {
      id: genId(), channel, author: name, content: msgContent,
      priority, status: myStatus, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch("/api/mesh-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, author: name, content: msgContent, priority, status: myStatus }),
      });
      if (!res.ok) throw new Error();
      const { message } = await res.json();
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...message } : m));
      sinceRef.current = message.createdAt;
      setOnline(true);
    } catch {
      setOnline(false);
      const queue = loadQueue();
      queue.push({ channel, author: name, content: msgContent, priority, status: myStatus, id: optimistic.id, createdAt: optimistic.createdAt });
      saveQueue(queue);
    }
    setPriority(false);
    inputRef.current?.focus();
  }

  /* ── Join screen ──────────────────────────────────────────────────────────── */
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 border-2 border-cyan-500/40 rounded-3xl mb-4">
              <Radio className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Mesh Chat</h1>
            <p className="text-slate-400 text-sm">Local WiFi · No Internet Required</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Offline-capable · Works in 1km WiFi range
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Your Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value.slice(0, 30))}
              placeholder="Enter your name"
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-cyan-500 placeholder-slate-500 font-medium mb-4"
              onKeyDown={e => { if (e.key === "Enter" && name.trim()) { localStorage.setItem("mesh_name", name.trim()); setName(name.trim()); setJoined(true); }}}
            />
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Your Status
            </label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {STATUSES.map(s => (
                <button key={s.id} onClick={() => setMyStatus(s.id as StatusId)}
                  className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${myStatus === s.id ? "border-current bg-white/10" : "border-slate-600 text-slate-400"} ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
            <button
              disabled={!name.trim()}
              onClick={() => { localStorage.setItem("mesh_name", name.trim()); setName(name.trim()); setJoined(true); }}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Radio className="w-5 h-5" />
              Join Channel
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-4">
            No account needed · All messages stored locally
          </p>
        </div>
      </div>
    );
  }

  const ch = CHANNELS.find(c => c.id === channel)!;
  const ChIcon = ch.icon;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center gap-2 shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ch.bg} border ${ch.border}`}>
          <ChIcon className={`w-4 h-4 ${ch.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-sm">{ch.label}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {online ? "● Online" : "● Offline"}
            </span>
          </div>
          <p className="text-slate-500 text-xs">{name} · {STATUSES.find(s => s.id === myStatus)?.label}</p>
        </div>
        <button onClick={() => setShowUsers(v => !v)}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <Users className="w-4 h-4 text-slate-300" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {onlineUsers.length}
          </span>
        </button>
        <a href="/" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </a>
      </header>

      {/* ── Channel tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-2 py-1.5 bg-slate-950 border-b border-slate-800 overflow-x-auto shrink-0">
        {CHANNELS.map(c => {
          const CIcon = c.icon;
          const isActive = c.id === channel;
          const count = unread[c.id] ?? 0;
          return (
            <button key={c.id}
              onClick={() => { setChannel(c.id as ChannelId); setUnread(p => ({ ...p, [c.id]: 0 })); lastSeenRef.current[c.id as ChannelId] = new Date().toISOString(); }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive ? `${c.bg} ${c.color} border ${c.border}` : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <CIcon className="w-3.5 h-3.5" />
              {c.label}
              {count > 0 && !isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Message list ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Radio className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">No messages yet in #{ch.label}</p>
              <p className="text-slate-700 text-xs mt-1">Be the first to send a message</p>
            </div>
          )}

          {messages.map(msg => {
            const isMe = msg.author === name;
            const isPrio = msg.priority;
            const msgStatus = STATUSES.find(s => s.id === msg.status);

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isPrio ? "w-full max-w-full" : ""}`}>
                  {/* Priority banner */}
                  {isPrio && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bell className="w-3 h-3 text-red-400" />
                      <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Priority Alert</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-3 py-2 ${
                    isPrio
                      ? "bg-red-950/60 border-2 border-red-500/60 w-full"
                      : isMe
                        ? "bg-cyan-700/80 rounded-br-sm"
                        : "bg-slate-800 border border-slate-700/60 rounded-bl-sm"
                  } ${msg._pending ? "opacity-60" : ""}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-cyan-300">{msg.author}</span>
                        {msgStatus && (
                          <span className={`text-[10px] font-semibold ${msgStatus.color}`}>
                            · {msgStatus.label}
                          </span>
                        )}
                      </div>
                    )}
                    {(() => {
                      const fileMatch = msg.content.match(/\[FILE:(.+?):(.+?):(.+?)\]/);
                      const textPart  = msg.content.replace(/\[FILE:.+?\]/, "").trim();
                      return (
                        <>
                          {textPart && (
                            <p className={`text-sm leading-relaxed ${isMe ? "text-white" : "text-slate-200"} ${isPrio ? "font-bold text-red-200" : ""}`}>
                              {textPart}
                            </p>
                          )}
                          {fileMatch && (
                            <a href={fileMatch[2]} target="_blank" rel="noopener noreferrer" download={fileMatch[1]}
                              className="mt-2 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors">
                              {fileMatch[3]?.startsWith("image/")
                                ? <ImageIcon className="w-4 h-4 text-blue-300 shrink-0" />
                                : <FileText className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className="text-xs text-slate-200 truncate flex-1">{fileMatch[1]}</span>
                              {fileMatch[3]?.startsWith("image/") && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={fileMatch[2]} alt={fileMatch[1]} className="w-full rounded-lg mt-1 max-h-48 object-cover" />
                              )}
                            </a>
                          )}
                        </>
                      );
                    })()}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {msg._pending && <Loader2 className="w-2.5 h-2.5 text-slate-400 animate-spin" />}
                      <p className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Online users sidebar ────────────────────────────────────────────── */}
        {showUsers && (
          <div className="w-48 bg-slate-950 border-l border-slate-800 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Online ({onlineUsers.length})
              </p>
            </div>
            <div className="p-2 space-y-1">
              {onlineUsers.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No users visible</p>
              )}
              {onlineUsers.map(u => {
                const st = STATUSES.find(s => s.id === u.status);
                return (
                  <div key={u.userId} className="px-2 py-1.5 rounded-lg bg-slate-800/60">
                    <p className={`text-xs font-bold ${u.name === name ? "text-cyan-400" : "text-white"}`}>
                      {u.name}{u.name === name ? " (you)" : ""}
                    </p>
                    <p className={`text-[10px] ${st?.color ?? "text-slate-500"}`}>
                      {st?.label ?? "Active"} · #{u.channel}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Offline warning ────────────────────────────────────────────────── */}
      {!online && (
        <div className="px-3 py-2 bg-amber-950/80 border-t border-amber-700/40 flex items-center gap-2 shrink-0">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-xs">
            Server unreachable — messages queued locally, will send when reconnected
          </p>
        </div>
      )}

      {/* ── Status selector ────────────────────────────────────────────────── */}
      <div className="px-3 pt-2 flex gap-2 bg-slate-900 shrink-0">
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => setMyStatus(s.id as StatusId)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
              myStatus === s.id
                ? `border-current bg-white/10 ${s.color}`
                : "border-slate-700 text-slate-500 hover:text-slate-300"
            }`}>
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
        <div className="flex-1" />
        <Wifi className={`w-4 h-4 ${online ? "text-emerald-500" : "text-slate-600"}`} />
      </div>

      {/* ── Attachment preview ─────────────────────────────────────────────── */}
      {attachment && (
        <div className="px-3 pt-2 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300 flex-1 truncate">{attachment.name}</span>
            <button onClick={() => setAttachment(null)} className="p-0.5 hover:text-red-400 text-slate-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex gap-2 items-end shrink-0">
        <button
          onClick={() => setPriority(v => !v)}
          title="Mark as priority / alert"
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            priority
              ? "bg-red-600 border-red-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400"
          }`}
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file / photo"
          className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-cyan-400 transition-all shrink-0 disabled:opacity-40"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={priority ? "⚠️ Priority message…" : `Message #${ch.label}…`}
          className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-2.5 outline-none border-2 border-transparent focus:border-cyan-600 placeholder-slate-500 text-sm"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button
          onClick={send}
          disabled={!input.trim() && !attachment}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
