"use client";

import { useState } from "react";
import { Trophy, Star, BookOpen, FlaskConical, Calculator, ChevronRight, Zap, Target, TrendingUp } from "lucide-react";

interface Stat { label: string; value: string; icon: typeof Trophy; color: string; }
interface Achievement { id: string; title: string; desc: string; unlocked: boolean; icon: string; }
interface RecentActivity { type: string; text: string; time: string; color: string; }

const QUIZ_QUESTIONS = [
  { q: "What is the atomic number of Carbon?", options: ["4","5","6","7"], answer: 2 },
  { q: "Which element has the symbol 'Au'?", options: ["Silver","Aluminum","Gold","Argon"], answer: 2 },
  { q: "What is the most electronegative element?", options: ["Oxygen","Chlorine","Fluorine","Nitrogen"], answer: 2 },
  { q: "How many electrons does a neutral Sodium atom have?", options: ["10","11","12","13"], answer: 1 },
  { q: "What is the chemical formula for table salt?", options: ["NaCO3","KCl","NaCl","CaCl2"], answer: 2 },
  { q: "Which noble gas is used in advertising signs?", options: ["Helium","Argon","Neon","Krypton"], answer: 2 },
  { q: "What is the lightest metal?", options: ["Beryllium","Lithium","Sodium","Aluminum"], answer: 1 },
  { q: "Which element has the highest melting point?", options: ["Iron","Tungsten","Osmium","Carbon"], answer: 1 },
];

export default function ChemDashboard() {
  const [score, setScore] = useState(() => parseInt(localStorage?.getItem("chemverse_score") ?? "0"));
  const [streak, setStreak] = useState(() => parseInt(localStorage?.getItem("chemverse_streak") ?? "0"));
  const [quizIdx, setQuizIdx] = useState(() => Math.floor(Math.random() * QUIZ_QUESTIONS.length));
  const [answered, setAnswered] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(() => {
    try { return JSON.parse(localStorage?.getItem("chemverse_activity") ?? "[]"); } catch { return []; }
  });

  const q = QUIZ_QUESTIONS[quizIdx];

  function handleAnswer(idx: number) {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === q.answer;
    setQuizResult(correct ? "correct" : "wrong");
    const newScore = correct ? score + 10 : score;
    const newStreak = correct ? streak + 1 : 0;
    setScore(newScore);
    setStreak(newStreak);
    localStorage?.setItem("chemverse_score", String(newScore));
    localStorage?.setItem("chemverse_streak", String(newStreak));
    const act: RecentActivity = {
      type: correct ? "correct" : "wrong",
      text: correct ? `+10 pts: "${q.q.slice(0,40)}…"` : `Missed: "${q.q.slice(0,40)}…"`,
      time: "just now",
      color: correct ? "text-emerald-400" : "text-red-400",
    };
    const updated = [act, ...recentActivity].slice(0, 6);
    setRecentActivity(updated);
    localStorage?.setItem("chemverse_activity", JSON.stringify(updated));
  }

  function nextQuestion() {
    setAnswered(null);
    setQuizResult(null);
    setQuizIdx(i => (i + 1) % QUIZ_QUESTIONS.length);
  }

  const level = Math.floor(score / 50) + 1;
  const progressToNext = score % 50;

  const ACHIEVEMENTS: Achievement[] = [
    { id: "first", title: "First Answer", desc: "Answer your first question", icon: "🎯", unlocked: score > 0 },
    { id: "streak3", title: "On Fire", desc: "Get 3 correct in a row", icon: "🔥", unlocked: streak >= 3 },
    { id: "score50", title: "Quick Learner", desc: "Reach 50 points", icon: "⚡", unlocked: score >= 50 },
    { id: "score100", title: "Chemistry Star", desc: "Reach 100 points", icon: "⭐", unlocked: score >= 100 },
    { id: "score200", title: "Molecule Master", desc: "Reach 200 points", icon: "🏆", unlocked: score >= 200 },
    { id: "streak5", title: "Unstoppable", desc: "5 correct in a row", icon: "🚀", unlocked: streak >= 5 },
  ];

  const STATS: Stat[] = [
    { label: "Total Score", value: `${score} pts`, icon: Trophy, color: "text-amber-400" },
    { label: "Current Streak", value: `${streak} 🔥`, icon: Zap, color: "text-orange-400" },
    { label: "Level", value: `Level ${level}`, icon: TrendingUp, color: "text-violet-400" },
    { label: "Questions Done", value: `${recentActivity.length}`, icon: Target, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-2">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Level progress */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">Level {level}</span>
          <span className="text-xs text-slate-400">{progressToNext}/50 pts to Level {level + 1}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700"
            style={{ width: `${(progressToNext / 50) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quick Quiz */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Quick Quiz</span>
          </div>
          <p className="text-sm text-slate-200 mb-4 leading-relaxed">{q.q}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, i) => {
              let cls = "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ";
              if (answered === null) {
                cls += "bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white cursor-pointer";
              } else if (i === q.answer) {
                cls += "bg-emerald-500/20 border-emerald-500 text-emerald-300";
              } else if (i === answered) {
                cls += "bg-red-500/20 border-red-500 text-red-300";
              } else {
                cls += "bg-slate-900 border-slate-700/50 text-slate-500 cursor-default";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {quizResult && (
            <div className={`mt-3 flex items-center justify-between ${quizResult === "correct" ? "text-emerald-400" : "text-red-400"}`}>
              <span className="text-sm font-bold">
                {quizResult === "correct" ? "✓ Correct! +10 pts" : `✗ Answer: ${q.options[q.answer]}`}
              </span>
              <button onClick={nextQuestion}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Achievements</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.map(a => (
              <div key={a.id}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                  a.unlocked
                    ? "bg-amber-500/10 border-amber-500/40"
                    : "bg-slate-900/50 border-slate-700/50 opacity-40 grayscale"
                }`}>
                <span className="text-xl">{a.icon}</span>
                <span className="text-[10px] font-bold text-white leading-tight">{a.title}</span>
                <span className="text-[9px] text-slate-400 leading-tight">{a.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore tools */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Explore Tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/chemverse/periodic-table", icon: "⚗️", title: "Periodic Table", desc: "All 118 elements with Bohr models", color: "border-cyan-500/40 hover:border-cyan-400" },
            { href: "/chemverse/tools", icon: "🧮", title: "Chem Tools", desc: "Molar mass & equation balancer", color: "border-emerald-500/40 hover:border-emerald-400" },
            { href: "/chemverse/tutor", icon: "🤖", title: "AI Tutor", desc: "Ask anything about chemistry", color: "border-violet-500/40 hover:border-violet-400" },
          ].map(tool => (
            <a key={tool.href} href={tool.href}
              className={`flex items-start gap-3 p-4 rounded-xl bg-slate-900 border ${tool.color} transition-all group`}>
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-white">{tool.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tool.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 ml-auto mt-0.5 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-white">Recent Activity</span>
          </div>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-700/40 last:border-0">
                <span className={`text-xs font-medium ${a.color} flex-1 truncate`}>{a.text}</span>
                <span className="text-xs text-slate-600 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
