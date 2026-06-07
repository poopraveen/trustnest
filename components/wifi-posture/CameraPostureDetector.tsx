"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera, Users, Activity, Zap, AlertCircle,
  RotateCcw, ArrowLeft, Wifi, Eye, Loader2,
} from "lucide-react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type PostureLabel = "Standing" | "Sitting" | "Lying" | "Walking" | "Unknown";
type ModelState = "idle" | "loading" | "ready" | "error";

const LOAD_STEPS = [
  "Initialising TensorFlow.js…",
  "Loading WebGL backend…",
  "Downloading MoveNet model (~2 MB)…",
  "Warming up neural network…",
];

interface PersonResult {
  id: number;
  posture: PostureLabel;
  confidence: number;
  keypoints: { x: number; y: number; score: number; name: string }[];
}

/* ── Skeleton connections (MoveNet 17-keypoint pairs) ───────────────────────── */
const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4],          // head
  [5, 6],                                    // shoulders
  [5, 7], [7, 9],                            // left arm
  [6, 8], [8, 10],                           // right arm
  [5, 11], [6, 12],                          // torso sides
  [11, 12],                                  // hips
  [11, 13], [13, 15],                        // left leg
  [12, 14], [14, 16],                        // right leg
];

const KEYPOINT_COLORS: Record<string, string> = {
  nose: "#f59e0b",
  left_eye: "#f59e0b", right_eye: "#f59e0b",
  left_ear: "#f59e0b", right_ear: "#f59e0b",
  left_shoulder: "#22d3ee", right_shoulder: "#22d3ee",
  left_elbow: "#22d3ee", right_elbow: "#22d3ee",
  left_wrist: "#22d3ee", right_wrist: "#22d3ee",
  left_hip: "#a78bfa", right_hip: "#a78bfa",
  left_knee: "#a78bfa", right_knee: "#a78bfa",
  left_ankle: "#a78bfa", right_ankle: "#a78bfa",
};

/* ── Posture classifier ────────────────────────────────────────────────────── */
function classifyPosture(kps: { x: number; y: number; score: number; name: string }[]): PostureLabel {
  const get = (name: string) => kps.find(k => k.name === name);
  const nose      = get("nose");
  const lHip      = get("left_hip");
  const rHip      = get("right_hip");
  const lKnee     = get("left_knee");
  const rKnee     = get("right_knee");
  const lAnkle    = get("left_ankle");
  const rAnkle    = get("right_ankle");
  const lShoulder = get("left_shoulder");
  const rShoulder = get("right_shoulder");

  const visible = (p: typeof nose) => p && p.score > 0.3;
  if (!visible(nose) || !visible(lHip) || !visible(rHip)) return "Unknown";

  const hipY    = (lHip!.y + rHip!.y) / 2;
  const noseY   = nose!.y;

  // Lying: body is roughly horizontal (nose and hips close in Y)
  const bodySpanY = Math.abs(noseY - hipY);
  if (bodySpanY < 0.18) return "Lying";

  // Need ankles to distinguish sit vs stand
  if (!visible(lKnee) || !visible(rKnee)) return "Standing";
  const kneeY  = (lKnee!.y + rKnee!.y) / 2;

  // Sitting: knees at similar or higher Y than hips (bent)
  const kneeHipDelta = kneeY - hipY;
  if (kneeHipDelta < 0.10) return "Sitting";

  // Walking: asymmetric ankle positions
  if (visible(lAnkle) && visible(rAnkle)) {
    const ankleAsym = Math.abs(lAnkle!.y - rAnkle!.y);
    if (ankleAsym > 0.08) return "Walking";
  }

  // Shoulder check for sitting (hunched)
  if (visible(lShoulder) && visible(rShoulder)) {
    const shoulderY = (lShoulder!.y + rShoulder!.y) / 2;
    const torso = Math.abs(shoulderY - hipY);
    if (torso < 0.15 && kneeHipDelta < 0.18) return "Sitting";
  }

  return "Standing";
}

const POSTURE_META: Record<PostureLabel, { emoji: string; color: string; bg: string }> = {
  Standing: { emoji: "🧍", color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30" },
  Sitting:  { emoji: "🪑", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
  Lying:    { emoji: "🛏️", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  Walking:  { emoji: "🚶", color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/30" },
  Unknown:  { emoji: "❓", color: "text-slate-400",  bg: "bg-slate-700/40 border-slate-600/30" },
};

const PERSON_COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#f59e0b", "#f87171"];

/* ── Draw helpers ──────────────────────────────────────────────────────────── */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  kps: PersonResult["keypoints"],
  color: string,
  scaleX: number,
  scaleY: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  CONNECTIONS.forEach(([a, b]) => {
    const kpA = kps[a], kpB = kps[b];
    if (kpA?.score > 0.25 && kpB?.score > 0.25) {
      ctx.beginPath();
      ctx.moveTo(kpA.x * scaleX, kpA.y * scaleY);
      ctx.lineTo(kpB.x * scaleX, kpB.y * scaleY);
      ctx.stroke();
    }
  });

  kps.forEach(kp => {
    if (kp.score > 0.25) {
      const dotColor = KEYPOINT_COLORS[kp.name] ?? color;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(kp.x * scaleX, kp.y * scaleY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function CameraPostureDetector() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<{ estimatePoses: (v: HTMLVideoElement, cfg: object) => Promise<{ keypoints: { x: number; y: number; score: number; name: string }[]; score?: number }[]> } | null>(null);
  const rafRef     = useRef<number>(0);
  const streamRef  = useRef<MediaStream | null>(null);

  const [modelState, setModelState]   = useState<ModelState>("idle");
  const [loadStep, setLoadStep]       = useState(0);
  const [cameraOn, setCameraOn]       = useState(false);
  const [persons, setPersons]         = useState<PersonResult[]>([]);
  const [fps, setFps]                 = useState(0);
  const [facingMode, setFacingMode]   = useState<"environment" | "user">("environment");
  const [error, setError]             = useState("");
  const fpsCounterRef = useRef({ frames: 0, last: Date.now() });

  async function loadModel() {
    setModelState("loading");
    setLoadStep(0);
    setError("");
    try {
      setLoadStep(0);
      const tf = await import("@tensorflow/tfjs");

      setLoadStep(1);
      // Prefer WebGL for GPU acceleration; fall back to CPU (wasm) on Safari
      try {
        await import("@tensorflow/tfjs-backend-webgl" as never);
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();

      setLoadStep(2);
      const poseDetection = await import("@tensorflow-models/pose-detection");

      // SinglePose Lightning: ~1.5 MB, fast on mobile, sufficient for 1 person
      // MultiPose Lightning: ~3.5 MB, detects up to 5 people
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const modelType = isMobile
        ? poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        : poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING;

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType, enableTracking: true },
      );

      setLoadStep(3);
      // Warm-up: run a blank tensor so first real frame is instant
      const dummyVideo = document.createElement("canvas");
      dummyVideo.width = 192; dummyVideo.height = 192;
      await detector.estimatePoses(dummyVideo as unknown as HTMLVideoElement);

      detectorRef.current = detector as typeof detectorRef.current;
      setModelState("ready");
    } catch (e) {
      console.error(e);
      setModelState("error");
      setError(e instanceof Error ? e.message : "Failed to load model.");
    }
  }

  /* Load model on mount */
  useEffect(() => {
    loadModel();
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Detection loop */
  const detect = useCallback(async () => {
    const video    = videoRef.current;
    const canvas   = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const poses = await detector.estimatePoses(video, { maxPoses: 5, flipHorizontal: facingMode === "user" });

    const ctx = canvas.getContext("2d")!;
    canvas.width  = video.videoWidth  || canvas.offsetWidth;
    canvas.height = video.videoHeight || canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const results: PersonResult[] = poses.map((pose, idx) => {
      const kps = pose.keypoints.map(k => ({
        x: k.x / video.videoWidth,
        y: k.y / video.videoHeight,
        score: k.score ?? 0,
        name: k.name ?? "",
      }));

      drawSkeleton(ctx, kps, PERSON_COLORS[idx % PERSON_COLORS.length],
        canvas.width, canvas.height);

      const posture = classifyPosture(kps);
      const confidence = pose.score ?? (kps.reduce((s, k) => s + k.score, 0) / kps.length);

      // Label above head
      const nosePt = pose.keypoints.find(k => k.name === "nose");
      if (nosePt && (nosePt.score ?? 0) > 0.2) {
        const lx = nosePt.x * (canvas.width / video.videoWidth);
        const ly = nosePt.y * (canvas.height / video.videoHeight) - 16;
        ctx.font = "bold 13px system-ui";
        ctx.fillStyle = PERSON_COLORS[idx % PERSON_COLORS.length];
        ctx.textAlign = "center";
        ctx.fillText(`${POSTURE_META[posture].emoji} ${posture}`, lx, Math.max(ly, 12));
      }

      return { id: idx, posture, confidence, keypoints: kps };
    });

    setPersons(results);

    // FPS counter
    const c = fpsCounterRef.current;
    c.frames++;
    const now = Date.now();
    if (now - c.last >= 1000) {
      setFps(c.frames);
      c.frames = 0;
      c.last = now;
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [facingMode]);

  /* Start camera */
  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      rafRef.current = requestAnimationFrame(detect);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes("NotAllowed")
          ? "Camera permission denied. Please allow camera access in Safari Settings."
          : `Camera error: ${msg}`
      );
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) { video.srcObject = null; }
    setCameraOn(false);
    setPersons([]);
    setFps(0);
  }

  async function flipCamera() {
    stopCamera();
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    // restart after state update
    setTimeout(() => startCamera(), 100);
  }

  /* Re-run detect when facingMode changes */
  useEffect(() => {
    if (cameraOn) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(detect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detect]);

  const postureCount = persons.reduce<Record<PostureLabel, number>>((acc, p) => {
    acc[p.posture] = (acc[p.posture] ?? 0) + 1;
    return acc;
  }, {} as Record<PostureLabel, number>);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <Link href="/wifi-posture" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white">Live Camera Posture</h1>
          <p className="text-xs text-slate-400">iPhone 15 · TensorFlow.js MoveNet</p>
        </div>
        <div className="flex items-center gap-2">
          {cameraOn && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {fps} fps
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            <Users className="w-3 h-3" />
            {persons.length}
          </span>
        </div>
      </header>

      {/* Camera viewport */}
      <div className="relative flex-1 bg-black overflow-hidden" style={{ minHeight: "55vw", maxHeight: "60vh" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        />

        {/* Overlay: idle / loading / error / ready */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 gap-5 px-8">

            {modelState === "loading" && (
              <>
                {/* Animated icon */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>

                {/* Step label */}
                <div className="text-center">
                  <p className="text-white font-bold mb-1 text-sm">{LOAD_STEPS[loadStep]}</p>
                  <p className="text-slate-500 text-xs">Step {loadStep + 1} of {LOAD_STEPS.length}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${((loadStep + 1) / LOAD_STEPS.length) * 100}%` }}
                  />
                </div>

                {/* Step dots */}
                <div className="flex gap-2">
                  {LOAD_STEPS.map((s, i) => (
                    <div key={i} title={s}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < loadStep ? "bg-cyan-400" : i === loadStep ? "bg-cyan-400 animate-pulse" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-slate-600 text-xs text-center max-w-xs">
                  First visit downloads ~2 MB model. Subsequent visits load instantly from cache.
                </p>
              </>
            )}

            {modelState === "error" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold mb-2">Failed to load model</p>
                  <p className="text-red-300 text-xs leading-relaxed max-w-xs">{error}</p>
                </div>
                <button
                  onClick={loadModel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <p className="text-slate-600 text-xs text-center max-w-xs">
                  Make sure you have a stable internet connection for the first load.
                </p>
              </>
            )}

            {modelState === "ready" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg mb-1">Model Ready</p>
                  <p className="text-slate-400 text-sm">Point camera at people in your room</p>
                </div>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-7 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/40 text-sm"
                >
                  <Camera className="w-5 h-5" /> Start Camera
                </button>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> On-device AI</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> No data sent</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Live indicator */}
        {cameraOn && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur px-2 py-1 rounded-lg text-xs text-white font-bold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      {cameraOn ? (
        <div className="px-4 py-3 flex gap-3 bg-slate-950 border-t border-slate-800">
          <button
            onClick={stopCamera}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600/20 border border-red-500/40 text-red-400 font-bold rounded-xl hover:bg-red-600/30 transition-colors"
          >
            Stop
          </button>
          <button
            onClick={flipCamera}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Flip
          </button>
        </div>
      ) : (
        modelState === "ready" && !cameraOn && (
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800">
            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all"
            >
              <Camera className="w-5 h-5" /> Start Camera
            </button>
          </div>
        )
      )}

      {/* People cards */}
      <div className="px-4 py-4 space-y-3 flex-1 overflow-y-auto">

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700/60">
            <p className="text-2xl font-extrabold text-white">{persons.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">People</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700/60">
            <p className="text-2xl font-extrabold text-cyan-400">{fps}</p>
            <p className="text-xs text-slate-400 mt-0.5">FPS</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700/60">
            <p className="text-lg font-extrabold text-white">
              {persons.length > 0
                ? Object.entries(postureCount).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "—"
                : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Dominant</p>
          </div>
        </div>

        {/* Per-person cards */}
        {persons.length > 0 ? (
          <>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detected People</p>
            {persons.map((p, i) => {
              const meta = POSTURE_META[p.posture];
              const pct  = Math.round(p.confidence * 100);
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 ${meta.bg}`}
                  style={{ borderLeftColor: PERSON_COLORS[i % PERSON_COLORS.length], borderLeftWidth: 3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.emoji}</span>
                      <div>
                        <p className={`font-extrabold text-base ${meta.color}`}>{p.posture}</p>
                        <p className="text-xs text-slate-500">Person {i + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{pct}%</p>
                      <p className="text-xs text-slate-500">confidence</p>
                    </div>
                  </div>
                  {/* Confidence bar */}
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: PERSON_COLORS[i % PERSON_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : cameraOn ? (
          <div className="text-center py-10">
            <Eye className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No people detected yet.</p>
            <p className="text-slate-600 text-xs mt-1">Point camera at a person in the room.</p>
          </div>
        ) : null}

        {/* How it works note */}
        <div className="mt-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-cyan-500" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">About this mode</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            This uses your <span className="text-cyan-400 font-semibold">iPhone 15 camera + TensorFlow.js MoveNet</span> to detect 17 body keypoints in real time — entirely on-device. No data leaves your phone.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            For <span className="text-emerald-400 font-semibold">true WiFi sensing</span> (no camera, works through walls) see the <Link href="/wifi-posture" className="underline text-cyan-400">WiFi Posture</Link> page powered by RuView + ESP32 nodes.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 17 keypoints</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Up to 5 people</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> On-device AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
