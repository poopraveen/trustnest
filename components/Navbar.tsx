"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, LogOut, Menu, X, ChevronDown,
  Shield, Globe, BarChart3, MapPin, Briefcase,
  Users, MessageSquare, FileSearch, Settings, Home, ExternalLink, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ta">("en");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navLinks = [
    { href: "/expenditure",  label: "Expenditure",   labelTa: "செலவினம்",       icon: BarChart3     },
    { href: "/scorecards",   label: "Scorecards",    labelTa: "மதிப்பீடு",        icon: MapPin        },
    { href: "/projects",     label: "Projects",      labelTa: "திட்டங்கள்",       icon: Briefcase     },
    { href: "/schemes",      label: "Schemes",       labelTa: "நலத்திட்டங்கள்",   icon: Users         },
    { href: "/grievances",   label: "Grievances",    labelTa: "குறைகள்",          icon: MessageSquare },
    { href: "/tenders",      label: "Tenders",       labelTa: "டெண்டர்",          icon: FileSearch    },
    { href: "/data-sources", label: "Data Sources",  labelTa: "தரவு மூலங்கள்",   icon: Info          },
  ];

  return (
    <header className="sticky top-0 z-50">

      {/* ── Government identity bar ────────────────────────────────── */}
      <div className="bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-2">

            {/* TN Govt emblem */}
            <div className="flex-shrink-0 w-12 h-12 relative">
              <Image
                src="/images/tn-emblem.svg"
                alt="Government of Tamil Nadu Emblem"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            {/* Department text */}
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-green-800 uppercase tracking-widest hidden sm:block">
                Government of Tamil Nadu
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none tracking-tight">
                Finance Department
              </span>
              <span className="text-[10px] text-green-700 font-medium mt-0.5 hidden sm:block">
                Public Financial Transparency Platform
              </span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-10 bg-green-200 mx-2" />

            {/* Platform badge */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Platform</span>
              <span className="text-sm font-bold text-primary-700">
                TN<span className="text-primary-500">Vettri</span>
              </span>
              <span className="text-[10px] text-slate-400 font-tamil">வெட்டி — வெளிப்படைத்தன்மை</span>
            </div>

            <div className="flex-1" />

            {/* Right — language + back to TrustNest */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "ta" : "en")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "en" ? "தமிழ்" : "English"}
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                TrustNest
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation bar ────────────────────────────────────────── */}
      <nav className="bg-green-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5 h-full">
              {navLinks.map((link) => (
                <GovNavLink key={link.href} href={link.href} active={isActive(link.href)}>
                  <link.icon className="w-3.5 h-3.5" />
                  {lang === "ta" ? link.labelTa : link.label}
                </GovNavLink>
              ))}
            </div>

            {/* Right — session */}
            <div className="hidden lg:flex items-center gap-2">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-white text-[11px] font-bold">
                      {session.user.image ? (
                        <Image src={session.user.image} alt="avatar" width={24} height={24} className="object-cover" />
                      ) : (
                        session.user.name?.charAt(0) ?? "U"
                      )}
                    </div>
                    <span className="max-w-[100px] truncate">{session.user.name ?? session.user.email}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-sm text-slate-800 truncate">{session.user.name ?? "User"}</p>
                          <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                          <RoleBadge role={(session.user as any).role ?? "CITIZEN"} />
                        </div>
                        <MenuLink href="/profile" icon={Settings} onClick={() => setUserMenuOpen(false)}>My Profile</MenuLink>
                        {["OFFICER", "ADMIN"].includes((session.user as any).role) && (
                          <MenuLink href="/admin" icon={LayoutDashboard} onClick={() => setUserMenuOpen(false)}>Command Center</MenuLink>
                        )}
                        {(session.user as any).role === "ADMIN" && (
                          <MenuLink href="/admin/anomalies" icon={Shield} onClick={() => setUserMenuOpen(false)}>Anomaly Queue</MenuLink>
                        )}
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/grievances" className="text-xs font-semibold bg-white text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                    File Grievance
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2 ml-auto">
              <button
                onClick={() => setLang(lang === "en" ? "ta" : "en")}
                className="text-white/80 text-xs px-2 py-1 border border-white/30 rounded"
              >
                {lang === "en" ? "த" : "EN"}
              </button>
              <button className="p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-green-900 border-t border-green-700 px-4 py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                  isActive(link.href)
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <link.icon className="w-4 h-4" />
                {lang === "ta" ? link.labelTa : link.label}
              </Link>
            ))}
            <div className="border-t border-green-700 mt-2 pt-2 flex flex-col gap-1">
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-300 rounded-lg hover:bg-white/10">
                <Home className="w-4 h-4" /> Back to TrustNest
              </Link>
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-300 rounded-lg hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 rounded-lg hover:bg-white/10">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function GovNavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 h-full text-xs font-semibold transition-colors border-b-2",
        active
          ? "border-amber-300 text-white bg-white/10"
          : "border-transparent text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40"
      )}
    >
      {children}
    </Link>
  );
}

function MenuLink({ href, icon: Icon, children, onClick }: { href: string; icon: any; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
      <Icon className="w-4 h-4 text-slate-400" />
      {children}
    </Link>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    CITIZEN: "bg-blue-100 text-blue-700",
    OFFICER: "bg-green-100 text-green-700",
    ADMIN:   "bg-purple-100 text-purple-700",
    AUDITOR: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={cn("mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium", map[role] ?? "bg-slate-100 text-slate-600")}>
      {role}
    </span>
  );
}
