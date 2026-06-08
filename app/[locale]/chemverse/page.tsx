import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Atom, Calculator, Bot, LayoutDashboard, ArrowRight, Beaker } from "lucide-react";

export const metadata: Metadata = {
  title: "ChemVerse — Interactive Chemistry Learning Platform",
  description: "Master chemistry with an interactive periodic table, Bohr models, equation balancer, molar mass calculator, and AI tutor — all in your browser.",
};

const FEATURES = [
  {
    href: "/chemverse/periodic-table",
    icon: Atom,
    iconColor: "text-cyan-400",
    bg: "from-cyan-500/10 to-blue-500/10",
    border: "border-cyan-500/30",
    title: "Interactive Periodic Table",
    desc: "Explore all 118 elements with animated Bohr models, electron configurations, physical properties, and category filters.",
    badge: "118 Elements",
    badgeColor: "bg-cyan-500/20 text-cyan-300",
  },
  {
    href: "/chemverse/tools",
    icon: Calculator,
    iconColor: "text-emerald-400",
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/30",
    title: "Chemistry Tools",
    desc: "Calculate molar mass with element breakdowns and balance chemical equations using linear algebra — all offline.",
    badge: "2 Tools",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
  },
  {
    href: "/chemverse/tutor",
    icon: Bot,
    iconColor: "text-violet-400",
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/30",
    title: "AI Chemistry Tutor",
    desc: "Ask any chemistry question, get quizzed on topics, or predict reaction products — powered by GPT-4o mini with streaming responses.",
    badge: "AI Powered",
    badgeColor: "bg-violet-500/20 text-violet-300",
  },
  {
    href: "/chemverse/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-amber-400",
    bg: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/30",
    title: "Learning Dashboard",
    desc: "Track your progress with quick-fire quizzes, earn achievements, level up, and see your learning streak.",
    badge: "Gamified",
    badgeColor: "bg-amber-500/20 text-amber-300",
  },
];

const QUICK_FACTS = [
  { num: "118", label: "Elements" },
  { num: "11", label: "Categories" },
  { num: "∞", label: "Reactions" },
  { num: "3", label: "AI Modes" },
];

export default function ChemVersePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-slate-950 to-violet-950/50 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          {["H","He","C","N","O","Na","Fe","Au","U","Pt"].map((sym, i) => (
            <span key={sym} className="absolute text-slate-800 font-black select-none"
              style={{
                fontSize: `${1.5 + (i % 3) * 0.8}rem`,
                left: `${(i * 11) % 90}%`,
                top: `${(i * 17) % 80}%`,
                opacity: 0.4 + (i % 3) * 0.1,
              }}>
              {sym}
            </span>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-6">
            <Beaker className="w-3.5 h-3.5" />
            Interactive Chemistry Learning
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
            Chem<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Verse</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            The most interactive chemistry learning platform — explore all 118 elements, balance equations,
            calculate molar masses, and learn with an AI tutor. No download required.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link href="/chemverse/periodic-table"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors text-sm">
              <Atom className="w-4 h-4" /> Explore Periodic Table
            </Link>
            <Link href="/chemverse/tutor"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition-colors text-sm">
              <Bot className="w-4 h-4" /> Ask AI Tutor
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {QUICK_FACTS.map(f => (
              <div key={f.label} className="text-center">
                <p className="text-3xl font-black text-white">{f.num}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-white text-center mb-8">
          Everything you need to master chemistry
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href}
              className={`group relative flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br ${f.bg} border ${f.border} hover:scale-[1.01] transition-all duration-200`}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-slate-900/60 flex items-center justify-center ${f.iconColor}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold mt-auto ${f.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                Open <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 border border-slate-700/60 rounded-2xl p-8">
          <FlaskConical className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-xl font-black text-white mb-2">Ready to explore chemistry?</h3>
          <p className="text-slate-400 text-sm mb-5">Start with the interactive periodic table — click any element to see its Bohr model and full details.</p>
          <Link href="/chemverse/periodic-table"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-sm transition-all">
            <Atom className="w-4 h-4" /> Start Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
