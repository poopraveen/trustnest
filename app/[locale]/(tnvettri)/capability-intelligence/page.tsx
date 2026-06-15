import type { Metadata } from "next";
import {
  Brain, Target, TrendingUp, Users, Zap, BarChart3, BookOpen,
  Award, Cpu, Globe, ArrowUpRight, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import GovHeroBackground from "@/components/GovHeroBackground";

export const metadata: Metadata = {
  title: "Capability Intelligence | TN Vettri",
  description: "Tamil Nadu government workforce capability intelligence — skill gaps, training outcomes, department readiness, and AI-driven talent insights.",
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEPT_CAPABILITIES = [
  { dept: "Finance", readiness: 84, trained: 1240, gap: 16, trend: "+5%", status: "on-track" },
  { dept: "Health",  readiness: 72, trained: 3800, gap: 28, trend: "+3%", status: "at-risk"  },
  { dept: "PWD",     readiness: 61, trained: 920,  gap: 39, trend: "+1%", status: "delayed"  },
  { dept: "Revenue", readiness: 90, trained: 5600, gap: 10, trend: "+8%", status: "on-track" },
  { dept: "Education",readiness:78, trained:12400, gap: 22, trend: "+6%", status: "on-track" },
  { dept: "Agriculture",readiness:55,trained:4100, gap: 45, trend: "0%",  status: "delayed"  },
  { dept: "IT Dept", readiness: 95, trained: 680,  gap:  5, trend:"+12%", status: "on-track" },
  { dept: "Police",  readiness: 70, trained: 8900, gap: 30, trend: "+2%", status: "at-risk"  },
];

const SKILL_AREAS = [
  { skill: "Digital Literacy",        trained: 24600, target: 30000, pct: 82, color: "#22c55e" },
  { skill: "Data Analysis",           trained: 8400,  target: 15000, pct: 56, color: "#f97316" },
  { skill: "Project Management",      trained: 11200, target: 18000, pct: 62, color: "#3b82f6" },
  { skill: "AI & Automation",         trained: 3100,  target: 12000, pct: 26, color: "#a855f7" },
  { skill: "Financial Governance",    trained: 17800, target: 20000, pct: 89, color: "#22c55e" },
  { skill: "Citizen Service Delivery",trained: 29000, target: 32000, pct: 91, color: "#22c55e" },
  { skill: "Cybersecurity",           trained: 4200,  target: 10000, pct: 42, color: "#ef4444" },
];

const TRAINING_PROGRAMS = [
  { name: "TANSI Digital Upskill 2024", participants: 4200, completed: 3780, status: "Active",   dept: "All Depts" },
  { name: "Revenue Officer Masterclass", participants: 1100, completed: 1100, status: "Complete", dept: "Revenue"   },
  { name: "AI for Governance",           participants: 600,  completed: 210,  status: "Active",   dept: "IT & Admin" },
  { name: "Health Data Analytics",       participants: 2800, completed: 1900, status: "Active",   dept: "Health"     },
  { name: "Field Officer Leadership",    participants: 3400, completed: 3400, status: "Complete", dept: "PWD / Revenue" },
  { name: "Cybersecurity Essentials",    participants: 900,  completed: 320,  status: "Active",   dept: "IT Dept"    },
];

const KPI_CARDS = [
  { label: "Total Officers Trained",   value: "1.24L", sub: "FY 2024–25",            icon: Users,     color: "#22c55e" },
  { label: "Avg Capability Score",     value: "74%",   sub: "↑ 6 pts vs last year",  icon: Award,     color: "#3b82f6" },
  { label: "Active Programs",          value: "18",    sub: "across 12 departments",  icon: BookOpen,  color: "#a855f7" },
  { label: "Skill Gap Index",          value: "26%",   sub: "↓ 4 pts improvement",   icon: Target,    color: "#f97316" },
  { label: "AI-Ready Officers",        value: "3,100", sub: "target: 12,000 by 2026", icon: Cpu,      color: "#ec4899" },
  { label: "Training Hours Delivered", value: "8.6L",  sub: "FY 2024–25 total",       icon: Clock,    color: "#14b8a6" },
];

const statusStyle = {
  "on-track": { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "On Track" },
  "at-risk":  { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500",   label: "At Risk"  },
  "delayed":  { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500",     label: "Behind"   },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CapabilityIntelligencePage() {
  return (
    <div className="min-h-screen bg-surface">
      <GovHeroBackground />

      {/* Hero */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">Capability Intelligence</h1>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-slate-900 rounded uppercase tracking-wide">Beta</span>
              </div>
              <p className="text-green-200 text-sm mt-1 max-w-2xl">
                AI-powered workforce intelligence for Tamil Nadu government — skill mapping, training outcomes, department readiness scores, and gap analysis across all cadres.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {KPI_CARDS.map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: k.color }} />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-800">{k.value}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-tight">{k.label}</p>
                <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Department readiness + Skill areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Department Readiness */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-700" />
                <h2 className="text-sm font-bold text-slate-800">Department Readiness Index</h2>
              </div>
              <span className="text-xs text-slate-400">FY 2024–25</span>
            </div>
            <div className="divide-y divide-slate-50">
              {DEPT_CAPABILITIES.map(d => {
                const s = statusStyle[d.status as keyof typeof statusStyle];
                return (
                  <div key={d.dept} className="px-6 py-3 flex items-center gap-4">
                    <p className="text-sm font-semibold text-slate-700 w-24 flex-shrink-0">{d.dept}</p>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-500">{d.trained.toLocaleString("en-IN")} trained</span>
                        <span className="text-xs font-bold text-slate-700">{d.readiness}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${d.readiness}%`, background: d.readiness>=80?"#22c55e":d.readiness>=65?"#f97316":"#ef4444" }}/>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                    <span className="text-xs text-emerald-600 font-semibold flex-shrink-0">{d.trend}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Areas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-700" />
                <h2 className="text-sm font-bold text-slate-800">Skill Coverage</h2>
              </div>
              <span className="text-xs text-slate-400">vs Target</span>
            </div>
            <div className="divide-y divide-slate-50">
              {SKILL_AREAS.map(s => (
                <div key={s.skill} className="px-6 py-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{s.skill}</span>
                    <span className="text-xs font-bold text-slate-600">{s.trained.toLocaleString("en-IN")} / {s.target.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${s.pct}%`, background:s.color }}/>
                    </div>
                    <span className="text-xs font-black w-8 text-right" style={{ color:s.color }}>{s.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Programs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-700" />
              <h2 className="text-sm font-bold text-slate-800">Active & Recent Training Programs</h2>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold px-2.5 py-1 rounded-full bg-emerald-50">
                <CheckCircle2 className="w-3 h-3"/>Complete
              </span>
              <span className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold px-2.5 py-1 rounded-full bg-blue-50">
                <Clock className="w-3 h-3"/>Active
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Enrolled</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Completed</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Progress</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TRAINING_PROGRAMS.map(p => {
                  const pct = Math.round((p.completed / p.participants) * 100);
                  return (
                    <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.dept}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{p.participants.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{p.completed.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${pct}%`, background:pct===100?"#22c55e":"#3b82f6" }}/>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.status==="Complete"?"bg-emerald-100 text-emerald-700":"bg-blue-100 text-blue-700"}`}>
                          {p.status==="Complete"?<CheckCircle2 className="w-3 h-3"/>:<Clock className="w-3 h-3"/>}{p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: AlertCircle, color:"#f97316", bg:"#fff7ed", border:"#fed7aa",
              title:"Critical Gap — Agriculture", body:"Only 55% readiness. 2,800 field officers need Digital Literacy & Data Analysis training before Kharif 2025." },
            { icon: TrendingUp, color:"#22c55e", bg:"#f0fdf4", border:"#bbf7d0",
              title:"IT Dept Leading the Way", body:"95% capability score — highest across all departments. Recommended as peer-mentors for AI for Governance rollout." },
            { icon: Globe, color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe",
              title:"AI-Ready Push 2026", body:"3,100 officers AI-ready vs 12,000 target. Recommend scaling 'AI for Governance' program to 8 more departments by Q3." },
          ].map(ins => {
            const Icon = ins.icon;
            return (
              <div key={ins.title} className="rounded-2xl p-5 border" style={{ background:ins.bg, borderColor:ins.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color:ins.color }}/>
                  <p className="text-sm font-bold" style={{ color:ins.color }}>{ins.title}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.body}</p>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Brain className="w-3.5 h-3.5" />
          Data sourced from TANSI Training MIS, HR-MS and departmental self-assessment returns. Updated monthly.
          <a href="#" className="flex items-center gap-1 text-green-700 font-semibold ml-auto hover:underline">
            Download Report <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
