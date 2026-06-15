import type { Metadata } from "next";
import { Link } from "@/navigation";
import {
  ArrowRight, BarChart3, MapPin, Briefcase, Users,
  MessageSquare, FileSearch, Shield, TrendingUp,
  ChevronRight, ExternalLink, Clock,
  Wifi, Radio, ScanSearch, FlaskConical, Cpu, Printer, Plane, Gem, Brain, Gamepad2,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import KpiTile, { type SLAStatus } from "@/components/KpiTile";
import GovHeroBackground from "@/components/GovHeroBackground";
import { brand, pageTitleWithTagline } from "@/lib/brand";
import { BUDGET, MACRO, SCHEMES, TENDERS, DEPT_BUDGETS } from "@/lib/tn-official-data";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale ?? "en";
  const t = await getTranslations({ locale, namespace: "tnvettri" });
  const title =
    locale === "ta"
      ? `${brand.name} – ${brand.taglineTamil}`
      : pageTitleWithTagline();
  return {
    title,
    description: t("metaDescription"),
  };
}

const magalir = SCHEMES.find((s) => s.id === "magalir-urimai")!;
const cmBreak = SCHEMES.find((s) => s.id === "cm-breakfast")!;
const mtm = SCHEMES.find((s) => s.id === "makkalai-thedi")!;

const DEPT_LEADERBOARD = DEPT_BUDGETS.slice(0, 5).map((d) => ({
  name: d.dept,
  allocation: d.total,
  spent: d.spent,
  pct: d.utilPct,
}));

function slaBadgeText(t: (key: string) => string, status: SLAStatus) {
  if (status === "on-target") return t("kpiStatusOnTarget");
  if (status === "vulnerable") return t("kpiStatusAtRisk");
  if (status === "jeopardy") return t("kpiStatusJeopardy");
  return "";
}

export default async function TnVettriHomePage() {
  const locale = await getLocale();
  const t = await getTranslations("tnvettri");
  const isEn = locale === "en";

  const updatedP = t("kpiUpdated");
  const auditL = t("kpiAudit");
  const dataL = t("kpiData");

  const kpis = [
    {
      label: t("kpiTotalBudget"),
      value: `₹${(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr`,
      target: `₹${(BUDGET.totalBudget_crore / 1000).toFixed(0)}K Cr`,
      progress: BUDGET.utilisationPct,
      delta: 12,
      deltaLabel: t("kpiDeltaVs2423"),
      status: "on-target" as const,
      source: BUDGET.source,
      lastUpdated: BUDGET.lastUpdated,
      progressLineText: t("kpiProgressPercent", { pct: BUDGET.utilisationPct }),
    },
    {
      label: t("kpiCapitalExp"),
      value: `₹${(BUDGET.capitalOutlay_crore / 1000).toFixed(1)}K Cr`,
      target: "₹1,00,000 Cr",
      progress: Math.round((BUDGET.capitalOutlay_crore / 100000) * 100),
      delta: 12.1,
      deltaLabel: t("kpiDeltaYoy"),
      status: "vulnerable" as const,
      source: BUDGET.source,
      lastUpdated: BUDGET.lastUpdated,
      progressLineText: t("kpiProgressPercent", {
        pct: Math.round((BUDGET.capitalOutlay_crore / 100000) * 100),
      }),
    },
    {
      label: t("kpiGsdp"),
      value: `₹${(MACRO.gsdp_crore / 100000).toFixed(2)} L Cr`,
      delta: MACRO.gsdp_growth_real,
      deltaLabel: t("kpiDeltaRealGrowth"),
      status: "on-target" as const,
      source: MACRO.source,
      lastUpdated: "Mar 2024",
    },
    {
      label: t("kpiFiscalDeficit"),
      value: t("kpiFiscalValue"),
      target: t("kpiFiscalTarget"),
      status: "vulnerable" as const,
      source: "prsindia.org",
      lastUpdated: "Feb 2024",
    },
    {
      label: t("kpiMagalir"),
      value: t("kpiValueMagalir", {
        n: (magalir.beneficiaries / 10000000).toFixed(2),
      }),
      target: `${(magalir.target / 10000000).toFixed(1)} Cr`,
      progress: Math.round((magalir.beneficiaries / magalir.target) * 100),
      delta: 16.1,
      deltaLabel: t("kpiDeltaVsPhase1"),
      status: "on-target" as const,
      source: magalir.source,
      lastUpdated: magalir.launched,
      progressLineText: t("kpiProgressPercent", {
        pct: Math.round((magalir.beneficiaries / magalir.target) * 100),
      }),
    },
    {
      label: t("kpiCmBreakfast"),
      value: t("kpiValueCmBreakfast", {
        n: (cmBreak.beneficiaries / 100000).toFixed(2),
      }),
      target: `${(cmBreak.target / 100000).toFixed(0)} Lakh`,
      progress: Math.round((cmBreak.beneficiaries / cmBreak.target) * 100),
      delta: 30,
      deltaLabel: t("kpiDeltaAttendance"),
      status: "on-target" as const,
      source: cmBreak.source,
      lastUpdated: cmBreak.launched,
      progressLineText: t("kpiProgressPercent", {
        pct: Math.round((cmBreak.beneficiaries / cmBreak.target) * 100),
      }),
    },
    {
      label: t("kpiMtm"),
      value: t("kpiValueMtm", { n: (mtm.beneficiaries / 10000000).toFixed(2) }),
      target: `${(mtm.target / 10000000).toFixed(0)} Cr`,
      progress: Math.round((mtm.beneficiaries / mtm.target) * 100),
      status: "on-target" as const,
      source: mtm.source,
      lastUpdated: mtm.launched,
      progressLineText: t("kpiProgressPercent", {
        pct: Math.round((mtm.beneficiaries / mtm.target) * 100),
      }),
    },
    {
      label: t("kpiEproc"),
      value: `₹${(TENDERS.totalValueCrore / 1000).toFixed(0)}K Cr`,
      delta: undefined,
      status: "neutral" as const,
      source: TENDERS.source,
      lastUpdated: TENDERS.lastUpdated,
    },
  ];

  const quickLinks = [
    { href: "/expenditure", icon: BarChart3, label: "quickExpenditure", labelTa: "quickExpenditureTa", color: "bg-blue-100 text-blue-700" },
    { href: "/scorecards", icon: MapPin, label: "quickScorecards", labelTa: "quickScorecardsTa", color: "bg-emerald-100 text-emerald-700" },
    { href: "/projects", icon: Briefcase, label: "quickProjects", labelTa: "quickProjectsTa", color: "bg-violet-100 text-violet-700" },
    { href: "/schemes", icon: Users, label: "quickSchemes", labelTa: "quickSchemesTa", color: "bg-amber-100 text-amber-700" },
    { href: "/grievances", icon: MessageSquare, label: "quickGrievances", labelTa: "quickGrievancesTa", color: "bg-rose-100 text-rose-700" },
    { href: "/tenders", icon: FileSearch, label: "quickTenders", labelTa: "quickTendersTa", color: "bg-cyan-100 text-cyan-700" },
  ] as const;

  const trustStats = [
    { value: "43", label: t("trustDepts") },
    { value: "38", label: t("trustDistricts") },
    { value: "7.53L+ Cr", label: t("trustTenders") },
    { value: "1.31 Cr", label: t("trustWomen") },
  ];

  const grievanceCats = [
    { slug: "Roads", label: t("griefRoads"), count: t("griefRoadsOpen"), color: "bg-red-50 border-red-200 text-red-700" },
    { slug: "Water Supply", label: t("griefWater"), count: t("griefWaterOpen"), color: "bg-blue-50 border-blue-200 text-blue-700" },
    { slug: "Electricity", label: t("griefElectric"), count: t("griefElectricOpen"), color: "bg-amber-50 border-amber-200 text-amber-700" },
    { slug: "Scheme Benefit", label: t("griefScheme"), count: t("griefSchemeOpen"), color: "bg-violet-50 border-violet-200 text-violet-700" },
  ];

  const pillars = [
    { icon: Shield, title: t("pillar1Title"), desc: t("pillar1Desc") },
    { icon: TrendingUp, title: t("pillar2Title"), desc: t("pillar2Desc") },
    { icon: FileSearch, title: t("pillar3Title"), desc: t("pillar3Desc") },
  ];

  return (
    <div className="min-h-screen bg-surface">

      <section className="relative overflow-hidden">
        <GovHeroBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Shield className="w-4 h-4 text-yellow-300" />
              <span>{t("heroPill")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              {t("heroTitle1")}
              <br />
              <span className="text-yellow-300">{t("heroTitle2")}</span>
            </h1>
            <p className="text-white/80 font-tamil text-lg mb-1">{t("heroTaglineTamil")}</p>
            <p className="text-green-100 text-base max-w-2xl mx-auto mt-3">
              {t("heroDescription")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-8 text-center">
            {trustStats.map((s) => (
              <div key={s.label} className="text-white">
                <div className="text-2xl font-bold font-data">{s.value}</div>
                <div className="text-green-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/scorecards"
              className="flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors shadow-lg text-base"
            >
              {t("viewLocalityCta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="card p-4 text-center hover:border-primary-200 border border-transparent transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${q.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                  {t(q.label)}
                </p>
                {isEn && (
                  <p className="text-xs text-slate-400 mt-0.5 font-tamil">{t(q.labelTa)}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-green-50 to-emerald-50/40">
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">{t("snapshotTitle")}</h2>
              <p className="section-subtitle">{t("snapshotSubtitle")}</p>
            </div>
            <Link href="/expenditure" className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900 transition-colors">
              {t("snapshotFullExp")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <KpiTile
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                target={kpi.target}
                progress={kpi.progress}
                delta={kpi.delta}
                deltaLabel={kpi.deltaLabel}
                status={kpi.status}
                source={kpi.source}
                lastUpdated={kpi.lastUpdated}
                auditHref={kpi.source ? `/audit?source=${encodeURIComponent(kpi.source)}` : undefined}
                downloadHref="/data/tn_real_data"
                badgeStatusText={kpi.status !== "neutral" ? slaBadgeText(t, kpi.status) : undefined}
                progressLineText={kpi.progressLineText}
                updatedPrefix={updatedP}
                auditLinkText={auditL}
                dataLinkText={dataL}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-r from-teal-50 via-white to-teal-50/60">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">{t("deptTitle")}</h2>
              <p className="section-subtitle">{t("deptSubtitle")}</p>
            </div>
            <Link href="/expenditure" className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900">
              {t("deptAllLink")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">{t("tableRank")}</th>
                  <th>{t("tableDepartment")}</th>
                  <th className="num">{t("tableAllocation")}</th>
                  <th className="num">{t("tableSpent")}</th>
                  <th>{t("tableUtilisation")}</th>
                </tr>
              </thead>
              <tbody>
                {DEPT_LEADERBOARD.map((d, i) => (
                  <tr key={d.name}>
                    <td className="font-bold text-slate-400">{i + 1}</td>
                    <td className="font-medium text-slate-800">{d.name}</td>
                    <td className="num">{d.allocation.toLocaleString(locale === "ta" ? "ta-IN" : "en-IN")}</td>
                    <td className="num">{d.spent.toLocaleString(locale === "ta" ? "ta-IN" : "en-IN")}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-24">
                          <div
                            className={`h-full rounded-full ${d.pct >= 90 ? "bg-success-600" : d.pct >= 80 ? "bg-warning-600" : "bg-danger-600"}`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 tabular-nums">{d.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="trust-strip">
            <span>📊 {t("trustStripBudget")}</span>
            <span>🕐 {t("trustStripDate")}</span>
            <Link href="/audit" className="flex items-center gap-0.5 hover:text-primary-600">
              <ExternalLink className="w-3 h-3" /> {t("auditTrace")}
            </Link>
          </p>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">{t("spotlightTitle")}</h3>
              <Link href="/scorecards" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                {t("spotlightFullMap")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-primary-50 rounded-xl flex items-center justify-center h-48 border-2 border-dashed border-primary-200">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-primary-300 mx-auto mb-2" />
                <p className="text-sm text-primary-600 font-medium">{t("spotlightMapTitle")}</p>
                <p className="text-xs text-primary-400 mt-1">{t("spotlightMapSub")}</p>
                <Link href="/scorecards" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                  {t("spotlightExplore")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Chennai", score: 82, rank: 3 },
                { label: "Coimbatore", score: 79, rank: 7 },
                { label: "Madurai", score: 74, rank: 12 },
              ].map((d) => (
                <Link key={d.label} href={`/scorecards?district=${d.label}`} className="bg-slate-50 rounded-lg p-3 hover:bg-primary-50 transition-colors text-center">
                  <p className="text-base font-bold text-slate-800">{d.score}</p>
                  <p className="text-xs text-slate-500">{d.label}</p>
                  <p className="text-xs text-slate-400">{t("spotlightRank", { rank: d.rank })}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-lg">{t("grievancePortalTitle")}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t("grievancePortalDesc")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {grievanceCats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/grievances?category=${encodeURIComponent(c.slug)}`}
                  className={`rounded-lg border p-3 hover:opacity-80 transition-opacity ${c.color}`}
                >
                  <p className="text-xs font-semibold">{c.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{c.count}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/grievances"
              className="btn-primary justify-center mt-auto"
            >
              <MessageSquare className="w-4 h-4" />
              {t("fileGrievanceCta")}
            </Link>
            <p className="trust-strip">
              <Clock className="w-3 h-3" />
              <span>{t("slaLine")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Platform Apps & Tools ─────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Platform Apps &amp; Tools</h2>
            <p className="text-sm text-slate-500 mt-1">All-in-one civic &amp; utility apps built on TrustNest</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { href:"/rummy-pro",        icon: Gamepad2,    label:"AI Rummy Pro",         badge:"New",   badgeColor:"bg-purple-500", desc:"Strategy assistant for Indian Rummy" },
              { href:"/family-trip",      icon: Plane,       label:"Family Trip",           badge:"New",   badgeColor:"bg-sky-500",    desc:"Shared expense tracker with Telegram" },
              { href:"/one-spot-bangles3",icon: Gem,         label:"One Spot Bangles",      badge:"New",   badgeColor:"bg-amber-500",  desc:"Jewellery store — Magdi Road, Bengaluru" },
              { href:"/capability-intelligence", icon: Brain, label:"Capability Intel",     badge:"Beta",  badgeColor:"bg-green-600",  desc:"Workforce skill gap dashboard" },
              { href:"/majestor",         icon: Cpu,         label:"Majestor",              badge:"",      badgeColor:"",              desc:"Electronics AI workshop" },
              { href:"/chemverse",        icon: FlaskConical,label:"ChemVerse",             badge:"",      badgeColor:"",              desc:"Interactive chemistry learning" },
              { href:"/print3d",          icon: Printer,     label:"Print3D",               badge:"",      badgeColor:"",              desc:"3D print quote & CAD designer" },
              { href:"/wifi-posture",     icon: Wifi,        label:"WiFi Posture",          badge:"",      badgeColor:"",              desc:"Network security audit" },
              { href:"/mesh-chat",        icon: Radio,       label:"Mesh Chat",             badge:"",      badgeColor:"",              desc:"P2P offline messaging" },
              { href:"/object-detect",    icon: ScanSearch,  label:"Object Detect",         badge:"",      badgeColor:"",              desc:"Real-time camera detection" },
            ].map(app => {
              const Icon = app.icon;
              return (
                <Link key={app.href} href={app.href}
                  className="group relative bg-white rounded-2xl border border-slate-100 p-4 hover:border-green-300 hover:shadow-md transition-all flex flex-col gap-3">
                  {app.badge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{app.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{app.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all mt-auto self-end" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-green-950 to-green-900 text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">{t("commitmentTitle")}</h2>
            <p className="text-green-200 text-sm">{t("commitmentSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-green-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-300" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-green-200 text-sm max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="https://tnbudget.tn.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> tnbudget.tn.gov.in
            </a>
            <a href="https://pfms.nic.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> pfms.nic.in
            </a>
            <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> pgportal.gov.in
            </a>
            <a href="https://tenders.tn.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> tenders.tn.gov.in
            </a>
            <a href="https://egramswaraj.gov.in" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-300 hover:text-white border border-green-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> egramswaraj.gov.in
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
