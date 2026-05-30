"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  text: string;
  textTamil?: string | null;
}

export default function TickerBanner({ lang = "ta" }: { lang?: "en" | "ta" }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/community/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements ?? []));
  }, []);

  if (announcements.length === 0) return null;

  const items = [...announcements, ...announcements]; // duplicate for seamless loop
  const text = (a: Announcement) => (lang === "ta" && a.textTamil ? a.textTamil : a.text);

  return (
    <div className="bg-amber-500 text-white flex items-center overflow-hidden h-9">
      <div className="shrink-0 flex items-center gap-2 bg-amber-600 px-4 h-full z-10">
        <Megaphone className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
          {lang === "ta" ? "அறிவிப்பு" : "Notice"}
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {items.map((a, i) => (
            <span key={`${a.id}-${i}`} className="text-sm font-medium px-8">
              {text(a)} &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
