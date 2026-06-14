"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard, LogOut, Menu, X, ChevronDown,
  Shield, Globe, BarChart3, MapPin, Briefcase,
  Users, MessageSquare, FileSearch, Settings, Home, ExternalLink, Info, Wifi, Radio, ScanSearch, FlaskConical, Cpu, Printer, Plane, Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_KEYS = [
  { href: "/expenditure", key: "expenditure" as const, icon: BarChart3 },
  { href: "/scorecards", key: "scorecards" as const, icon: MapPin },
  { href: "/projects", key: "projects" as const, icon: Briefcase },
  { href: "/schemes", key: "schemes" as const, icon: Users },
  { href: "/grievances", key: "grievances" as const, icon: MessageSquare },
  { href: "/tenders", key: "tenders" as const, icon: FileSearch },
  { href: "/data-sources", key: "dataSources" as const, icon: Info },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navGov");
  const tc = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === "en" ? "ta" : "en" });
  };

  return (
    <header className="sticky top-0 z-50">

      <div className="bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-2">

            <div className="flex-shrink-0 w-12 h-12 relative">
              <Image
                src="/images/tn-emblem.svg"
                alt={t("emblemAlt")}
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-green-800 uppercase tracking-widest hidden sm:block">
                {t("govtOfTn")}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none tracking-tight">
                {t("financeDept")}
              </span>
              <span className="text-[10px] text-green-700 font-medium mt-0.5 hidden sm:block">
                {t("publicFinancialTransparency")}
              </span>
            </div>

            <div className="hidden md:block w-px h-10 bg-green-200 mx-2" />

            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t("platform")}</span>
              <span className="text-sm font-bold text-primary-700">
                TN<span className="text-primary-500">Vettri</span>
              </span>
              <span className="text-[10px] text-slate-400 font-tamil">{t("vettriTagline")}</span>
            </div>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={switchLocale}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {locale === "en" ? tc("languageTamil") : tc("languageEnglish")}
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                {t("trustNest")}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-green-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">

            <div className="hidden lg:flex items-center gap-0.5 h-full">
              {NAV_KEYS.map((link) => (
                <GovNavLink key={link.href} href={link.href} active={isActive(link.href)}>
                  <link.icon className="w-3.5 h-3.5" />
                  {t(link.key)}
                </GovNavLink>
              ))}
              <GovNavLink href="/wifi-posture" active={isActive("/wifi-posture")}>
                <Wifi className="w-3.5 h-3.5" />
                WiFi Posture
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-cyan-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                  New
                </span>
              </GovNavLink>
              <GovNavLink href="/mesh-chat" active={isActive("/mesh-chat")}>
                <Radio className="w-3.5 h-3.5" />
                Mesh Chat
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-emerald-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                  New
                </span>
              </GovNavLink>
              <GovNavLink href="/object-detect" active={isActive("/object-detect")}>
                <ScanSearch className="w-3.5 h-3.5" />
                Object Detect
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-violet-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                  New
                </span>
              </GovNavLink>
              <GovNavLink href="/chemverse" active={isActive("/chemverse")}>
                <FlaskConical className="w-3.5 h-3.5" />
                ChemVerse
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-cyan-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                  New
                </span>
              </GovNavLink>
              <GovNavLink href="/majestor" active={isActive("/majestor")}>
                <Cpu className="w-3.5 h-3.5" />
                Majestor
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-green-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                  New
                </span>
              </GovNavLink>
              <GovNavLink href="/print3d" active={isActive("/print3d")}>
                <Printer className="w-3.5 h-3.5" />
                Print3D
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-orange-400 text-slate-900 rounded uppercase tracking-wide leading-none">New</span>
              </GovNavLink>
              <GovNavLink href="/family-trip" active={isActive("/family-trip")}>
                <Plane className="w-3.5 h-3.5" />
                Family Trip
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-sky-400 text-slate-900 rounded uppercase tracking-wide leading-none">New</span>
              </GovNavLink>
              <GovNavLink href="/one-spot-bangles3" active={isActive("/one-spot-bangles3")}>
                <Gem className="w-3.5 h-3.5" />
                Bangles
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-amber-400 text-slate-900 rounded uppercase tracking-wide leading-none">New</span>
              </GovNavLink>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {session ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-white text-[11px] font-bold">
                      {session.user.image ? (
                        <Image src={session.user.image} alt="" width={24} height={24} className="object-cover" />
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
                          <p className="font-semibold text-sm text-slate-800 truncate">{session.user.name ?? tc("user")}</p>
                          <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                          <RoleBadge role={(session.user as { role?: string }).role ?? "CITIZEN"} />
                        </div>
                        <MenuLink href="/profile" icon={Settings} onClick={() => setUserMenuOpen(false)}>{t("myProfile")}</MenuLink>
                        {["OFFICER", "ADMIN"].includes((session.user as { role?: string }).role ?? "") && (
                          <MenuLink href="/admin" icon={LayoutDashboard} onClick={() => setUserMenuOpen(false)}>{t("commandCenter")}</MenuLink>
                        )}
                        {(session.user as { role?: string }).role === "ADMIN" && (
                          <MenuLink href="/admin/anomalies" icon={Shield} onClick={() => setUserMenuOpen(false)}>{t("anomalyQueue")}</MenuLink>
                        )}
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> {tc("signOut")}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    {tc("signIn")}
                  </Link>
                  <Link href="/grievances" className="text-xs font-semibold bg-white text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                    {t("fileGrievance")}
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={switchLocale}
                className="text-white/80 text-xs px-2 py-1 border border-white/30 rounded"
              >
                {locale === "en" ? tc("languageShortTa") : tc("languageShortEn")}
              </button>
              <button type="button" className="p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-green-900 border-t border-green-700 px-4 py-3 flex flex-col gap-0.5">
            {NAV_KEYS.map((link) => (
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
                {t(link.key)}
              </Link>
            ))}
            <Link
              href="/wifi-posture"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/wifi-posture")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Wifi className="w-4 h-4" />
              WiFi Posture
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-cyan-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/mesh-chat"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/mesh-chat")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Radio className="w-4 h-4" />
              Mesh Chat
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-emerald-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/chemverse"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/chemverse")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <FlaskConical className="w-4 h-4" />
              ChemVerse
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-cyan-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/majestor"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/majestor")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Cpu className="w-4 h-4" />
              Majestor
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-green-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/print3d"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/print3d")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Printer className="w-4 h-4" />
              Print3D
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-orange-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/family-trip"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/family-trip")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Plane className="w-4 h-4" />
              Family Trip
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-sky-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <Link
              href="/one-spot-bangles3"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors",
                isActive("/one-spot-bangles3")
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Gem className="w-4 h-4" />
              One Spot Bangles
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-amber-400 text-slate-900 rounded uppercase tracking-wide leading-none">
                New
              </span>
            </Link>
            <div className="border-t border-green-700 mt-2 pt-2 flex flex-col gap-1">
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-300 rounded-lg hover:bg-white/10">
                <Home className="w-4 h-4" /> {t("backToTrustNest")}
              </Link>
              {session ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-300 rounded-lg hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" /> {tc("signOut")}
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 rounded-lg hover:bg-white/10">
                  {tc("signIn")}
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

function MenuLink({ href, icon: Icon, children, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; onClick?: () => void }) {
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
