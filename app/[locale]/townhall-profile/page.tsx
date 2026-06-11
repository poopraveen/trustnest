"use client";

import { useState, useRef, useCallback } from "react";
import {
  Edit3, Plus, X, Code2, Heart, User, Mail,
  Star, Zap, Award, ChevronRight, FileDown, Check, Loader2,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  title: string;
  team: string;
  yearsOfExp: number;
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  techAreas: string[];
  hobbies: string[];
  achievements: string[];
  funFact: string;
}

const DEFAULT: ProfileData = {
  name: "Praveen Kumar Yoganathan",
  title: "Technical Specialist — GenAI & FullStack",
  team: "Frontend Capability Unit",
  yearsOfExp: 14,
  email: "praveen.kumar@company.com",
  linkedin: "linkedin.com/in/praveenkumar",
  github: "github.com/praveenkumar",
  summary:
    "Results-driven GenAI Solutions Lead and FullStack Technologist with 14+ years of enterprise delivery experience across Banking, Insurance and IoT domains. I specialise in architecting end-to-end GenAI/AI solutions — LLM orchestration, LangChain, LlamaIndex, Agentic AI systems with multi-step reasoning, vector database integration, fine-tuning and multi-agent systems engineering.",
  techAreas: ["React", "TypeScript", "Next.js", "Node.js", "GenAI / LLM", "LangChain", "Azure OpenAI", "TailwindCSS", "Java / Spring Boot", "AWS"],
  hobbies: ["Open Source", "Hiking", "Reading"],
  achievements: [
    "Architected enterprise-grade GenAI pipeline (LangChain + GPT-4o) across Banking & Insurance",
    "Led FullStack delivery teams across 5+ cross-domain products (React, Next.js, Node.js)",
    "Built multi-agent AI system with vector DB integration reducing ops time by 60%",
  ],
  funFact: "I once live-debugged a GenAI hallucination issue during a CEO demo — caught it, explained it, and turned it into a product feature. 🤖",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TagChip({ label, onRemove, color = "#f97316" }: { label: string; onRemove?: () => void; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium select-none"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function TagInput({ tags, onChange, color, placeholder }: { tags: string[]; onChange: (t: string[]) => void; color?: string; placeholder?: string }) {
  const [val, setVal] = useState("");
  const add = () => { const t = val.trim(); if (t && !tags.includes(t)) onChange([...tags, t]); setVal(""); };
  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {tags.map(t => <TagChip key={t} label={t} color={color} onRemove={() => onChange(tags.filter(x => x !== t))} />)}
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        placeholder={placeholder ?? "Add…"} className="text-xs bg-transparent outline-none text-white placeholder-slate-500 min-w-[80px] flex-1" />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", rows }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; rows?: number }) {
  const base: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>{label}</label>
      {rows
        ? <textarea rows={rows} value={String(value)} onChange={e => onChange(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 text-white resize-none outline-none" style={base} />
        : <input type={type} value={String(value)} onChange={e => onChange(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none" style={base} />}
    </div>
  );
}

// ─── Card (used both for preview and PDF capture) ─────────────────────────────

function TownHallCard({ p, divRef, forPdf = false }: { p: ProfileData; divRef?: React.RefObject<HTMLDivElement>; forPdf?: boolean }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "PK";
  return (
    <div ref={divRef}
      style={{
        width: 794, background: "#0d1117",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "white", position: "relative", overflow: "hidden",
      }}>

      {/* top accent bar */}
      <div style={{ height: 5, background: "linear-gradient(90deg, #f97316, #ea580c, #dc2626)" }} />

      {/* hero */}
      <div style={{ padding: "36px 48px 28px", display: "flex", alignItems: "center", gap: 28, background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)", borderBottom: "1px solid rgba(249,115,22,0.2)" }}>
        {/* avatar circle */}
        <div style={{
          width: 92, height: 92, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 900, color: "white",
          border: "3px solid rgba(249,115,22,0.4)",
        }}>{initials}</div>

        {/* name + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", marginBottom: 6 }}>
            Town Hall · Frontend Capability Unit · 2025
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginBottom: 6, color: "#ffffff" }}>
            {p.name}
          </div>
          <div style={{ fontSize: 15, color: "#fb923c", fontWeight: 600, marginBottom: 3 }}>{p.title}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{p.team}</div>
        </div>

        {/* years badge */}
        <div style={{
          textAlign: "center", padding: "14px 20px", borderRadius: 14, flexShrink: 0,
          background: "rgba(249,115,22,0.12)", border: "2px solid rgba(249,115,22,0.35)",
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#f97316", lineHeight: 1 }}>{p.yearsOfExp}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 4, letterSpacing: 1.5, textTransform: "uppercase" }}>Yrs Exp</div>
        </div>
      </div>

      {/* two-column body */}
      <div style={{ padding: "28px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, background: "#0d1117" }}>

        {/* LEFT */}
        <div>
          <CardSection title="About Me" icon="👋">
            <p style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.8, margin: 0 }}>{p.summary}</p>
          </CardSection>

          {p.achievements.length > 0 && (
            <CardSection title="Key Achievements" icon="🏆">
              {p.achievements.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                  <span style={{ color: "#f97316", flexShrink: 0, marginTop: 1 }}>▸</span>
                  <span style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.55 }}>{a}</span>
                </div>
              ))}
            </CardSection>
          )}

          {p.funFact && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#818cf8", letterSpacing: 1.5, marginBottom: 5, textTransform: "uppercase" }}>⚡ Fun Fact</div>
              <p style={{ fontSize: 12, color: "#c7d2fe", lineHeight: 1.6, margin: 0 }}>{p.funFact}</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <CardSection title="Technical Strong Areas" icon="💻">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {p.techAreas.map(t => (
                <span key={t} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.25)" }}>{t}</span>
              ))}
            </div>
          </CardSection>

          <CardSection title="Hobbies & Interests" icon="🎯">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {p.hobbies.map(h => (
                <span key={h} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.22)" }}>{h}</span>
              ))}
            </div>
          </CardSection>

          <CardSection title="Connect With Me" icon="🔗">
            {p.email    && <ContactRow icon="✉" label={p.email} />}
            {p.linkedin && <ContactRow icon="in" label={p.linkedin} color="#38bdf8" />}
            {p.github   && <ContactRow icon="⌥" label={p.github} />}
          </CardSection>
        </div>
      </div>

      {/* footer */}
      <div style={{ margin: "0 48px 28px", padding: "12px 18px", borderRadius: 8, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>Frontend Capability Unit — Town Hall 2025</span>
        <span style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>#FrontendCapabilityUnit</span>
      </div>

      {/* bottom accent bar */}
      <div style={{ height: 5, background: "linear-gradient(90deg, #f97316, #ea580c, #dc2626)" }} />
    </div>
  );
}

function CardSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", letterSpacing: 0.3 }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(249,115,22,0.18)" }} />
      </div>
      {children}
    </div>
  );
}

function ContactRow({ icon, label, color = "#64748b" }: { icon: string; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
      <span style={{ width: 24, height: 24, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.07)", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
    </div>
  );
}

// ─── Sidebar section style ─────────────────────────────────────────────────────

const sideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: "14px 16px",
  marginBottom: 10,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TownHallProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [newAch, setNewAch] = useState("");

  // Ref for the HIDDEN full-size card (used for PDF capture — no transform applied)
  const pdfCardRef = useRef<HTMLDivElement>(null!);

  const set = useCallback(<K extends keyof ProfileData>(key: K, val: ProfileData[K]) => {
    setProfile(p => ({ ...p, [key]: val }));
  }, []);

  const downloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const el = pdfCardRef.current;
      if (!el) return;

      // Capture the hidden full-size card (no parent transform interference)
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0d1117",
        logging: false,
        windowWidth: 794,
        width: 794,
      });

      // A4: 210mm × 297mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();   // 210
      const pageH = pdf.internal.pageSize.getHeight();  // 297
      const imgH = (canvas.height / canvas.width) * pageW;

      if (imgH <= pageH) {
        // fits on one page — vertically centre it
        const topOffset = (pageH - imgH) / 2;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, topOffset, pageW, imgH);
      } else {
        // taller than A4 — scale to fit height
        const scaledW = (pageH / imgH) * pageW;
        const leftOffset = (pageW - scaledW) / 2;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", leftOffset, 0, scaledW, pageH);
      }

      pdf.save(`${profile.name.replace(/\s+/g, "_")}_TownHall_2025.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#060912", color: "white" }}>

      {/* ── Hidden full-size card for PDF capture (off-screen, no transform) ── */}
      <div style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }} aria-hidden="true">
        <TownHallCard p={profile} divRef={pdfCardRef} forPdf />
      </div>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(6,9,18,0.96)", borderBottom: "1px solid rgba(249,115,22,0.15)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f97316" }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Town Hall Profile</p>
            <p className="text-xs" style={{ color: "#64748b" }}>Frontend Capability Unit · 2025</p>
          </div>
        </div>
        <button onClick={downloadPDF} disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-all"
          style={{ background: downloaded ? "#22c55e" : "#f97316", color: "white" }}>
          {downloading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Generating PDF…</>
            : downloaded
            ? <><Check className="w-4 h-4" />Downloaded!</>
            : <><FileDown className="w-4 h-4" />Download PDF</>}
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>

        {/* Left: edit panel */}
        <div style={{ width: 300, flexShrink: 0, overflowY: "auto", padding: 16, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="w-4 h-4" style={{ color: "#f97316" }} />
            <p className="text-sm font-bold text-white">Edit Profile</p>
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><User className="w-3 h-3 inline mr-1" />Identity</p>
            <Field label="Full Name"            value={profile.name}       onChange={v => set("name", v)} />
            <Field label="Job Title"            value={profile.title}      onChange={v => set("title", v)} />
            <Field label="Team / Unit"          value={profile.team}       onChange={v => set("team", v)} />
            <Field label="Years of Experience"  value={profile.yearsOfExp} type="number" onChange={v => set("yearsOfExp", parseInt(v) || 0)} />
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Mail className="w-3 h-3 inline mr-1" />Contact</p>
            <Field label="Email"    value={profile.email}    onChange={v => set("email", v)} />
            <Field label="LinkedIn" value={profile.linkedin} onChange={v => set("linkedin", v)} />
            <Field label="GitHub"   value={profile.github}   onChange={v => set("github", v)} />
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Star className="w-3 h-3 inline mr-1" />About Me</p>
            <Field label="Bio / Summary" value={profile.summary} onChange={v => set("summary", v)} rows={4} />
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Code2 className="w-3 h-3 inline mr-1" />Technical Areas</p>
            <p className="text-xs mb-2" style={{ color: "#64748b" }}>Enter or , to add</p>
            <TagInput tags={profile.techAreas} onChange={v => set("techAreas", v)} color="#f97316" placeholder="React, LLM…" />
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Heart className="w-3 h-3 inline mr-1" />Hobbies</p>
            <TagInput tags={profile.hobbies} onChange={v => set("hobbies", v)} color="#22c55e" placeholder="Hiking, Chess…" />
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Award className="w-3 h-3 inline mr-1" />Key Achievements</p>
            <div className="space-y-2 mb-2">
              {profile.achievements.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "#f97316" }} />
                  <span className="text-xs flex-1" style={{ color: "#94a3b8" }}>{a}</span>
                  <button onClick={() => set("achievements", profile.achievements.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3" style={{ color: "#64748b" }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={newAch} onChange={e => setNewAch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newAch.trim()) { set("achievements", [...profile.achievements, newAch.trim()]); setNewAch(""); } }}
                placeholder="Add achievement…" className="flex-1 text-xs rounded-lg px-2.5 py-2 text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <button onClick={() => { if (newAch.trim()) { set("achievements", [...profile.achievements, newAch.trim()]); setNewAch(""); } }}
                className="px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div style={sideCard}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}><Zap className="w-3 h-3 inline mr-1" />Fun Fact</p>
            <Field label="One memorable thing about you" value={profile.funFact} onChange={v => set("funFact", v)} rows={2} />
          </div>
        </div>

        {/* Right: live preview */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 32px", background: "#04060e" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-white">Live Preview</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Matches the downloaded PDF exactly</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Live
            </div>
          </div>

          {/*
            The preview div is overflow-hidden + fixed width so the card clips
            visually. We use CSS zoom (not transform) so layout doesn't collapse
            and html2canvas doesn't see any distortion on the hidden card.
          */}
          <div style={{ overflowX: "auto", paddingBottom: 32 }}>
            <div style={{ zoom: 0.78, width: 794, transformOrigin: "top left" }}>
              {/* Preview-only card — no ref, no PDF capture */}
              <TownHallCard p={profile} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
