"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Activity,
  Cpu,
  User,
  ExternalLink,
  ChevronRight,
  Zap,
  Shield,
  Eye,
  Heart,
} from "lucide-react";
import { Link } from "@/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
type Posture = "standing" | "sitting" | "walking" | "lying";

/* ─────────────────────────────────────────────────────────────────────────────
   SVG Skeleton figures
───────────────────────────────────────────────────────────────────────────── */
function SkeletonStanding() {
  return (
    <svg viewBox="0 0 120 240" className="w-full h-full" strokeLinecap="round">
      {/* head */}
      <circle cx="60" cy="22" r="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
      {/* neck */}
      <line x1="60" y1="36" x2="60" y2="52" stroke="#22d3ee" strokeWidth="2.5" />
      {/* shoulders */}
      <line x1="28" y1="52" x2="92" y2="52" stroke="#22d3ee" strokeWidth="2.5" />
      {/* spine */}
      <line x1="60" y1="52" x2="60" y2="120" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left upper arm */}
      <line x1="28" y1="52" x2="16" y2="90" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left forearm */}
      <line x1="16" y1="90" x2="10" y2="125" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right upper arm */}
      <line x1="92" y1="52" x2="104" y2="90" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right forearm */}
      <line x1="104" y1="90" x2="110" y2="125" stroke="#22d3ee" strokeWidth="2.5" />
      {/* hips */}
      <line x1="40" y1="120" x2="80" y2="120" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left thigh */}
      <line x1="40" y1="120" x2="36" y2="175" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left shin */}
      <line x1="36" y1="175" x2="34" y2="228" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right thigh */}
      <line x1="80" y1="120" x2="84" y2="175" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right shin */}
      <line x1="84" y1="175" x2="86" y2="228" stroke="#22d3ee" strokeWidth="2.5" />
      {/* joints */}
      {[
        [60, 52], [28, 52], [92, 52], [16, 90], [104, 90],
        [10, 125], [110, 125], [60, 120], [40, 120], [80, 120],
        [36, 175], [84, 175], [34, 228], [86, 228],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function SkeletonSitting() {
  return (
    <svg viewBox="0 0 160 240" className="w-full h-full" strokeLinecap="round">
      {/* head */}
      <circle cx="70" cy="30" r="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
      {/* neck */}
      <line x1="70" y1="44" x2="70" y2="58" stroke="#22d3ee" strokeWidth="2.5" />
      {/* shoulders */}
      <line x1="38" y1="58" x2="102" y2="58" stroke="#22d3ee" strokeWidth="2.5" />
      {/* spine */}
      <line x1="70" y1="58" x2="70" y2="125" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left upper arm */}
      <line x1="38" y1="58" x2="22" y2="95" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left forearm — resting on knee */}
      <line x1="22" y1="95" x2="28" y2="140" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right upper arm */}
      <line x1="102" y1="58" x2="118" y2="95" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right forearm — resting on knee */}
      <line x1="118" y1="95" x2="112" y2="140" stroke="#22d3ee" strokeWidth="2.5" />
      {/* hips */}
      <line x1="48" y1="125" x2="92" y2="125" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left thigh — horizontal */}
      <line x1="48" y1="125" x2="18" y2="130" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left shin — vertical down */}
      <line x1="18" y1="130" x2="16" y2="200" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right thigh — horizontal */}
      <line x1="92" y1="125" x2="122" y2="130" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right shin — vertical down */}
      <line x1="122" y1="130" x2="124" y2="200" stroke="#22d3ee" strokeWidth="2.5" />
      {/* seat line */}
      <line x1="10" y1="195" x2="140" y2="195" stroke="#1e3a5f" strokeWidth="2" strokeDasharray="6,4" />
      {/* joints */}
      {[
        [70, 58], [38, 58], [102, 58], [22, 95], [118, 95],
        [28, 140], [112, 140], [70, 125], [48, 125], [92, 125],
        [18, 130], [122, 130], [16, 200], [124, 200],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function SkeletonWalking() {
  return (
    <svg viewBox="0 0 140 240" className="w-full h-full" strokeLinecap="round">
      {/* head — slightly forward */}
      <circle cx="65" cy="22" r="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
      {/* neck */}
      <line x1="65" y1="36" x2="62" y2="52" stroke="#22d3ee" strokeWidth="2.5" />
      {/* shoulders */}
      <line x1="30" y1="54" x2="94" y2="50" stroke="#22d3ee" strokeWidth="2.5" />
      {/* spine */}
      <line x1="62" y1="52" x2="60" y2="120" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left upper arm — swing back */}
      <line x1="30" y1="54" x2="14" y2="85" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left forearm */}
      <line x1="14" y1="85" x2="8" y2="112" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right upper arm — swing forward */}
      <line x1="94" y1="50" x2="112" y2="82" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right forearm */}
      <line x1="112" y1="82" x2="122" y2="108" stroke="#22d3ee" strokeWidth="2.5" />
      {/* hips */}
      <line x1="42" y1="120" x2="78" y2="120" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left thigh — forward stride */}
      <line x1="42" y1="120" x2="28" y2="168" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left shin — bent */}
      <line x1="28" y1="168" x2="18" y2="228" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right thigh — back stride */}
      <line x1="78" y1="120" x2="98" y2="165" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right shin — extending */}
      <line x1="98" y1="165" x2="112" y2="215" stroke="#22d3ee" strokeWidth="2.5" />
      {/* joints */}
      {[
        [62, 52], [30, 54], [94, 50], [14, 85], [112, 82],
        [8, 112], [122, 108], [60, 120], [42, 120], [78, 120],
        [28, 168], [98, 165], [18, 228], [112, 215],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function SkeletonLying() {
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" strokeLinecap="round">
      {/* head */}
      <circle cx="22" cy="55" r="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
      {/* neck */}
      <line x1="36" y1="55" x2="50" y2="55" stroke="#22d3ee" strokeWidth="2.5" />
      {/* shoulders */}
      <line x1="50" y1="38" x2="50" y2="72" stroke="#22d3ee" strokeWidth="2.5" />
      {/* spine — horizontal */}
      <line x1="50" y1="55" x2="160" y2="55" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left upper arm — up */}
      <line x1="50" y1="38" x2="68" y2="22" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left forearm */}
      <line x1="68" y1="22" x2="90" y2="18" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right upper arm — down */}
      <line x1="50" y1="72" x2="68" y2="88" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right forearm */}
      <line x1="68" y1="88" x2="90" y2="92" stroke="#22d3ee" strokeWidth="2.5" />
      {/* hips */}
      <line x1="160" y1="42" x2="160" y2="68" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left thigh */}
      <line x1="160" y1="42" x2="218" y2="36" stroke="#22d3ee" strokeWidth="2.5" />
      {/* left shin */}
      <line x1="218" y1="36" x2="278" y2="32" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right thigh */}
      <line x1="160" y1="68" x2="218" y2="74" stroke="#22d3ee" strokeWidth="2.5" />
      {/* right shin */}
      <line x1="218" y1="74" x2="278" y2="78" stroke="#22d3ee" strokeWidth="2.5" />
      {/* floor line */}
      <line x1="4" y1="98" x2="296" y2="98" stroke="#1e3a5f" strokeWidth="2" strokeDasharray="6,4" />
      {/* joints */}
      {[
        [50, 55], [50, 38], [50, 72], [68, 22], [68, 88],
        [90, 18], [90, 92], [160, 55], [160, 42], [160, 68],
        [218, 36], [218, 74], [278, 32], [278, 78],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Posture config
───────────────────────────────────────────────────────────────────────────── */
const POSTURES: {
  key: Posture;
  label: string;
  regions: string;
  confidence: string;
  signal: string;
  bpm: number;
  hrBpm: number;
  /* SVG path points for the CSI waveform — normalised 0-100 y-values over 20 x steps */
  wave: number[];
}[] = [
  {
    key: "standing", label: "Standing", regions: "24/24", confidence: "96%", signal: "Strong",
    bpm: 15, hrBpm: 72,
    wave: [50,48,52,55,50,46,50,54,51,49,52,50,47,53,50,51,49,52,50,50],
  },
  {
    key: "sitting", label: "Sitting", regions: "24/24", confidence: "94%", signal: "Strong",
    bpm: 14, hrBpm: 68,
    wave: [50,51,49,50,52,50,49,51,50,50,49,52,51,50,48,51,50,49,51,50],
  },
  {
    key: "walking", label: "Walking", regions: "22/24", confidence: "89%", signal: "Good",
    bpm: 18, hrBpm: 95,
    wave: [50,38,62,44,68,36,65,42,70,35,66,40,72,34,64,45,68,38,58,50],
  },
  {
    key: "lying", label: "Lying Down", regions: "21/24", confidence: "91%", signal: "Good",
    bpm: 12, hrBpm: 60,
    wave: [50,51,49,50,51,50,49,50,52,49,51,50,49,51,50,50,49,52,50,50],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CSI Signal Waveform visualiser
───────────────────────────────────────────────────────────────────────────── */
function SignalWaveform({ wave, posture }: { wave: number[]; posture: Posture }) {
  const W = 320;
  const H = 100;
  const step = W / (wave.length - 1);

  // Build SVG polyline points
  const points = wave.map((v, i) => `${i * step},${v}`).join(" ");

  // Colour depends on signal type
  const stroke = posture === "walking" ? "#f59e0b" : "#22d3ee";
  const fill   = posture === "walking" ? "rgba(245,158,11,0.08)" : "rgba(34,211,238,0.08)";

  return (
    <div className="w-full">
      <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 text-center">
        CSI Amplitude — {posture === "walking" ? "High Motion" : posture === "lying" ? "Minimal Motion" : "Low Motion"}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#1e293b" strokeWidth="1" />
        ))}
        {/* Area fill */}
        <polyline
          points={`0,${H} ${points} ${W},${H}`}
          fill={fill}
          stroke="none"
        />
        {/* Signal line */}
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Data points */}
        {wave.map((v, i) => (
          <circle key={i} cx={i * step} cy={v} r="2.5" fill={stroke} opacity="0.7" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-slate-600 font-mono mt-1 px-1">
        <span>t=0ms</span><span>t=200ms</span><span>t=400ms</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 1 — Hero
───────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 px-4 py-24">
      {/* CSS animation styles */}
      <style>{`
        @keyframes wifiPulse {
          0%   { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes signalFlow {
          0%   { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .wifi-ring {
          position: absolute;
          border: 2px solid #22d3ee;
          border-radius: 50%;
          animation: wifiPulse 3s ease-out infinite;
        }
        .wifi-ring-1 { width: 80px; height: 80px; animation-delay: 0s; }
        .wifi-ring-2 { width: 140px; height: 140px; animation-delay: 0.6s; }
        .wifi-ring-3 { width: 200px; height: 200px; animation-delay: 1.2s; }
        .wifi-ring-4 { width: 260px; height: 260px; animation-delay: 1.8s; }
        .wifi-ring-5 { width: 320px; height: 320px; animation-delay: 2.4s; }
      `}</style>

      {/* Animated WiFi rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <div className="wifi-ring wifi-ring-1" />
          <div className="wifi-ring wifi-ring-2" />
          <div className="wifi-ring wifi-ring-3" />
          <div className="wifi-ring wifi-ring-4" />
          <div className="wifi-ring wifi-ring-5" />
        </div>
      </div>

      {/* Gradient overlay to soften rings behind content */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-900 opacity-60 pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase">
            <Wifi className="w-3.5 h-3.5" />
            WiFi-Based Sensing Technology
          </span>
          <a
            href="https://github.com/ruvnet/RuView"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
          >
            ⬡ Powered by RuView
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4"
        >
          WiFi-Based{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Body Posture
          </span>{" "}
          Detection
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-xl sm:text-2xl text-slate-300 font-medium mb-10"
        >
          No Camera. No Wearable. Just{" "}
          <span className="text-cyan-400 font-bold">WiFi Signals</span> +{" "}
          <span className="text-blue-400 font-bold">AI.</span>
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50 hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            Start Detection
          </Link>
          <Link
            href="/wifi-posture/camera"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5"
          >
            <User className="w-4 h-4" />
            Try with iPhone Camera
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold rounded-xl transition-all duration-200"
          >
            Learn How It Works
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="inline-flex flex-wrap justify-center gap-0 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800/60 backdrop-blur"
        >
          {[
            { value: "24", label: "Body Regions" },
            { value: "5m", label: "Through-Wall" },
            { value: "No Camera", label: "100% Private" },
            { value: "Edge AI", label: "Offline Ready" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center px-6 py-4 border-r border-slate-700/60 last:border-r-0"
            >
              <span className="text-xl font-extrabold text-cyan-400 font-mono">{stat.value}</span>
              <span className="text-xs text-slate-400 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs"
      >
        <span>Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 2 — How It Works
───────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    icon: Wifi,
    title: "WiFi Signals Fill the Room",
    desc: "Your router constantly sends 5GHz radio waves that bounce off everything, including the human body.",
  },
  {
    num: "02",
    icon: Activity,
    title: "CSI Data Captured",
    desc: "Channel State Information (CSI) measures changes in signal strength and phase caused by human movement.",
  },
  {
    num: "03",
    icon: Cpu,
    title: "AI Processes the Signal",
    desc: "A deep learning model (DensePose architecture) analyzes signal distortions and maps them to body keypoints.",
  },
  {
    num: "04",
    icon: User,
    title: "Skeleton Pose Reconstructed",
    desc: "Real-time output of 24 body surface regions — arms, torso, head, joints — all without any camera.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-slate-900 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">The Science</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            How WiFi Posture Detection Works
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Four steps from raw radio waves to a fully reconstructed 3D skeleton — all without a single pixel of video.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="relative bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="absolute -top-3 left-6 text-xs font-black text-cyan-500/60 tracking-widest font-mono">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center mb-4 group-hover:border-cyan-500/60 transition-colors">
                <step.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>

              {/* connector arrow — hidden on last item */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="w-5 h-5 text-cyan-500/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 3 — Live Demo Simulation
───────────────────────────────────────────────────────────────────────────── */
function DemoSection() {
  const [posture, setPosture] = useState<Posture>("standing");

  const current = POSTURES.find((p) => p.key === posture)!;

  const signalColor =
    current.signal === "Strong"
      ? "text-emerald-400"
      : "text-amber-400";

  return (
    <section id="demo" className="bg-slate-950 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Interactive Demo</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Live Detection Simulation
          </h2>
          <p className="text-slate-400 text-lg">
            Select a posture to see how the AI reconstructs the skeleton from WiFi signals.
          </p>
        </motion.div>

        {/* Posture buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {POSTURES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPosture(p.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                posture === p.key
                  ? "bg-cyan-500 border-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Signal Detection Panel */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-5 min-h-[360px] relative overflow-hidden">
            <style>{`
              @keyframes rippleOut {
                0%   { transform: scale(0.3); opacity: 0.9; }
                100% { transform: scale(3.5); opacity: 0; }
              }
              .demo-ring {
                position: absolute;
                border: 1.5px solid #22d3ee;
                border-radius: 50%;
                width: 56px; height: 56px;
                animation: rippleOut 2.4s ease-out infinite;
              }
              .demo-ring:nth-child(2) { animation-delay: 0.48s; }
              .demo-ring:nth-child(3) { animation-delay: 0.96s; }
              .demo-ring:nth-child(4) { animation-delay: 1.44s; }
              .demo-ring:nth-child(5) { animation-delay: 1.92s; }
            `}</style>

            {/* Router + ripple */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
                <div className="demo-ring" />
                <div className="demo-ring" />
                <div className="demo-ring" />
                <div className="demo-ring" />
                <div className="demo-ring" />
                <div className="relative z-10 w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/60 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold">ESP32 CSI Capture</p>
                <p className="text-slate-400 text-xs">100 packets/sec · 5 GHz band</p>
                <div className="flex gap-1.5 mt-1.5">
                  {["A", "B", "C", "D"].map(n => (
                    <span key={n} className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/50 text-cyan-400 text-xs font-mono">
                      Node {n} ✓
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Live CSI waveform */}
            <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-700/40">
              <SignalWaveform wave={current.wave} posture={posture} />
            </div>

            {/* Vital signs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Breathing</p>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{current.bpm}</p>
                <p className="text-xs text-slate-500">breaths/min</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Heart Rate</p>
                <p className="text-2xl font-black text-rose-400 font-mono mt-1">{current.hrBpm}</p>
                <p className="text-xs text-slate-500">BPM</p>
              </div>
            </div>
          </div>

          {/* Right — SVG skeleton */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[360px]">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Reconstructed Skeleton — {current.label}
            </p>
            <div
              className={`flex-1 w-full flex items-center justify-center transition-all duration-300 ${
                posture === "lying" ? "max-h-32" : "max-h-64"
              }`}
            >
              {posture === "standing" && <SkeletonStanding />}
              {posture === "sitting"  && <SkeletonSitting />}
              {posture === "walking"  && <SkeletonWalking />}
              {posture === "lying"    && <SkeletonLying />}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 bg-slate-800/70 border border-slate-700/60 rounded-xl px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-sm font-mono">
          <span className="text-slate-400">
            Signal Strength:{" "}
            <span className={`font-bold ${signalColor}`}>{current.signal}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Regions Detected:{" "}
            <span className="font-bold text-cyan-400">{current.regions}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Confidence:{" "}
            <span className="font-bold text-blue-400">{current.confidence}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 4 — Tech Specs Table
───────────────────────────────────────────────────────────────────────────── */
const SPECS = [
  ["Technology",        "WiFi CSI + Deep Learning"],
  ["Hardware",          "ESP32 nodes (~$1 each)"],
  ["Nodes Required",    "4–6 for 360° coverage"],
  ["Through-Wall Range","Up to 5 meters"],
  ["Body Regions Mapped","24 surface regions"],
  ["Vital Signs",       "Breathing 6–30 BPM, HR 40–120 BPM"],
  ["Processing",        "Edge AI (offline, no cloud)"],
  ["Privacy",           "No video, no images stored"],
];

function TechSpecsSection() {
  return (
    <section className="bg-slate-900 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Specifications</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Tech Specs</h2>
          <p className="text-slate-400 text-lg">Production-grade hardware and AI pipeline specifications.</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-slate-700/60"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700/60">
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Feature
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {SPECS.map(([feature, detail], i) => (
                <tr
                  key={i}
                  className="bg-slate-900 hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-300">{feature}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 5 — Use Cases
───────────────────────────────────────────────────────────────────────────── */
const USE_CASES = [
  {
    emoji: "🏥",
    title: "Healthcare",
    desc: "Fall detection, elderly monitoring, patient vital signs without bedside cameras.",
  },
  {
    emoji: "🏠",
    title: "Smart Home",
    desc: "Presence automation, smart lights & HVAC control based on occupancy and posture.",
  },
  {
    emoji: "🏋️",
    title: "Fitness",
    desc: "Rep counting, real-time posture correction, and workout tracking — camera-free.",
  },
  {
    emoji: "🏭",
    title: "Industrial Safety",
    desc: "Worker zone monitoring, ergonomic fatigue detection, and hazard alerts.",
  },
  {
    emoji: "🔐",
    title: "Security",
    desc: "Through-wall intruder detection with no privacy-invasive cameras required.",
  },
  {
    emoji: "👶",
    title: "Child Safety",
    desc: "Breathing monitoring during sleep, sleep position alerts, nursery surveillance.",
  },
];

function UseCasesSection() {
  return (
    <section className="bg-slate-950 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Applications</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Use Cases</h2>
          <p className="text-slate-400 text-lg">
            From hospitals to homes — WiFi sensing is transforming how we interact with spaces.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i % 3}
              className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{uc.emoji}</div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                {uc.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 6 — Architecture Diagram
───────────────────────────────────────────────────────────────────────────── */
const ARCH_NODES = [
  { label: "ESP32 Node", color: "border-cyan-500/60 text-cyan-400" },
  { label: "WiFi Router", color: "border-blue-500/60 text-blue-400" },
  { label: "CSI Extractor", color: "border-blue-500/60 text-blue-400" },
  { label: "Signal Processor", color: "border-indigo-500/60 text-indigo-400" },
  { label: "DensePose AI", color: "border-violet-500/60 text-violet-400" },
  { label: "Skeleton Output", color: "border-cyan-500/60 text-cyan-400" },
  { label: "Dashboard", color: "border-emerald-500/60 text-emerald-400" },
];

function ArchitectureSection() {
  return (
    <section className="bg-slate-900 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">System Design</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Architecture Diagram</h2>
          <p className="text-slate-400 text-lg">
            End-to-end pipeline from hardware nodes to human-readable pose output.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {ARCH_NODES.map((node, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`px-4 py-3 rounded-xl bg-slate-800 border ${node.color} text-sm font-bold font-mono whitespace-nowrap shadow-sm`}
              >
                {node.label}
              </div>
              {i < ARCH_NODES.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Flow description */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: "Hardware Layer", desc: "4–6 ESP32 nodes placed around the room capture raw CSI data via the WiFi router.", color: "border-cyan-800/60 bg-cyan-950/30" },
            { title: "Processing Layer", desc: "CSI extractor parses packets; signal processor applies windowing and FFT for temporal features.", color: "border-blue-800/60 bg-blue-950/30" },
            { title: "AI Layer", desc: "DensePose model maps signal tensors to 24 body region heatmaps for the final skeleton output.", color: "border-violet-800/60 bg-violet-950/30" },
          ].map((card, i) => (
            <div key={i} className={`p-5 rounded-xl border ${card.color}`}>
              <h4 className="text-white font-semibold text-sm mb-2">{card.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 7 — Open Source / Research
───────────────────────────────────────────────────────────────────────────── */
const RESOURCES = [
  {
    icon: "⬡",
    type: "Open Source · MIT",
    title: "RuView by ruvnet",
    desc: "The engine powering this page. WiFi DensePose → 17-keypoint real-time pose estimation, breathing & heart rate — no camera, no wearable. Built in Rust at 54,000 frames/sec on ~$8 ESP32-S3 nodes.",
    href: "https://github.com/ruvnet/RuView",
    label: "Star on GitHub",
  },
  {
    icon: "⬡",
    type: "GitHub",
    title: "WiFi-CSI-Human-Pose-Detection",
    desc: "Community implementation of WiFi CSI-based human pose detection with deep learning — enabling camera-free sensing through walls using ESP32 hardware.",
    href: "https://github.com/euaziel/WiFi-CSI-Human-Pose-Detection",
    label: "View on GitHub",
  },
  {
    icon: "📄",
    type: "Research Paper",
    title: "\"DensePose from WiFi\"",
    desc: "Carnegie Mellon University — Landmark paper demonstrating 24-region body mapping using standard WiFi hardware. The foundation RuView is built on.",
    href: "https://arxiv.org/abs/2301.00250",
    label: "Read Paper",
  },
];

function ResearchSection() {
  return (
    <section className="bg-slate-950 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Resources</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Open Source &amp; Research</h2>
          <p className="text-slate-400 text-lg">
            Built on peer-reviewed research and open-source implementations.
          </p>
        </motion.div>

        {/* RuView featured banner */}
        <motion.a
          href="https://github.com/ruvnet/RuView"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="block mb-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-slate-900/60 p-6 hover:border-emerald-400/50 transition-all duration-300 group"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
              ⬡
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Open Source · MIT License</span>
              </div>
              <h3 className="text-white font-extrabold text-lg mb-1">RuView — WiFi DensePose Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The open-source project this page is built on. Turns commodity WiFi signals into real-time human pose estimation,
                vital sign monitoring, and presence detection — using ESP32-S3 nodes at $8 each, written in Rust at 54,000 frames/sec.
                Self-supervised, no labeled data, no cloud required.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:text-emerald-300 shrink-0">
              <ExternalLink className="w-4 h-4" />
              Star on GitHub
            </div>
          </div>
        </motion.a>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESOURCES.map((res, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={`border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                i === 0
                  ? "bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400/50"
                  : "bg-slate-800/50 border-slate-700/60 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{res.icon}</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                  {res.type}
                </span>
              </div>
              <h3 className="text-white font-bold text-base mb-3 leading-snug">{res.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{res.desc}</p>
              <a
                href={res.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                  i === 0 ? "text-emerald-400 hover:text-emerald-300" : "text-cyan-400 hover:text-cyan-300"
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                {res.label}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section 8 — Footer CTA
───────────────────────────────────────────────────────────────────────────── */
function FooterCTASection() {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-24 px-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-950 border border-blue-700/60 mb-8">
          <Wifi className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to integrate WiFi sensing into your smart space?
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          Deploy non-invasive, camera-free body posture detection in minutes with our edge AI stack.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50 hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            Get Started
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 border border-slate-600 text-slate-300 hover:border-cyan-500/60 hover:text-white font-bold rounded-xl transition-all duration-200"
          >
            Contact Us
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
          {[
            { icon: Shield, label: "No Camera Data" },
            { icon: Eye, label: "100% Private" },
            { icon: Heart, label: "CMU Research-Backed" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-cyan-600" />
              {label}
            </span>
          ))}
          <a
            href="https://github.com/ruvnet/RuView"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Powered by RuView
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Root export
───────────────────────────────────────────────────────────────────────────── */
export default function WifiPostureClient() {
  return (
    <main className="bg-slate-900 min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <DemoSection />
      <TechSpecsSection />
      <UseCasesSection />
      <ArchitectureSection />
      <ResearchSection />
      <FooterCTASection />
    </main>
  );
}
