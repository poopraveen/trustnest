"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
  MessageCircle, Send, X, Loader2, User, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string | null; avatar: string | null };
  createdAt: string;
}

interface ChatWidgetProps {
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  sellerName: string | null;
}

export default function ChatWidget({
  propertyId,
  propertyTitle,
  sellerId,
  sellerName,
}: ChatWidgetProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat/rooms/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  }, []);

  const openChat = async () => {
    if (!session) return;
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      setRoomId(data.id);
      await fetchMessages(data.id);
    } finally {
      setLoading(false);
    }
  };

  // Polling for new messages
  useEffect(() => {
    if (!roomId || !open) return;
    pollRef.current = setInterval(() => fetchMessages(roomId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomId, open, fetchMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !roomId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <Link
        href={`/login?callbackUrl=/properties/${propertyId}`}
        className="btn-primary w-full justify-center"
      >
        <MessageCircle className="w-4 h-4" />
        Contact Seller
      </Link>
    );
  }

  if (session.user.id === sellerId) {
    return null; // Seller doesn't chat with themselves
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openChat}
        className="btn-primary w-full justify-center"
      >
        <MessageCircle className="w-4 h-4" />
        Chat with Seller
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary-800 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{sellerName ?? "Seller"}</p>
                <p className="text-xs text-primary-200 truncate max-w-36">{propertyTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", minimized && "rotate-180")} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64 bg-slate-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Start a conversation</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ask about this property
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === session.user.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isMine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-3 py-2 rounded-xl text-sm",
                            isMine
                              ? "bg-primary-700 text-white rounded-br-sm"
                              : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"
                          )}
                        >
                          <p>{msg.content}</p>
                          <p className={cn("text-xs mt-0.5", isMine ? "text-primary-200" : "text-slate-400")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
