"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import {
  Vote, Globe, Home, Menu, X, MapPin, Trophy, Sparkles,
  ClipboardList, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/ward-election", label: "Dashboard", labelTa: "முகப்பு", icon: MapPin },
  { href: "/ward-election/plan", label: "Win Plan", labelTa: "வெற்றித் திட்டம்", icon: Trophy },
  { href: "/ward-election/canvassing", label: "Canvass", labelTa: "வீடு வீடா", icon: ClipboardList },
  { href: "/ward-election/campaign", label: "Campaign", labelTa: "பிரச்சாரம்", icon: BarChart3 },
  { href: "/ward-election/turnout", label: "GOTV", labelTa: "வாக்குப்பதிவு", icon: Vote },
  { href: "/ward-election/strategy", label: "AI Strategy", labelTa: "உத்தி", icon: Sparkles },
];

export default function WardElectionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTa = locale === "ta";

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === "en" ? "ta" : "en" });
  };

  const isActive = (href: string) =>
    href === "/ward-election"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 to-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link href="/ward-election" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Vote className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold text-white tracking-tight">Ward Election</span>
              <span className="text-[10px] text-indigo-200 font-medium">Win the ward</span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5 ml-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg transition-colors",
                  isActive(link.href)
                    ? "bg-white/20 text-white"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )}
              >
                <link.icon className="w-3.5 h-3.5" />
                {isTa ? link.labelTa : link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={switchLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/85 border border-white/25 rounded-lg hover:bg-white/10">
              <Globe className="w-3.5 h-3.5" />
              {locale === "en" ? "தமிழ்" : "English"}
            </button>
            <Link href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 bg-white px-3 py-1.5 rounded-lg hover:bg-indigo-50">
              <Home className="w-3.5 h-3.5" /> TrustNest
            </Link>
          </div>

          <div className="xl:hidden flex items-center gap-2 ml-auto">
            <button type="button" onClick={switchLocale}
              className="text-white/85 text-xs px-2 py-1 border border-white/30 rounded">
              {locale === "en" ? "த" : "EN"}
            </button>
            <button type="button" className="p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden bg-indigo-950 border-t border-indigo-700 px-4 py-3 flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive(link.href) ? "bg-white/20 text-white font-semibold" : "text-white/85 hover:bg-white/10"
              )}>
              <link.icon className="w-4 h-4" />
              {isTa ? link.labelTa : link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
