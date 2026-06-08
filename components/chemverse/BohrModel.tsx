"use client";

import { ChemElement } from "@/lib/chemverse/elements";

interface BohrModelProps {
  element: ChemElement;
  size?: number;
  animate?: boolean;
}

const MAX_SHELLS = 6;
const MAX_ELECTRONS_VISIBLE = 12;

const ORBIT_DURATIONS_S = [3.2, 5.0, 7.2, 9.8, 13.0, 17.0];

function getNucleusRadius(atomicNumber: number, size: number): number {
  const base = size * 0.055;
  const extra = Math.log(atomicNumber + 1) * size * 0.012;
  return Math.min(base + extra, size * 0.13);
}

function getShellRadius(shellIndex: number, totalShells: number, size: number): number {
  const cx = size / 2;
  const nucleusR = getNucleusRadius(118, size);
  const minR = nucleusR + cx * 0.18;
  const maxR = cx - size * 0.06;
  if (totalShells === 1) return (minR + maxR) / 2;
  return minR + (shellIndex / (totalShells - 1)) * (maxR - minR);
}

export default function BohrModel({ element, size = 300, animate = false }: BohrModelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const shells = element.shells.slice(0, MAX_SHELLS);
  const nucleusR = getNucleusRadius(element.atomicNumber, size);
  const symbolFontSize = Math.max(nucleusR * 0.78, size * 0.038);
  const numberFontSize = Math.max(nucleusR * 0.42, size * 0.02);
  const electronDotR = Math.max(size * 0.013, 2.5);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`bohr-nucleus-${element.atomicNumber}`} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <filter id={`bohr-nglow-${element.atomicNumber}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={nucleusR * 0.35} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`bohr-eglow-${element.atomicNumber}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation={electronDotR * 0.8} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {shells.map((electronCount, shellIdx) => {
        const orbitR = getShellRadius(shellIdx, shells.length, size);
        const durationS = ORBIT_DURATIONS_S[shellIdx] ?? 20;
        const direction = shellIdx % 2 === 0 ? "cw" : "ccw";
        const visible = Math.min(electronCount, MAX_ELECTRONS_VISIBLE);
        const extra = electronCount - visible;

        return (
          <g key={shellIdx}>
            <circle
              cx={cx}
              cy={cy}
              r={orbitR}
              fill="none"
              stroke="rgba(34,211,238,0.22)"
              strokeWidth={Math.max(size * 0.003, 1)}
              strokeDasharray={`${size * 0.018} ${size * 0.009}`}
            />

            <g
              style={
                animate
                  ? {
                      transformOrigin: `${cx}px ${cy}px`,
                      animation: `bohr-${direction} ${durationS}s linear infinite`,
                    }
                  : undefined
              }
            >
              {Array.from({ length: visible }).map((_, eIdx) => {
                const isOverflowSlot = extra > 0 && eIdx === visible - 1;
                const angle = (2 * Math.PI * eIdx) / visible - Math.PI / 2;
                const ex = cx + orbitR * Math.cos(angle);
                const ey = cy + orbitR * Math.sin(angle);

                if (isOverflowSlot) {
                  return (
                    <g key={eIdx}>
                      <circle
                        cx={ex}
                        cy={ey}
                        r={electronDotR * 2.2}
                        fill="rgba(34,211,238,0.12)"
                        stroke="rgba(34,211,238,0.5)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={ex}
                        y={ey}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={electronDotR * 1.5}
                        fill="#67e8f9"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        +{extra + 1}
                      </text>
                    </g>
                  );
                }

                return (
                  <g key={eIdx} filter={`url(#bohr-eglow-${element.atomicNumber})`}>
                    <circle cx={ex} cy={ey} r={electronDotR * 1.8} fill="rgba(186,230,253,0.1)" />
                    <circle cx={ex} cy={ey} r={electronDotR} fill="white" opacity={0.92} />
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r={nucleusR * 1.4}
        fill="rgba(251,191,36,0.08)"
        filter={`url(#bohr-nglow-${element.atomicNumber})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={nucleusR}
        fill={`url(#bohr-nucleus-${element.atomicNumber})`}
        stroke="rgba(251,191,36,0.55)"
        strokeWidth={Math.max(size * 0.003, 1)}
      />

      <text
        x={cx}
        y={cy - nucleusR * 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(28,14,0,0.88)"
        fontSize={symbolFontSize}
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {element.symbol}
      </text>
      <text
        x={cx}
        y={cy + nucleusR * 0.55}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(28,14,0,0.65)"
        fontSize={numberFontSize}
        fontWeight="700"
        fontFamily="monospace"
      >
        {element.atomicNumber}
      </text>

      {animate && (
        <style>{`
          @keyframes bohr-cw {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes bohr-ccw {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
        `}</style>
      )}
    </svg>
  );
}
