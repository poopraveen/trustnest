"use client";

export default function GovHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient — deep forest green matching navbar green-800 identity */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 35%, #166534 65%, #15803d 100%)" }} />

      {/* ── Animated colour blobs ──────────────────────────────────── */}

      {/* Blob 1 — Amber/gold (top-right) — government saffron warmth */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 480, height: 480,
          top: "-100px", right: "-60px",
          background: "radial-gradient(circle, #d97706 0%, #f59e0b 40%, transparent 70%)",
          opacity: 0.22,
          animation: "govBlob1 16s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — Emerald (bottom-left) — lush government green */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 440, height: 440,
          bottom: "-90px", left: "-50px",
          background: "radial-gradient(circle, #059669 0%, #10b981 40%, transparent 70%)",
          opacity: 0.25,
          animation: "govBlob2 20s ease-in-out infinite",
        }}
      />

      {/* Blob 3 — Teal (centre) — cool complementary */}
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          width: 320, height: 320,
          top: "25%", left: "38%",
          background: "radial-gradient(circle, #0d9488 0%, #14b8a6 40%, transparent 70%)",
          opacity: 0.18,
          animation: "govBlob3 14s ease-in-out infinite",
        }}
      />

      {/* Blob 4 — Yellow-green (top-left) — vibrancy without losing character */}
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          width: 260, height: 260,
          top: "8%", left: "18%",
          background: "radial-gradient(circle, #16a34a 0%, #22c55e 40%, transparent 70%)",
          opacity: 0.16,
          animation: "govBlob4 18s ease-in-out infinite",
        }}
      />

      {/* Blob 5 — Gold (bottom-right) — anchor warmth at footer */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 360, height: 360,
          bottom: "8%", right: "18%",
          background: "radial-gradient(circle, #b45309 0%, #d97706 40%, transparent 70%)",
          opacity: 0.18,
          animation: "govBlob5 22s ease-in-out infinite",
        }}
      />

      {/* ── Decorative SVG rings & shapes ─────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Spinning solid ring — top-right */}
        <circle
          cx="92%" cy="14%"
          r="55"
          fill="none"
          stroke="rgba(245,158,11,0.18)"
          strokeWidth="1.5"
          style={{ transformOrigin: "92% 14%", transformBox: "fill-box", animation: "govSpinCW 28s linear infinite" }}
        />
        <circle
          cx="92%" cy="14%"
          r="82"
          fill="none"
          stroke="rgba(245,158,11,0.09)"
          strokeWidth="1"
          style={{ transformOrigin: "92% 14%", transformBox: "fill-box", animation: "govSpinCCW 22s linear infinite" }}
        />

        {/* Dashed ring — bottom-left */}
        <circle
          cx="7%" cy="82%"
          r="64"
          fill="none"
          stroke="rgba(20,184,166,0.20)"
          strokeWidth="1.5"
          strokeDasharray="9 6"
          style={{ transformOrigin: "7% 82%", transformBox: "fill-box", animation: "govSpinCW 32s linear infinite" }}
        />
        <circle
          cx="7%" cy="82%"
          r="96"
          fill="none"
          stroke="rgba(20,184,166,0.10)"
          strokeWidth="1"
          strokeDasharray="5 8"
          style={{ transformOrigin: "7% 82%", transformBox: "fill-box", animation: "govSpinCCW 26s linear infinite" }}
        />

        {/* Floating triangle — top-left area */}
        <polygon
          points="0,-38 32,19 -32,19"
          fill="rgba(245,158,11,0.07)"
          stroke="rgba(245,158,11,0.16)"
          strokeWidth="1"
          transform="translate(100,60)"
          style={{ animation: "govFloat1 7s ease-in-out infinite" }}
        />

        {/* Floating diamond — centre-right */}
        <polygon
          points="0,-36 28,0 0,36 -28,0"
          fill="rgba(20,184,166,0.07)"
          stroke="rgba(20,184,166,0.16)"
          strokeWidth="1"
          style={{ animation: "govFloat2 9s ease-in-out infinite", transformOrigin: "85% 52%", transformBox: "fill-box", transform: "translate(85%, 52%)" }}
        />

        {/* Floating plus / cross — bottom-right cluster */}
        <g style={{ animation: "govFloat3 8s ease-in-out infinite", transformOrigin: "76% 76%", transformBox: "fill-box", transform: "translate(76%, 76%)" }}>
          <line x1="-13" y1="0" x2="13" y2="0" stroke="rgba(134,239,172,0.28)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="-13" x2="0" y2="13" stroke="rgba(134,239,172,0.28)" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Small hexagon outline — mid-left */}
        <polygon
          points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
          fill="none"
          stroke="rgba(245,158,11,0.14)"
          strokeWidth="1"
          style={{ animation: "govFloat1 11s ease-in-out infinite reverse", transformOrigin: "12% 50%", transformBox: "fill-box", transform: "translate(12%, 50%)" }}
        />

        {/* Subtle dot grid */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={`${6 + col * 11}%`}
              cy={`${12 + row * 20}%`}
              r="1.1"
              fill="rgba(255,255,255,0.055)"
            />
          ))
        )}
      </svg>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Keyframe definitions ──────────────────────────────────── */}
      <style>{`
        @keyframes govBlob1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-35px,28px) scale(1.07); }
          66%      { transform: translate(18px,-18px) scale(0.94); }
        }
        @keyframes govBlob2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(42px,-26px) scale(1.10); }
          70%      { transform: translate(-16px,36px) scale(0.92); }
        }
        @keyframes govBlob3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-28px,18px) scale(1.06); }
        }
        @keyframes govBlob4 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(22px,30px) scale(1.11); }
          80%      { transform: translate(-12px,-8px) scale(0.91); }
        }
        @keyframes govBlob5 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(26px,-22px) scale(1.08); }
        }
        @keyframes govSpinCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes govSpinCCW { from { transform: rotate(360deg); } to { transform: rotate(0deg);    } }
        @keyframes govFloat1 {
          0%,100% { transform: translate(100px,60px) translateY(0) rotate(0deg);   opacity:.7; }
          50%      { transform: translate(100px,60px) translateY(-16px) rotate(10deg); opacity:1; }
        }
        @keyframes govFloat2 {
          0%,100% { transform: translate(85%,52%) translateY(0) rotate(0deg); }
          50%      { transform: translate(85%,52%) translateY(-12px) rotate(18deg); }
        }
        @keyframes govFloat3 {
          0%,100% { transform: translate(76%,76%) rotate(0deg); }
          50%      { transform: translate(76%,76%) rotate(90deg) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
