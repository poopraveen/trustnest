"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { Vote, Globe, Home, Menu, X, MapPin, Users, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/ward-election", label: "Wards", labelTa: "வார்டுகள்", icon: MapPin },
  { href: "/ward-election", label: "Candidates", labelTa: "வேட்பாளர்கள்", icon: Users },
  { href: "/ward-election", label: "Results", labelTa: "முடிவுகள்", icon: BarChart3 },
  { href: "/ward-election", label: "Turnout", labelTa: "வாக்குப்பதிவு", icon: Vote },
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

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 to-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link href="/ward-election" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Vote className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold text-white tracking-tight">
                Ward Election
              </span>
              <span className="text-[10px] text-indigo-200 font-medium">
                Ward-Level Insights
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 ml-4">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={`${link.label}-${i}`}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {isTa ? link.labelTa : link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={switchLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/85 border border-white/25 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === "en" ? "தமிழ்" : "English"}
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 bg-white px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              TrustNest
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={switchLocale}
              className="text-white/85 text-xs px-2 py-1 border border-white/30 rounded"
            >
              {locale === "en" ? "த" : "EN"}
            </button>
            <button type="button" className="p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-indigo-950 border-t border-indigo-700 px-4 py-3 flex flex-col gap-0.5">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={`${link.label}-${i}`}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors text-white/85 hover:text-white hover:bg-white/10"
              )}
            >
              <link.icon className="w-4 h-4" />
              {isTa ? link.labelTa : link.label}
            </Link>
          ))}
          <div className="border-t border-indigo-700 mt-2 pt-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-yellow-300 rounded-lg hover:bg-white/10"
            >
              <Home className="w-4 h-4" /> Back to TrustNest
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
