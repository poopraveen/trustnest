"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import { Bot, Loader2, Send, User, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveAreaId, wardElectionHref } from "@/lib/ward-election-areas";
import type { WardChatMessage } from "@/lib/ward-election-ai";

export interface ChatMessage extends WardChatMessage {
  toolsUsed?: string[];
  streaming?: boolean;
}

const STARTERS = [
  "Search voter JSON for name Kumar in Part 167",
  "How many voters in JSON are female in Veppampattu?",
  "List all Perumalpattu parts with elector counts",
  "Show households in Part 164 with 5+ voters",
  "Compare Veppampattu vs Perumalpattu total electors",
  "Who lives in house number 12 in Part 166?",
];

/** Render assistant markdown: bold, tables, part links. */
function ChatMarkdown({ text, areaFocus }: { text: string; areaFocus: string }) {
  const partLink = (part: string) => {
    const n = part.replace(/\D/g, "");
    if (!n) return part;
    const area =
      Number(n) >= 188 ? "perumalpattu" : Number(n) >= 164 ? "veppampattu" : areaFocus === "all" ? "veppampattu" : areaFocus;
    return (
      <Link
        href={wardElectionHref(`/ward-election/wards/${n}`, area)}
        className="text-indigo-600 font-medium hover:underline"
      >
        Part {n}
      </Link>
    );
  };

  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.includes("|") && lines[i + 1]?.match(/^\|?[\s\-:|]+\|?$/)) {
      const header = line.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        bodyRows.push(lines[i].split("|").map((c) => c.trim()).filter(Boolean));
        i++;
      }
      blocks.push(
        <div key={`t-${i}`} className="overflow-x-auto my-2 rounded-lg border border-slate-200">
          <table className="text-xs w-full">
            <thead className="bg-slate-100">
              <tr>
                {header.map((h, j) => (
                  <th key={j} className="px-2 py-1.5 text-left font-semibold text-slate-700">
                    {formatInline(h, partLink)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-t border-slate-100">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-slate-700">
                      {formatInline(cell, partLink)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push(
        <p key={i} className="pl-4 relative text-sm before:content-['•'] before:absolute before:left-1 before:text-indigo-500">
          {formatInline(line.slice(2), partLink)}
        </p>
      );
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push(
        <p key={i} className="text-sm pl-1">
          {formatInline(line, partLink)}
        </p>
      );
    } else if (line.trim()) {
      blocks.push(<p key={i} className="text-sm">{formatInline(line, partLink)}</p>);
    } else {
      blocks.push(<div key={i} className="h-1" />);
    }
    i++;
  }

  return <div className="space-y-1.5 leading-relaxed">{blocks}</div>;
}

function formatInline(
  text: string,
  partLink: (p: string) => ReactNode
): ReactNode {
  const segments: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|Part\s+\d{3})/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  const s = text;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) segments.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      segments.push(<strong key={m.index}>{tok.slice(2, -2)}</strong>);
    } else if (/^Part\s+\d+/i.test(tok)) {
      segments.push(<span key={m.index}>{partLink(tok)}</span>);
    } else {
      segments.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < s.length) segments.push(s.slice(last));
  return segments.length ? segments : text;
}

export default function WardElectionChat({
  compact = false,
  className,
  openaiConfigured = true,
}: {
  compact?: boolean;
  className?: string;
  openaiConfigured?: boolean;
}) {
  const searchParams = useSearchParams();
  const areaFromUrl = resolveAreaId(searchParams.get("area"));
  const [areaFocus, setAreaFocus] = useState<"all" | "veppampattu" | "perumalpattu">(
    areaFromUrl === "perumalpattu" ? "perumalpattu" : areaFromUrl === "veppampattu" ? "veppampattu" : "all"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me anything about your **voter JSON**, ward rolls, households, or campaign data for **Veppampattu** and **Perumalpattu**. I search the live data — try a name, voter ID, house number, or part number.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openaiOk, setOpenaiOk] = useState(openaiConfigured);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (openaiConfigured) return;
    fetch("/api/ward-election/chat")
      .then((r) => r.json())
      .then((d) => setOpenaiOk(Boolean(d.configured)))
      .catch(() => setOpenaiOk(false));
  }, [openaiConfigured]);

  const canChat = openaiConfigured || openaiOk;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, status]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || !canChat) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const prior = messages;
      const nextMessages = [...messages, userMsg];
      const apiMessages = nextMessages.filter((m, i) => !(i === 0 && m.role === "assistant"));

      setMessages([...nextMessages, { role: "assistant", content: "", streaming: true }]);
      setInput("");
      setLoading(true);
      setError(null);
      setStatus("Reading your question…");

      try {
        const res = await fetch("/api/ward-election/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, areaFocus, stream: true }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Something went wrong.");
          setMessages(prior);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullReply = "";
        const toolsUsed: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(line.slice(6)) as {
                type: string;
                message?: string;
                text?: string;
                reply?: string;
                toolsUsed?: string[];
              };
              if (ev.type === "status" && ev.message) setStatus(ev.message);
              if (ev.type === "token" && ev.text) {
                fullReply += ev.text;
                setStatus(null);
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === "assistant") {
                    copy[copy.length - 1] = {
                      ...last,
                      content: fullReply,
                      streaming: true,
                    };
                  }
                  return copy;
                });
              }
              if (ev.type === "done") {
                fullReply = ev.reply ?? fullReply;
                if (ev.toolsUsed?.length) {
                  toolsUsed.length = 0;
                  toolsUsed.push(...ev.toolsUsed);
                }
              }
              if (ev.type === "error") {
                throw new Error(ev.message ?? "Stream error");
              }
            } catch {
              /* ignore partial JSON */
            }
          }
        }

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: fullReply || "No response.",
            toolsUsed: Array.from(new Set(toolsUsed)),
            streaming: false,
          };
          return copy;
        });
      } catch {
        setError("Network error. Please try again.");
        setMessages(prior);
      } finally {
        setLoading(false);
        setStatus(null);
        inputRef.current?.focus();
      }
    },
    [areaFocus, loading, messages, canChat]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden",
        compact ? "h-full min-h-0" : "h-[min(78vh,720px)]",
        className
      )}
    >
      {!canChat && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
          Add <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> to{" "}
          <code className="bg-amber-100 px-1 rounded">.env.local</code> and restart the dev server.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Ward Election AI
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          <Database className="w-3 h-3" />
          Live JSON lookup
        </span>
        <div className="flex gap-1 ml-auto">
          {(["all", "veppampattu", "perumalpattu"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setAreaFocus(id)}
              className={cn(
                "text-[10px] sm:text-xs px-2 py-1 rounded-md font-medium transition-colors",
                areaFocus === id
                  ? "bg-indigo-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {id === "all" ? "Both" : id === "veppampattu" ? "Veppampattu" : "Perumalpattu"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex gap-2.5", m.role === "user" ? "flex-row-reverse" : "")}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.role === "user" ? "bg-indigo-100" : "bg-slate-100"
              )}
            >
              {m.role === "user" ? (
                <User className="w-4 h-4 text-indigo-700" />
              ) : (
                <Bot className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5",
                m.role === "user"
                  ? "bg-indigo-700 text-white"
                  : "bg-slate-50 text-slate-800 border border-slate-100"
              )}
            >
              {m.role === "assistant" ? (
                <>
                  {m.content ? (
                    <ChatMarkdown text={m.content} areaFocus={areaFocus} />
                  ) : m.streaming ? (
                    <span className="text-sm text-slate-400">…</span>
                  ) : null}
                  {m.streaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse rounded-sm" />
                  )}
                  {m.toolsUsed && m.toolsUsed.length > 0 && !m.streaming && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-200/80">
                      {m.toolsUsed.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {status && loading && (
          <div className="flex items-center gap-2 text-indigo-600 text-xs pl-10 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {status}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!compact && messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              className="text-xs text-left px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 text-indigo-800 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="px-4 pb-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="p-3 border-t border-slate-100 bg-slate-50/80">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            rows={2}
            placeholder="Ask anything — voter name, house no., Part 188, counts from JSON…"
            disabled={loading || !canChat}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !canChat}
            className="shrink-0 p-2.5 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
