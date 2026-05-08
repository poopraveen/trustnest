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
    { href: "/expenditure", label: "Expenditure",  labelTa: "செலவினம்",  icon: BarChart3 },
    { href: "/scorecards",  label: "Scorecards",   labelTa: "மதிப்பீடு",   icon: MapPin },
    { href: "/projects",    label: "Projects",     labelTa: "திட்டங்கள்",  icon: Briefcase },
    { href: "/schemes",     label: "Schemes",      labelTa: "திட்டங்கள்",  icon: Users },
    { href: "/grievances",  label: "Grievances",   labelTa: "குறைகள்",    icon: MessageSquare },
    { href: "/tenders",      label: "Tenders",      labelTa: "டெண்டர்",    icon: FileSearch },
    { href: "/data-sources", label: "Data Sources", labelTa: "தரவு மூலங்கள்", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-nav border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-900">
              TN<span className="text-primary-600">Vettri</span>
            </span>
            <span className="hidden sm:block text-xs text-slate-400 border-l border-slate-200 pl-2 ml-1">
              {lang === "ta" ? "தமிழ்நாடு வெளிப்படைத்தன்மை" : "Tamil Nadu Transparency"}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} active={isActive(link.href)}>
                {lang === "ta" ? link.labelTa : link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Back to TrustNest switch */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              TrustNest
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ta" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "தமிழ்" : "English"}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="avatar" width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-primary-700">
                        {session.user.name?.charAt(0) ?? session.user.email?.charAt(0) ?? "U"}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-sm text-slate-800 truncate">
                          {session.user.name ?? "User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                        <RoleBadge role={(session.user as any).role ?? "CITIZEN"} />
                      </div>

                      <MenuLink href="/profile" icon={Settings} onClick={() => setUserMenuOpen(false)}>
                        My Profile
                      </MenuLink>

                      {["OFFICER", "ADMIN"].includes((session.user as any).role) && (
                        <MenuLink href="/admin" icon={LayoutDashboard} onClick={() => setUserMenuOpen(false)}>
                          Command Center
                        </MenuLink>
                      )}

                      {(session.user as any).role === "ADMIN" && (
                        <MenuLink href="/admin/anomalies" icon={Shield} onClick={() => setUserMenuOpen(false)}>
                          Anomaly Queue
                        </MenuLink>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2">
                  File Grievance
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-1 animate-fade-in">
          {navLinks.map((link) => (
            <MobileLink key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <link.icon className="w-4 h-4 text-slate-400" />
              {lang === "ta" ? link.labelTa : link.label}
            </MobileLink>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-brand-orange rounded-lg bg-orange-50 hover:bg-orange-100">
              <Home className="w-4 h-4" /> Back to TrustNest
            </Link>
            <button
              onClick={() => setLang(lang === "en" ? "ta" : "en")}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <Globe className="w-4 h-4" />
              {lang === "en" ? "தமிழில் பார்க்க" : "View in English"}
            </button>
            {session ? (
              <>
                <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>
                  <Settings className="w-4 h-4 text-slate-400" /> My Profile
                </MobileLink>
                {["OFFICER", "ADMIN"].includes((session.user as any).role) && (
                  <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Command Center
                  </MobileLink>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileLink>
                <MobileLink href="/grievances/new" onClick={() => setMobileOpen(false)}>File Grievance</MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:text-primary-700 hover:bg-slate-50"
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

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">
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
