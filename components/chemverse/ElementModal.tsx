"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChemElement, CATEGORY_COLORS } from "@/lib/chemverse/elements";
import BohrModel from "./BohrModel";

interface ElementModalProps {
  element: ChemElement | null;
  onClose: () => void;
}

function kelvinToCelsius(k: number | null): string {
  if (k === null) return "—";
  const c = k - 273.15;
  return `${c % 1 === 0 ? c.toFixed(0) : c.toFixed(1)} °C`;
}

function StatCell({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-800/60 border border-slate-700/40 px-4 py-3 min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-100 truncate">
        {value === null || value === undefined ? "—" : String(value)}
      </span>
    </div>
  );
}

const PHASE_ICON: Record<string, string> = {
  solid: "◼",
  liquid: "💧",
  gas: "💨",
  unknown: "?",
};

export default function ElementModal({ element, onClose }: ElementModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (element) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [element]);

  const colors = element ? CATEGORY_COLORS[element.category] : null;

  return (
    <AnimatePresence>
      {element && colors && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
        >
          <motion.div
            key="modal-card"
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
            style={{ border: `1.5px solid ${colors.border}` }}
            initial={{ opacity: 0, scale: 0.91, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 14 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all duration-150"
              aria-label="Close modal"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M11.5 3.5L3.5 11.5M3.5 3.5l8 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="px-6 pt-8 pb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                className="flex items-center justify-center w-28 h-28 rounded-2xl shrink-0 shadow-lg"
                style={{
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  boxShadow: `0 8px 32px ${colors.border}55`,
                }}
              >
                <span
                  className="font-black leading-none select-none"
                  style={{ fontSize: "3.25rem", color: colors.text }}
                >
                  {element.symbol}
                </span>
              </div>

              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">{element.name}</h2>
                  <span className="text-slate-400 text-xl font-semibold">#{element.atomicNumber}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {element.category.replace(/-/g, " ")}
                  </span>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {PHASE_ICON[element.phase]} {element.phase}
                  </span>

                  {element.radioactive && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-950/70 text-red-400 border border-red-800/60">
                      &#9762; Radioactive
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Group {element.group ?? "—"} &middot; Period {element.period}
                </p>
              </div>
            </div>

            <div className="px-6 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatCell label="Atomic Mass" value={`${element.atomicMass} u`} />
                <StatCell
                  label="Electronegativity"
                  value={
                    element.electronegativity !== null
                      ? `${element.electronegativity} (Pauling)`
                      : null
                  }
                />
                <StatCell label="Melting Point" value={kelvinToCelsius(element.meltingPoint)} />
                <StatCell label="Boiling Point" value={kelvinToCelsius(element.boilingPoint)} />
                <StatCell label="Discovery Year" value={element.discoveryYear} />
                <StatCell label="Discovered By" value={element.discoveredBy} />
              </div>
            </div>

            <div className="px-6 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">
                Electron Configuration
              </p>
              <div className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5">
                <code className="text-sm font-mono text-cyan-300 leading-relaxed break-all">
                  {element.electronConfiguration}
                </code>
              </div>
            </div>

            {element.oxidationStates.length > 0 && (
              <div className="px-6 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">
                  Oxidation States
                </p>
                <div className="flex flex-wrap gap-2">
                  {element.oxidationStates.map((state) => (
                    <span
                      key={state}
                      className="text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-200 tabular-nums"
                    >
                      {state > 0 ? `+${state}` : state === 0 ? "0" : state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 pb-5 flex flex-col items-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-4 self-start">
                Bohr Model
              </p>
              <div className="flex items-center justify-center w-full py-2">
                <BohrModel element={element} size={260} animate={true} />
              </div>
            </div>

            <div className="px-6 pb-8">
              <div className="rounded-2xl bg-slate-800/35 border border-slate-700/40 px-5 py-4">
                <p className="text-sm text-slate-300 leading-relaxed">{element.summary}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
