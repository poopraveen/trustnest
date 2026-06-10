"use client";

import { useState, useRef, useCallback } from "react";
import {
  Edit3, Download, Plus, X, Briefcase, Code2, Heart,
  User, Mail, Linkedin, Star, Zap, Award, ChevronRight,
  Github, Globe, FileDown, Check, Loader2,
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

// ─── default profile ──────────────────────────────────────────────────────────

const DEFAULT: ProfileData = {
  name: "Your Name",
  title: "Senior Frontend Engineer",
  team: "Frontend Capability Unit",
  yearsOfExp: 5,
  email: "you@company.com",
  linkedin: "linkedin.com/in/yourprofile",
  github: "github.com/yourhandle",
  summary:
    "Passionate frontend engineer who loves crafting performant, pixel-perfect user interfaces. I thrive at the intersection of design and engineering, turning complex ideas into delightful digital experiences.",
  techAreas: ["React", "TypeScript", "Next.js", "Node.js", "Three.js", "Tailwind CSS"],
  hobbies: ["Photography", "Chess", "Open Source", "Hiking", "Reading"],
  achievements: [
    "Led migration of legacy app to Next.js — 40% faster page loads",
    "Built internal design-system adopted by 4 teams",
    "Speaker at internal tech-talk: \"State Management Demystified\"",
  ],
  funFact: "I once debugged a production bug live on stage during a demo. Fixed it in 90 seconds. 🎯",
};

// ─── Tag chip ─────────────────────────────────────────────────────────────────

function TagChip({ label, onRemove, color = "#f97316" }: { label: string; onRemove?: () => void; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium select-none"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, color, placeholder }: { tags: string[]; onChange: (t: string[]) => void; color?: string; placeholder?: string }) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {tags.map(t => <TagChip key={t} label={t} color={color} onRemove={() => onChange(tags.filter(x => x !== t))} />)}
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        placeholder={placeholder ?? "Add…"} className="text-xs bg-transparent outline-none text-white placeholder-slate-500 min-w-[80px] flex-1" />
    </div>
  );
}

// ─── Editable field ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", rows }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; rows?: number }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={String(value)} onChange={e => onChange(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2 text-white resize-none outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
      ) : (
        <input type={type} value={String(value)} onChange={e => onChange(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
      )}
    </div>
  );
}

// ─── CARD component (the printable one-pager) ─────────────────────────────────

function TownHallCard({ p, cardRef }: { p: ProfileData; cardRef: React.RefObject<HTMLDivElement> }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "YN";
  return (
    <div ref={cardRef} id="townhall-card"
      style={{
        width: 794, minHeight: 1123,
        background: "linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #0d1117 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "white",
        position: "relative",
        overflow: "hidden",
        padding: 0,
      }}>

      {/* decorative blobs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 80, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 300, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* header band */}
      <div style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 60%, #dc2626 100%)", padding: "2px 0" }} />

      {/* hero */}
      <div style={{ padding: "40px 48px 32px", display: "flex", alignItems: "center", gap: 32, borderBottom: "1px solid rgba(249,115,22,0.15)" }}>
        {/* avatar */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, fontWeight: 800, color: "white",
          boxShadow: "0 0 0 4px rgba(249,115,22,0.2), 0 0 30px rgba(249,115,22,0.3)",
        }}>
          {initials}
        </div>
        {/* name block */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", marginBottom: 8 }}>
            Town Hall · Frontend Capability Unit
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, background: "linear-gradient(90deg, #ffffff, #e2e8f0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {p.name}
          </div>
          <div style={{ fontSize: 17, color: "#f97316", fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>{p.team}</div>
        </div>
        {/* exp badge */}
        <div style={{
          textAlign: "center", padding: "16px 24px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
          border: "1px solid rgba(249,115,22,0.3)",
        }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#f97316", lineHeight: 1 }}>{p.yearsOfExp}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 4, letterSpacing: 1 }}>YRS EXP</div>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: "32px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

        {/* left column */}
        <div>
          {/* about */}
          <Section title="About Me" icon="👋">
            <p style={{ fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.75 }}>{p.summary}</p>
          </Section>

          {/* achievements */}
          {p.achievements.length > 0 && (
            <Section title="Key Achievements" icon="🏆">
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {p.achievements.map((a, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                    <span style={{ color: "#f97316", marginTop: 2, flexShrink: 0 }}>▸</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* fun fact */}
          {p.funFact && (
            <div style={{
              padding: "14px 18px", borderRadius: 12, marginTop: 8,
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.05))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>⚡ Fun Fact</div>
              <p style={{ fontSize: 13, color: "#c7d2fe", lineHeight: 1.6, margin: 0 }}>{p.funFact}</p>
            </div>
          )}
        </div>

        {/* right column */}
        <div>
          {/* tech areas */}
          <Section title="Technical Strong Areas" icon="💻">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.techAreas.map(t => (
                <span key={t} style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))",
                  color: "#fb923c", border: "1px solid rgba(249,115,22,0.25)",
                }}>{t}</span>
              ))}
            </div>
          </Section>

          {/* hobbies */}
          <Section title="Hobbies & Interests" icon="🎯">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.hobbies.map(h => (
                <span key={h} style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)",
                }}>{h}</span>
              ))}
            </div>
          </Section>

          {/* contact */}
          <Section title="Connect With Me" icon="🔗">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.email && <ContactRow icon="✉" label={p.email} />}
              {p.linkedin && <ContactRow icon="in" label={p.linkedin} accent="#0a66c2" />}
              {p.github && <ContactRow icon="⌥" label={p.github} />}
            </div>
          </Section>
        </div>
      </div>

      {/* footer */}
      <div style={{
        margin: "0 48px 32px", padding: "14px 20px", borderRadius: 10,
        background: "linear-gradient(90deg, rgba(249,115,22,0.08), transparent)",
        border: "1px solid rgba(249,115,22,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Frontend Capability Unit — Town Hall 2025</span>
        <span style={{ fontSize: 12, color: "#f97316", fontWeight: 600 }}>#FrontendCapabilityUnit</span>
      </div>

      {/* bottom accent */}
      <div style={{ background: "linear-gradient(90deg, #f97316 0%, #ea580c 60%, #dc2626 100%)", padding: "2px 0" }} />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", letterSpacing: 0.5 }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(249,115,22,0.15)", marginLeft: 4 }} />
      </div>
      {children}
    </div>
  );
}

function ContactRow({ icon, label, accent = "#64748b" }: { icon: string; label: string; accent?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 800, color: accent,
      }}>{icon}</span>
      <span style={{ fontSize: 12.5, color: "#94a3b8" }}>{label}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
};

const section: React.CSSProperties = { ...card, padding: "16px 18px", marginBottom: 12 };

export default function TownHallProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null!);

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
      const el = document.getElementById("townhall-card");
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#0d1117" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [794, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, 794, canvas.height / 2);
      pdf.save(`${profile.name.replace(/\s+/g, "_")}_TownHall.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  // achievement editor
  const [newAch, setNewAch] = useState("");

  return (
    <div className="min-h-screen" style={{ background: "#060912", color: "white" }}>
      {/* top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(6,9,18,0.95)", borderBottom: "1px solid rgba(249,115,22,0.15)", backdropFilter: "blur(12px)" }}>
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
          {downloading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating PDF…</>
            : downloaded ? <><Check className="w-4 h-4" />Downloaded!</>
            : <><FileDown className="w-4 h-4" />Download PDF</>}
        </button>
      </div>

      <div className="flex gap-0 h-[calc(100vh-57px)]">

        {/* ── Left: edit panel ─────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 overflow-y-auto p-4"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>

          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="w-4 h-4" style={{ color: "#f97316" }} />
            <p className="text-sm font-bold text-white">Edit Profile</p>
          </div>

          {/* identity */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <User className="w-3 h-3 inline mr-1" />Identity
            </p>
            <Field label="Full Name" value={profile.name} onChange={v => set("name", v)} />
            <Field label="Job Title" value={profile.title} onChange={v => set("title", v)} />
            <Field label="Team / Unit" value={profile.team} onChange={v => set("team", v)} />
            <Field label="Years of Experience" value={profile.yearsOfExp} type="number" onChange={v => set("yearsOfExp", parseInt(v) || 0)} />
          </div>

          {/* contact */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Mail className="w-3 h-3 inline mr-1" />Contact
            </p>
            <Field label="Email" value={profile.email} onChange={v => set("email", v)} />
            <Field label="LinkedIn" value={profile.linkedin} onChange={v => set("linkedin", v)} />
            <Field label="GitHub" value={profile.github} onChange={v => set("github", v)} />
          </div>

          {/* summary */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Star className="w-3 h-3 inline mr-1" />About Me
            </p>
            <Field label="Summary / Bio" value={profile.summary} onChange={v => set("summary", v)} rows={4} />
          </div>

          {/* tech areas */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Code2 className="w-3 h-3 inline mr-1" />Technical Areas
            </p>
            <p className="text-xs mb-2" style={{ color: "#64748b" }}>Press Enter or comma to add</p>
            <TagInput tags={profile.techAreas} onChange={v => set("techAreas", v)} color="#f97316" placeholder="React, TypeScript…" />
          </div>

          {/* hobbies */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Heart className="w-3 h-3 inline mr-1" />Hobbies
            </p>
            <TagInput tags={profile.hobbies} onChange={v => set("hobbies", v)} color="#22c55e" placeholder="Photography, Chess…" />
          </div>

          {/* achievements */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Award className="w-3 h-3 inline mr-1" />Key Achievements
            </p>
            <div className="space-y-2 mb-2">
              {profile.achievements.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "#f97316" }} />
                  <span className="text-xs flex-1" style={{ color: "#94a3b8" }}>{a}</span>
                  <button onClick={() => set("achievements", profile.achievements.filter((_, j) => j !== i))} className="hover:opacity-70">
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
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* fun fact */}
          <div style={section}>
            <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
              <Zap className="w-3 h-3 inline mr-1" />Fun Fact
            </p>
            <Field label="One memorable thing about you" value={profile.funFact} onChange={v => set("funFact", v)} rows={2} />
          </div>

        </div>

        {/* ── Right: live preview ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto p-8" style={{ background: "#04060e" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-white">Live Preview</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Exactly what gets exported to PDF</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Live
            </div>
          </div>
          <div className="overflow-x-auto">
            <div style={{ transformOrigin: "top left", transform: "scale(0.82)", width: 794, marginBottom: -200 }}>
              <TownHallCard p={profile} cardRef={cardRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
