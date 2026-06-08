"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Zap, BookOpen, FlaskConical, RotateCcw } from "lucide-react";

type Mode = "tutor" | "quiz" | "predict";
interface Message { role: "user" | "assistant"; content: string; }

const STARTERS: Record<Mode, string[]> = {
  tutor: [
    "Explain covalent vs ionic bonding",
    "What is Le Chatelier's principle?",
    "How does pH affect enzyme activity?",
    "Explain the electron configuration of iron",
  ],
  quiz: [
    "Give me 5 easy questions on periodic trends",
    "Quiz me on acid-base chemistry (medium)",
    "Hard questions on organic functional groups",
    "5 questions on thermodynamics",
  ],
  predict: [
    "HCl + NaOH →",
    "CH4 + O2 →",
    "Fe + CuSO4 →",
    "Na + H2O →",
  ],
};

export default function AIChatTutor() {
  const [mode, setMode]           = useState<Mode>("tutor");
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chemverse/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode }),
      });

      if (!res.ok) throw new Error("API error");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              reply += JSON.parse(line.slice(6)).text ?? "";
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: reply };
                return updated;
              });
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Check your OPENAI_API_KEY." }]);
    } finally {
      setLoading(false);
    }
  }

  const MODES: { id: Mode; label: string; icon: typeof Bot; color: string }[] = [
    { id: "tutor",   label: "Tutor",   icon: BookOpen,     color: "text-blue-400" },
    { id: "quiz",    label: "Quiz Me", icon: Zap,          color: "text-amber-400" },
    { id: "predict", label: "Predict", icon: FlaskConical, color: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <Bot className="w-5 h-5 text-violet-400" />
        <span className="font-bold text-white text-sm">ChemVerse AI</span>
        <div className="flex-1" />
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${mode === m.id ? `bg-white/10 border-current ${m.color}` : "border-slate-700 text-slate-500 hover:text-slate-300"}`}>
            <m.icon className="w-3 h-3" />
            {m.label}
          </button>
        ))}
        <button onClick={() => setMessages([])} title="Clear" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bot className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-white font-bold mb-1">ChemVerse AI Tutor</p>
            <p className="text-slate-400 text-sm mb-5">Ask any chemistry question</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {STARTERS[mode].map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-slate-700 hover:text-white transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600/80 text-white rounded-br-sm"
                : "bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-sm"
            }`} style={{ whiteSpace: "pre-wrap" }}>
              {msg.content}
              {msg.role === "assistant" && loading && i === messages.length - 1 && msg.content === "" && (
                <Loader2 className="w-4 h-4 animate-spin text-violet-400 inline" />
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} rows={1} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={mode === "predict" ? "Enter reactants, e.g.: Na + Cl2 →" : "Ask a chemistry question…"}
            className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-2.5 outline-none border-2 border-transparent focus:border-violet-500 placeholder-slate-500 text-sm resize-none"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
