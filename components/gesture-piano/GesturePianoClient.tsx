"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera, Loader2, AlertCircle, RotateCcw, ArrowLeft,
  Volume2, VolumeX, ExternalLink, Hand, Music, Zap,
} from "lucide-react";
import Link from "next/link";

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Keypoint { x: number; y: number; name?: string }
interface DetectedHand { keypoints: Keypoint[]; handedness: string; score: number }
interface HandDetector {
  estimateHands: (video: HTMLVideoElement, config?: { staticImageMode?: boolean }) => Promise<DetectedHand[]>;
}
type ModelState = "idle" | "loading" | "ready" | "error";

/* ── Piano key layout — C4..D5, mapped left→right across the frame ──────────── */
const KEYS = [
  { note: "C4", freq: 261.63 },
  { note: "D4", freq: 293.66 },
  { note: "E4", freq: 329.63 },
  { note: "F4", freq: 349.23 },
  { note: "G4", freq: 392.0 },
  { note: "A4", freq: 440.0 },
  { note: "B4", freq: 493.88 },
  { note: "C5", freq: 523.25 },
  { note: "D5", freq: 587.33 },
];

/* 21-point MediaPipe hand skeleton connections */
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const LOAD_STEPS = [
  "Initialising TensorFlow.js…",
  "Loading WebGL backend…",
  "Downloading hand-tracking model (~12 MB)…",
  "Warming up detector…",
];


export default function GesturePianoClient() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<HandDetector | null>(null);
  const rafRef      = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);
  const fpsRef      = useRef({ frames: 0, last: Date.now() });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const handStateRef = useRef<{ column: number | null }[]>([]);

  const [modelState, setModelState] = useState<ModelState>("idle");
  const [loadStep, setLoadStep]     = useState(0);
  const [cameraOn, setCameraOn]     = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("user");
  const [fps, setFps]               = useState(0);
  const [muted, setMuted]           = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [handCount, setHandCount]   = useState(0);
  const [error, setError]           = useState("");
  const [debugCol, setDebugCol]     = useState<number | null>(null);
  const [noteCount, setNoteCount]   = useState(0);
  const [rawCount, setRawCount]     = useState(0);
  const [topScore, setTopScore]     = useState<number | null>(null);

  const mutedRef = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  /* ── Synth ──────────────────────────────────────────────────────────────── */
  const playNote = useCallback((index: number) => {
    if (mutedRef.current) return;
    const key = KEYS[index];
    if (!key) return;

    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.6, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(key.freq, now);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.72);

    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(key.freq * 2, now);
    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);
    overtone.start(now);
    overtone.stop(now + 0.52);

    setActiveKeys(prev => new Set(prev).add(index));
    setNoteCount(n => n + 1);
    setTimeout(() => {
      setActiveKeys(prev => { const next = new Set(prev); next.delete(index); return next; });
    }, 260);
  }, []);

  /* ── Load model ─────────────────────────────────────────────────────────── */
  async function loadModel() {
    setModelState("loading"); setLoadStep(0); setError("");
    try {
      setLoadStep(0);
      const tf = await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-converter");
      setLoadStep(1);
      try { await import("@tensorflow/tfjs-backend-webgl"); await tf.setBackend("webgl"); }
      catch { await tf.setBackend("cpu"); }
      await tf.ready();

      setLoadStep(2);
      const handPoseDetection = await import("@tensorflow-models/hand-pose-detection");
      const detector = await Promise.race([
        handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          { runtime: "tfjs", modelType: "full", maxHands: 2 }
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timed out downloading the hand-tracking model. Check your connection and retry.")), 20000)
        ),
      ]);

      setLoadStep(3);
      detectorRef.current = detector as unknown as HandDetector;
      setModelState("ready");
    } catch (e) {
      setModelState("error");
      setError(e instanceof Error ? e.message : "Failed to load model");
    }
  }

  useEffect(() => {
    loadModel();
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  /* ── Detection loop ──────────────────────────────────────────────────────── */
  const detect = useCallback(async () => {
    const video    = videoRef.current;
    const canvas   = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect); return;
    }

    try {
    // staticImageMode left at its default (true — re-detect every frame).
    // false enables ROI-based tracking between frames, which is smoother
    // but was producing NaN keypoints once the reused region degenerated
    // (hand near the frame edge, fast motion) — corrupting every frame
    // after, since the bad region kept getting reused for the next crop.
    // 0.75 turned out to reject real hands too (the model's own scores for
    // genuine hands aren't always that high) — 0.55 still screens out pure
    // noise-in-the-dark false positives without being so strict it drops
    // real detections.
    const rawHands = await detector.estimateHands(video);
    setRawCount(rawHands.length);
    setTopScore(rawHands.length > 0 ? Math.max(...rawHands.map(h => h.score)) : null);
    const hands = rawHands.filter(h => h.score > 0.55);

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const keyWidth = canvas.width / KEYS.length;

    // Key columns span the full frame — no need to reach a specific height,
    // any hand visible anywhere in view can play.
    for (let i = 1; i < KEYS.length; i++) {
      const x = i * keyWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.font = "bold 12px system-ui";
    ctx.fillStyle = "rgba(52, 211, 153, 0.7)";
    KEYS.forEach((k, i) => {
      ctx.fillText(k.note, i * keyWidth + keyWidth / 2 - 10, canvas.height - 8);
    });

    if (handStateRef.current.length !== hands.length) {
      handStateRef.current = hands.map(() => ({ column: null }));
    }

    hands.forEach((hand, hi) => {
      const color = hand.handedness === "Left" ? "#34d399" : "#22d3ee";

      // Skeleton
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      HAND_CONNECTIONS.forEach(([a, b]) => {
        const pa = hand.keypoints[a], pb = hand.keypoints[b];
        if (!pa || !pb) return;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });
      hand.keypoints.forEach(kp => {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Index fingertip = landmark 8 → strike detection
      const tip = hand.keypoints[8];
      // A degenerate tracking region can hand back NaN/Infinity coordinates;
      // KEYS[NaN] is undefined, so playNote would silently no-op forever.
      if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y) || keyWidth <= 0) return;

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.stroke();

      const column = Math.min(KEYS.length - 1, Math.max(0, Math.floor(tip.x / keyWidth)));
      const state = handStateRef.current[hi] ?? { column: null };

      if (state.column !== column) {
        playNote(column);
      }
      handStateRef.current[hi] = { column };
      if (hi === 0) setDebugCol(column);
    });

    setHandCount(hands.length);
    if (hands.length === 0) setDebugCol(null);

    const c = fpsRef.current;
    c.frames++;
    const now = Date.now();
    if (now - c.last >= 1000) { setFps(c.frames); c.frames = 0; c.last = now; }
    } catch (e) {
      // A single bad frame (WebGL hiccup, tensor GC, etc.) must never kill
      // the whole tracking loop — camera would stay live with gestures
      // silently frozen and no visible error.
      console.warn("Gesture Piano: frame skipped", e);
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [playNote]);

  /* ── Start / stop camera ──────────────────────────────────────────────────── */
  async function startCamera() {
    setError("");
    try {
      if (!audioCtxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctor();
      }
      // Must resume synchronously inside this click handler — Safari/iOS
      // keep the context permanently suspended if unlocked any later
      // (e.g. from the rAF detection loop), so notes would never play.
      audioCtxRef.current.resume().catch(() => {});
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
      setError(msg.includes("NotAllowed") ? "Camera permission denied. Allow camera access in your browser settings." : msg);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    handStateRef.current = [];
    setCameraOn(false); setHandCount(0); setFps(0);
  }

  async function flipCamera() {
    stopCamera();
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setTimeout(() => startCamera(), 120);
  }

  useEffect(() => {
    if (cameraOn) { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(detect); }
  }, [detect, cameraOn]);

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center gap-2 shrink-0">
        <Link href="/" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white">Gesture Piano</h1>
          <p className="text-xs text-slate-400">Hand-tracking · On-device AI · Web Audio synth</p>
        </div>
        <div className="flex items-center gap-1.5">
          {cameraOn && (
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {fps} fps
            </span>
          )}
          <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            <Hand className="w-3 h-3 inline -mt-0.5 mr-1" />{handCount}
          </span>
          <span className="text-xs text-fuchsia-400 font-mono bg-fuchsia-500/10 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
            ♪{noteCount}
          </span>
          <button onClick={() => playNote(5)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors">
            🔊 Test
          </button>
          <button onClick={() => setMuted(m => !m)}
            className={`p-2 rounded-lg transition-colors ${muted ? "bg-red-600" : "bg-slate-800 hover:bg-slate-700"}`}>
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* Camera */}
      <div className="relative bg-black overflow-hidden shrink-0" style={{ height: "52vh" }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" style={{ pointerEvents: "none" }} />

        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 gap-4 px-6">
            {modelState === "loading" && (
              <>
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" />
                  <Hand className="absolute inset-0 m-auto w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white font-bold text-sm">{LOAD_STEPS[loadStep]}</p>
                <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${((loadStep + 1) / LOAD_STEPS.length) * 100}%` }} />
                </div>
                <p className="text-slate-600 text-xs text-center">~12 MB first load · cached forever after</p>
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
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-white font-bold">Ready — wave your hand to play</p>
                {error && <p className="text-red-300 text-xs text-center">{error}</p>}
                <button onClick={startCamera}
                  className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg">
                  <Camera className="w-5 h-5" /> Start Camera
                </button>
              </>
            )}
          </div>
        )}

        {cameraOn && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 backdrop-blur px-2 py-1 rounded-lg text-xs text-white font-bold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
          </div>
        )}

        {cameraOn && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-mono text-emerald-300 leading-tight text-right">
            <div>raw:{rawCount} top:{topScore !== null ? topScore.toFixed(2) : "–"}</div>
            <div>col:{debugCol ?? "–"}</div>
          </div>
        )}

        {cameraOn && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button onClick={flipCamera}
              className="p-2 rounded-xl bg-slate-900/70 backdrop-blur hover:bg-slate-800 transition-colors">
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Camera toggle */}
      {modelState === "ready" && (
        <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex gap-2 shrink-0">
          {cameraOn ? (
            <button onClick={stopCamera}
              className="flex-1 py-2 bg-red-600/20 border border-red-500/40 text-red-400 font-bold rounded-xl text-sm hover:bg-red-600/30 transition-colors">
              Stop Camera
            </button>
          ) : (
            <button onClick={startCamera}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors">
              Start Camera
            </button>
          )}
        </div>
      )}

      {/* On-screen piano — also playable by click/tap */}
      <div className="px-3 py-3 shrink-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keyboard</p>
        <div className="flex gap-1 h-24">
          {KEYS.map((k, i) => (
            <button
              key={k.note}
              onClick={() => playNote(i)}
              className={`flex-1 rounded-lg border-2 flex items-end justify-center pb-2 text-xs font-bold transition-all ${
                activeKeys.has(i)
                  ? "bg-emerald-400 border-emerald-300 text-slate-900 scale-95"
                  : "bg-white border-slate-300 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {k.note}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">How it works</p>
          </div>
          <ul className="text-xs text-slate-400 leading-relaxed space-y-1.5">
            <li>• Start the camera and hold up to two hands anywhere in view — no need to reach a specific spot.</li>
            <li>• The frame is split into 9 <span className="text-emerald-300 font-semibold">columns</span>, one per note — move your index fingertip left/right across them.</li>
            <li>• A note plays whenever your fingertip crosses into a new column, like a floor piano.</li>
            <li>• Tap the on-screen keys directly if you'd rather not use the camera.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tech</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-2">
            <span className="text-slate-300 font-semibold">TensorFlow.js hand-pose-detection</span> (21-point MediaPipe hand
            landmarks, TFJS runtime) tracks fingertips fully on-device. Notes are synthesized live with the{" "}
            <span className="text-slate-300 font-semibold">Web Audio API</span> — no audio samples, no server round-trip.
          </p>
          <a href="https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 font-semibold transition-colors w-fit">
            <ExternalLink className="w-3.5 h-3.5" /> hand-pose-detection on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
