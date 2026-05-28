"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Heart, MessageCircle, ShieldCheck, ShieldX, CheckCheck, X } from "lucide-react";
import { Link } from "@/navigation";

interface Notification {
  id: string;
  type: "NEW_MATCH" | "NEW_MESSAGE" | "VERIFICATION_APPROVED" | "VERIFICATION_REJECTED";
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcon: Record<Notification["type"], React.ReactNode> = {
  NEW_MATCH: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />,
  NEW_MESSAGE: <MessageCircle className="w-4 h-4 text-blue-500" />,
  VERIFICATION_APPROVED: <ShieldCheck className="w-4 h-4 text-green-500" />,
  VERIFICATION_REJECTED: <ShieldX className="w-4 h-4 text-red-500" />,
};

const typeBg: Record<Notification["type"], string> = {
  NEW_MATCH: "bg-rose-50",
  NEW_MESSAGE: "bg-blue-50",
  VERIFICATION_APPROVED: "bg-green-50",
  VERIFICATION_REJECTED: "bg-red-50",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/dating/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/dating/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOneRead = async (id: string) => {
    await fetch("/api/dating/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-rose-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const content = (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? typeBg[n.type] : ""}`}
                    onClick={() => { if (!n.read) markOneRead(n.id); setOpen(false); }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${typeBg[n.type]}`}>
                      {typeIcon[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link as never}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400">Last 20 notifications shown</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
