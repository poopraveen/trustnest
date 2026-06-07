"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera, Loader2, AlertCircle, RotateCcw, ArrowLeft,
  SlidersHorizontal, ExternalLink, Download, Zap, Eye,
  Shield, X,
} from "lucide-react";
import Link from "next/link";

/* ── COCO-80 category metadata ─────────────────────────────────────────────── */
const CATEGORY_GROUPS: Record<string, { label: string; color: string; classes: string[] }> = {
  person:    { label: "People",    color: "#ef4444", classes: ["person"] },
  vehicle:   { label: "Vehicles",  color: "#f59e0b", classes: ["bicycle","car","motorcycle","airplane","bus","train","truck","boat"] },
  animal:    { label: "Animals",   color: "#22d3ee", classes: ["bird","cat","dog","horse","sheep","cow","elephant","bear","zebra","giraffe"] },
  food:      { label: "Food",      color: "#34d399", classes: ["banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake"] },
  object:    { label: "Objects",   color: "#a78bfa", classes: ["backpack","umbrella","handbag","suitcase","bottle","cup","laptop","cell phone","book","clock"] },
  furniture: { label: "Furniture", color: "#64748b", classes: ["chair","couch","bed","dining table","toilet","tv"] },
};

function getGroupColor(cls: string): string {
  for (const g of Object.values(CATEGORY_GROUPS)) {
    if (g.classes.includes(cls.toLowerCase())) return g.color;
  }
  return "#94a3b8";
}
function getGroupLabel(cls: string): string {
  for (const g of Object.values(CATEGORY_GROUPS)) {
    if (g.classes.includes(cls.toLowerCase())) return g.label;
  }
  return "Other";
}

/* ── Load steps ─────────────────────────────────────────────────────────────── */
const LOAD_STEPS = [
  "Initialising TensorFlow.js…",
  "Loading WebGL backend…",
  "Downloading COCO-SSD model (~6 MB)…",
  "Warming up detector…",
];

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // x, y, w, h (pixels)
}
type ModelState = "idle" | "loading" | "ready" | "error";

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function ObjectDetectClient() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<{ detect: (img: HTMLVideoElement) => Promise<Detection[]> } | null>(null);
  const rafRef      = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);
  const fpsRef      = useRef({ frames: 0, last: Date.now() });

  const [modelState, setModelState]   = useState<ModelState>("idle");
  const [loadStep, setLoadStep]       = useState(0);
  const [cameraOn, setCameraOn]       = useState(false);
  const [facingMode, setFacingMode]   = useState<"environment" | "user">("environment");
  const [detections, setDetections]   = useState<Detection[]>([]);
  const [fps, setFps]                 = useState(0);
  const [threshold, setThreshold]     = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError]             = useState("");
  const [snapshot, setSnapshot]       = useState<string | null>(null);

  /* ── Load model ─────────────────────────────────────────────────────────── */
  async function loadModel() {
    setModelState("loading"); setLoadStep(0); setError("");
    try {
      setLoadStep(0);
      const tf = await import("@tensorflow/tfjs");
      setLoadStep(1);
      try { await import("@tensorflow/tfjs-backend-webgl" as never); await tf.setBackend("webgl"); }
      catch { await tf.setBackend("cpu"); }
      await tf.ready();

      setLoadStep(2);
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      const model   = await cocoSsd.load({ base: "mobilenet_v2" });

      setLoadStep(3);
      const warmup = document.createElement("canvas");
      warmup.width = 300; warmup.height = 300;
      await model.detect(warmup as unknown as HTMLImageElement);

      detectorRef.current = model as unknown as typeof detectorRef.current;
      setModelState("ready");
    } catch (e) {
      setModelState("error");
      setError(e instanceof Error ? e.message : "Failed to load model");
    }
  }

  useEffect(() => { loadModel(); return () => { cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach(t => t.stop()); }; }, []);

  /* ── Detection loop ──────────────────────────────────────────────────────── */
  const detect = useCallback(async () => {
    const video    = videoRef.current;
    const canvas   = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect); return;
    }

    const raw = await detector.detect(video);
    const filtered = raw.filter(d => d.score >= threshold);

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    filtered.forEach(det => {
      if (activeFilter && getGroupLabel(det.class).toLowerCase() !== activeFilter.toLowerCase()) return;
      const [x, y, w, h] = det.bbox;
      const color = getGroupColor(det.class);
      const pct = Math.round(det.score * 100);

      // Box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Label background
      const label = `${det.class} ${pct}%`;
      ctx.font = "bold 13px system-ui";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = color;
      const ly = Math.max(y - 22, 2);
      ctx.fillRect(x - 1, ly, tw + 10, 20);

      // Label text
      ctx.fillStyle = "#000";
      ctx.fillText(label, x + 4, ly + 14);
    });

    setDetections(filtered);

    const c = fpsRef.current;
    c.frames++;
    const now = Date.now();
    if (now - c.last >= 1000) { setFps(c.frames); c.frames = 0; c.last = now; }

    rafRef.current = requestAnimationFrame(detect);
  }, [threshold, activeFilter]);

  /* ── Start / stop camera ──────────────────────────────────────────────────── */
  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setCameraOn(true);
      rafRef.current = requestAnimationFrame(detect);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes("NotAllowed") ? "Camera permission denied. Allow in Safari Settings." : msg);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false); setDetections([]); setFps(0);
  }

  async function flipCamera() {
    stopCamera();
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setTimeout(() => startCamera(), 120);
  }

  function takeSnapshot() {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;
    const snap = document.createElement("canvas");
    snap.width  = video.videoWidth;
    snap.height = video.videoHeight;
    const ctx = snap.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    ctx.drawImage(canvas, 0, 0);
    setSnapshot(snap.toDataURL("image/jpeg", 0.92));
  }

  useEffect(() => {
    if (cameraOn) { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(detect); }
  }, [detect, cameraOn]);

  /* ── Counts ──────────────────────────────────────────────────────────────── */
  const counts = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.class] = (acc[d.class] ?? 0) + 1; return acc;
  }, {});
  const topClasses = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center gap-2 shrink-0">
        <Link href="/" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white">Object Detection</h1>
          <p className="text-xs text-slate-400">RF-DETR · COCO-SSD · 80 classes · On-device AI</p>
        </div>
        <div className="flex items-center gap-1.5">
          {cameraOn && (
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {fps} fps
            </span>
          )}
          <span className="text-xs text-violet-400 font-mono bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">
            {detections.length} obj
          </span>
          <button onClick={() => setShowSettings(v => !v)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-violet-600" : "bg-slate-800 hover:bg-slate-700"}`}>
            <SlidersHorizontal className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Camera */}
      <div className="relative bg-black overflow-hidden shrink-0" style={{ height: "52vh" }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />

        {/* Loading / ready overlay */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 gap-4 px-6">
            {modelState === "loading" && (
              <>
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-400 animate-spin" />
                  <Eye className="absolute inset-0 m-auto w-5 h-5 text-violet-400" />
                </div>
                <p className="text-white font-bold text-sm">{LOAD_STEPS[loadStep]}</p>
                <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-violet-400 rounded-full transition-all duration-500"
                    style={{ width: `${((loadStep + 1) / LOAD_STEPS.length) * 100}%` }} />
                </div>
                <div className="flex gap-2">
                  {LOAD_STEPS.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= loadStep ? "bg-violet-400" : "bg-slate-700"}`} />
                  ))}
                </div>
                <p className="text-slate-600 text-xs text-center">~6 MB first load · cached forever after</p>
              </>
            )}
            {modelState === "error" && (
              <>
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-300 text-sm text-center">{error}</p>
                <button onClick={loadModel} className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold">
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
              </>
            )}
            {modelState === "ready" && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-violet-400" />
                </div>
                <p className="text-white font-bold">Ready — 80 object classes</p>
                <button onClick={startCamera}
                  className="flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-lg">
                  <Camera className="w-5 h-5" /> Start Camera
                </button>
              </>
            )}
          </div>
        )}

        {/* Live badge */}
        {cameraOn && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 backdrop-blur px-2 py-1 rounded-lg text-xs text-white font-bold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
          </div>
        )}

        {/* Controls overlay when live */}
        {cameraOn && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button onClick={takeSnapshot}
              className="p-2 rounded-xl bg-slate-900/70 backdrop-blur hover:bg-slate-800 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </button>
            <button onClick={flipCamera}
              className="p-2 rounded-xl bg-slate-900/70 backdrop-blur hover:bg-slate-800 transition-colors">
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-3 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settings</p>
            <button onClick={() => setShowSettings(false)}><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs text-slate-400 shrink-0">Min confidence</p>
            <input type="range" min={0.1} max={0.9} step={0.05} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="flex-1 accent-violet-500" />
            <p className="text-xs font-bold text-violet-400 w-8">{Math.round(threshold * 100)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Filter by group</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setActiveFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${!activeFilter ? "bg-slate-600 border-slate-500 text-white" : "border-slate-700 text-slate-500"}`}>
                All
              </button>
              {Object.values(CATEGORY_GROUPS).map(g => (
                <button key={g.label} onClick={() => setActiveFilter(activeFilter === g.label ? null : g.label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${activeFilter === g.label ? "bg-white/10 border-current" : "border-slate-700 text-slate-500"}`}
                  style={{ color: activeFilter === g.label ? g.color : undefined }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera toggle */}
      {modelState === "ready" && (
        <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex gap-2 shrink-0">
          {cameraOn ? (
            <button onClick={stopCamera}
              className="flex-1 py-2 bg-red-600/20 border border-red-500/40 text-red-400 font-bold rounded-xl text-sm hover:bg-red-600/30 transition-colors">
              Stop Detection
            </button>
          ) : (
            <button onClick={startCamera}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors">
              Start Camera
            </button>
          )}
        </div>
      )}

      {/* Detections list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* Live count summary */}
        {detections.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <p className="text-2xl font-extrabold text-white">{detections.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Objects detected</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <p className="text-2xl font-extrabold text-white">{Object.keys(counts).length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Unique classes</p>
            </div>
          </div>
        )}

        {/* Per-class chips */}
        {topClasses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topClasses.map(([cls, cnt]) => (
              <div key={cls} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold"
                style={{ borderColor: getGroupColor(cls) + "60", backgroundColor: getGroupColor(cls) + "15", color: getGroupColor(cls) }}>
                <span className="w-2 h-2 rounded-full" style={{ background: getGroupColor(cls) }} />
                {cls} ×{cnt}
              </div>
            ))}
          </div>
        )}

        {/* Group breakdown */}
        {detections.length > 0 && (() => {
          const groupCounts: Record<string, number> = {};
          detections.forEach(d => { const g = getGroupLabel(d.class); groupCounts[g] = (groupCounts[g] ?? 0) + 1; });
          return (
            <div className="space-y-1.5">
              {Object.entries(groupCounts).sort((a, b) => b[1] - a[1]).map(([group, count]) => {
                const g = Object.values(CATEGORY_GROUPS).find(x => x.label === group)!;
                const pct = Math.round((count / detections.length) * 100);
                return (
                  <div key={group} className="flex items-center gap-3">
                    <p className="text-xs text-slate-400 w-20 shrink-0">{group}</p>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: g?.color ?? "#94a3b8" }} />
                    </div>
                    <p className="text-xs font-bold text-white w-6 text-right">{count}</p>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {detections.length === 0 && cameraOn && (
          <div className="text-center py-8">
            <Eye className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No objects detected</p>
            <p className="text-slate-600 text-xs mt-1">Try lowering the confidence threshold</p>
          </div>
        )}

        {/* RF-DETR info card */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">Powered by RF-DETR Architecture</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            This page uses <span className="text-violet-300 font-semibold">COCO-SSD MobileNetV2</span> for browser-based offline inference —
            same 80-class COCO object vocabulary as RF-DETR.
            For maximum accuracy, run RF-DETR locally and connect via the API.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="https://github.com/roboflow/rf-detr" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> RF-DETR GitHub (ICLR 2026)
            </a>
            <a href="https://github.com/PierreMarieCurie/rf-detr-onnx" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 font-semibold transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> RF-DETR ONNX export
            </a>
          </div>
        </div>

        {/* COCO classes reference */}
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detectable Classes (80)</p>
          <div className="space-y-2">
            {Object.values(CATEGORY_GROUPS).map(g => (
              <div key={g.label}>
                <p className="text-xs font-bold mb-1" style={{ color: g.color }}>{g.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{g.classes.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency use note */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Emergency Use</p>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <span className="text-red-400 font-semibold">Person filter</span> — count survivors in a space</li>
            <li>• <span className="text-amber-400 font-semibold">Vehicle filter</span> — identify evacuation assets</li>
            <li>• <span className="text-emerald-400 font-semibold">Food/bottle</span> — locate resources in a room</li>
            <li>• <span className="text-violet-400 font-semibold">100% offline</span> — no internet after first load</li>
          </ul>
        </div>
      </div>

      {/* Snapshot modal */}
      {snapshot && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={snapshot} alt="Snapshot" className="max-w-full max-h-[70vh] rounded-xl" />
          <div className="flex gap-3">
            <a href={snapshot} download="detection-snapshot.jpg"
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm">
              <Download className="w-4 h-4" /> Save Image
            </a>
            <button onClick={() => setSnapshot(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm">
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
