"use client";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0c1f3d]" />

      {/* Animated blobs */}
      <div
        className="absolute rounded-full blur-3xl opacity-30 animate-blob1"
        style={{
          width: 520,
          height: 520,
          top: "-120px",
          right: "-80px",
          background: "radial-gradient(circle, #f97316 0%, #fb923c 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-25 animate-blob2"
        style={{
          width: 420,
          height: 420,
          bottom: "-100px",
          left: "-60px",
          background: "radial-gradient(circle, #6366f1 0%, #818cf8 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-20 animate-blob3"
        style={{
          width: 300,
          height: 300,
          top: "30%",
          left: "35%",
          background: "radial-gradient(circle, #06b6d4 0%, #22d3ee 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-15 animate-blob4"
        style={{
          width: 240,
          height: 240,
          top: "10%",
          left: "20%",
          background: "radial-gradient(circle, #a855f7 0%, #c084fc 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-20 animate-blob5"
        style={{
          width: 350,
          height: 350,
          bottom: "5%",
          right: "20%",
          background: "radial-gradient(circle, #10b981 0%, #34d399 40%, transparent 70%)",
        }}
      />

      {/* Geometric floating shapes */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rotating ring top-right */}
        <circle
          cx="88%"
          cy="15%"
          r="60"
          fill="none"
          stroke="rgba(251,146,60,0.15)"
          strokeWidth="1.5"
          className="animate-spin-slow"
          style={{ transformOrigin: "88% 15%", transformBox: "fill-box" }}
        />
        <circle
          cx="88%"
          cy="15%"
          r="90"
          fill="none"
          stroke="rgba(251,146,60,0.08)"
          strokeWidth="1"
          className="animate-spin-slow-reverse"
          style={{ transformOrigin: "88% 15%", transformBox: "fill-box" }}
        />

        {/* Dashed ring bottom-left */}
        <circle
          cx="8%"
          cy="80%"
          r="70"
          fill="none"
          stroke="rgba(99,102,241,0.18)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          className="animate-spin-slow"
          style={{ transformOrigin: "8% 80%", transformBox: "fill-box" }}
        />

        {/* Floating triangle top-left */}
        <polygon
          points="80,0 140,100 20,100"
          fill="rgba(249,115,22,0.06)"
          stroke="rgba(249,115,22,0.12)"
          strokeWidth="1"
          transform="translate(40, 30)"
          className="animate-float1"
        />

        {/* Diamond center-right */}
        <polygon
          points="0,-40 30,0 0,40 -30,0"
          fill="rgba(6,182,212,0.07)"
          stroke="rgba(6,182,212,0.14)"
          strokeWidth="1"
          transform="translate(92%, 55%)"
          className="animate-float2"
        />

        {/* Small cross / plus bottom-right */}
        <g className="animate-float3" transform="translate(75%, 75%)">
          <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(168,85,247,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(168,85,247,0.25)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Dots grid */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={`${8 + col * 12}%`}
              cy={`${15 + row * 18}%`}
              r="1.2"
              fill="rgba(255,255,255,0.06)"
            />
          ))
        )}
      </svg>

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-40px, 30px) scale(1.08); }
          66%       { transform: translate(20px, -20px) scale(0.94); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(50px, -30px) scale(1.1); }
          66%       { transform: translate(-20px, 40px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-30px, 20px) scale(1.06); }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(25px, 35px) scale(1.12); }
          80%       { transform: translate(-15px, -10px) scale(0.9); }
        }
        @keyframes blob5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -25px) scale(1.07); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(40px, 30px) translateY(0);   opacity: 0.6; }
          50%       { transform: translate(40px, 30px) translateY(-18px); opacity: 0.9; }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(92%, 55%) translateY(0) rotate(0deg); }
          50%       { transform: translate(92%, 55%) translateY(-14px) rotate(20deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(75%, 75%) rotate(0deg); }
          50%       { transform: translate(75%, 75%) rotate(90deg) translateY(-8px); }
        }
        .animate-blob1 { animation: blob1 14s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 18s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 12s ease-in-out infinite; }
        .animate-blob4 { animation: blob4 16s ease-in-out infinite; }
        .animate-blob5 { animation: blob5 20s ease-in-out infinite; }
        .animate-spin-slow         { animation: spinSlow 30s linear infinite; }
        .animate-spin-slow-reverse { animation: spinSlowReverse 25s linear infinite; }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
        .animate-float3 { animation: float3 7s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
