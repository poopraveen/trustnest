"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Send, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Link } from "@/navigation";

interface MatchProfile {
  id: string;
  displayName: string;
  photos: string[];
  age: number;
  city: string;
  state: string;
}

interface Match {
  matchId: string;
  profile: MatchProfile;
  lastMessage: { content: string; createdAt: string; senderId: string; read: boolean } | null;
  unread: boolean;
}

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myProfileId = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status !== "authenticated") return;

    fetch("/api/dating/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .catch(() => toast("Failed to load matches", "error"))
      .finally(() => setLoading(false));

    fetch("/api/dating/profile")
      .then((r) => r.json())
      .then((d) => { myProfileId.current = d.profile?.id ?? null; });
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = async (match: Match) => {
    setActiveMatch(match);
    setMsgLoading(true);
    try {
      const res = await fetch(`/api/dating/messages?matchId=${match.matchId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setMatches((prev) => prev.map((m) => m.matchId === match.matchId ? { ...m, unread: false } : m));
    } finally {
      setMsgLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeMatch) return;
    setSending(true);
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      matchId: activeMatch.matchId,
      senderId: myProfileId.current ?? "",
      content: newMsg.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMsg("");
    try {
      const res = await fetch("/api/dating/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: activeMatch.matchId, content: optimistic.content }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Send failed", "error"); return; }
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? data.message : m));
    } catch {
      toast("Send failed", "error");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          Your Matches
        </h1>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Matches Yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Start liking profiles — when someone likes you back, you'll match! Check back soon.
            </p>
            <Link
              href="/dating/profiles"
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 h-[600px]">
            {/* Match list */}
            <div className={`md:col-span-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col ${activeMatch ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Conversations</h2>
              </div>
              <div className="overflow-y-auto flex-1">
                {matches.map((match) => (
                  <button
                    key={match.matchId}
                    onClick={() => openChat(match)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-rose-50 transition-colors border-b border-slate-50 text-left ${
                      activeMatch?.matchId === match.matchId ? "bg-rose-50" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 overflow-hidden shrink-0">
                      {match.profile.photos[0] ? (
                        <img src={match.profile.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-rose-500 font-bold text-lg">{match.profile.displayName[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 text-sm">{match.profile.displayName}</span>
                        {match.unread && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {match.lastMessage ? match.lastMessage.content : "Say hello! 👋"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            {activeMatch ? (
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                  <button className="md:hidden" onClick={() => setActiveMatch(null)}>
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-rose-100 overflow-hidden">
                    {activeMatch.profile.photos[0] ? (
                      <img src={activeMatch.profile.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-rose-500 font-bold">{activeMatch.profile.displayName[0]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{activeMatch.profile.displayName}</p>
                    <p className="text-xs text-slate-500">{activeMatch.profile.city}, {activeMatch.profile.state}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      You matched! Send the first message.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === myProfileId.current;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Type a message..."
                      className="flex-1 input-base"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMsg.trim()}
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:col-span-2 bg-white rounded-2xl shadow-sm items-center justify-center">
                <div className="text-center text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
