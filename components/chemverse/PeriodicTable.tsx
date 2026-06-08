"use client";

import { useState, useMemo } from "react";
import {
  ChemElement,
  ElementCategory,
  ELEMENTS,
  CATEGORY_COLORS,
} from "@/lib/chemverse/elements";

interface PeriodicTableProps {
  onElementClick?: (el: ChemElement) => void;
}

type GridCell = ChemElement | null;

type GridRow = GridCell[];

function buildMainGrid(): GridRow[] {
  const grid: GridRow[] = Array.from({ length: 7 }, () => Array(18).fill(null));

  for (const el of ELEMENTS) {
    if (el.period >= 1 && el.period <= 7 && el.group !== null) {
      const row = el.period - 1;
      const col = el.group - 1;
      if (
        (el.atomicNumber >= 57 && el.atomicNumber <= 71) ||
        (el.atomicNumber >= 89 && el.atomicNumber <= 103)
      ) {
        continue;
      }
      grid[row][col] = el;
    }
  }

  return grid;
}

function buildLanthanideRow(): GridCell[] {
  return ELEMENTS.filter(
    (el) => el.atomicNumber >= 57 && el.atomicNumber <= 71
  ).sort((a, b) => a.atomicNumber - b.atomicNumber);
}

function buildActinideRow(): GridCell[] {
  return ELEMENTS.filter(
    (el) => el.atomicNumber >= 89 && el.atomicNumber <= 103
  ).sort((a, b) => a.atomicNumber - b.atomicNumber);
}

const MAIN_GRID = buildMainGrid();
const LANTHANIDE_ROW = buildLanthanideRow();
const ACTINIDE_ROW = buildActinideRow();

const ALL_CATEGORIES: ElementCategory[] = [
  "nonmetal",
  "noble-gas",
  "alkali-metal",
  "alkaline-earth",
  "transition-metal",
  "post-transition",
  "metalloid",
  "halogen",
  "lanthanide",
  "actinide",
  "unknown",
];

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  "nonmetal": "Nonmetal",
  "noble-gas": "Noble Gas",
  "alkali-metal": "Alkali Metal",
  "alkaline-earth": "Alkaline Earth",
  "transition-metal": "Transition Metal",
  "post-transition": "Post-Transition",
  "metalloid": "Metalloid",
  "halogen": "Halogen",
  "lanthanide": "Lanthanide",
  "actinide": "Actinide",
  "unknown": "Unknown",
};

interface ElementCellProps {
  element: ChemElement;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

function ElementCell({ element, isSelected, isDimmed, onClick }: ElementCellProps) {
  const colors = CATEGORY_COLORS[element.category];

  return (
    <button
      onClick={onClick}
      title={`${element.name} (${element.atomicNumber})`}
      className="relative flex flex-col items-center justify-between w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded sm:rounded-md p-0.5 sm:p-1 transition-all duration-150 cursor-pointer focus:outline-none group overflow-hidden"
      style={{
        background: colors.bg,
        border: isSelected
          ? `2px solid ${colors.text}`
          : `1px solid ${colors.border}`,
        opacity: isDimmed ? 0.2 : 1,
        boxShadow: isSelected ? `0 0 0 2px ${colors.text}55` : undefined,
        transform: isDimmed ? undefined : undefined,
      }}
    >
      <span
        className="text-[7px] sm:text-[8px] leading-none tabular-nums self-start"
        style={{ color: colors.text, opacity: 0.75 }}
      >
        {element.atomicNumber}
      </span>

      <span
        className="text-[10px] sm:text-xs md:text-sm font-black leading-none"
        style={{ color: colors.text }}
      >
        {element.symbol}
      </span>

      <span
        className="hidden sm:block text-[6px] sm:text-[7px] leading-none truncate w-full text-center"
        style={{ color: colors.text, opacity: 0.65 }}
      >
        {element.name}
      </span>

      <span
        className="text-[5px] sm:text-[6px] leading-none self-end tabular-nums"
        style={{ color: colors.text, opacity: 0.55 }}
      >
        {element.atomicMass.toFixed(0)}
      </span>

      {!isDimmed && (
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 rounded sm:rounded-md pointer-events-none"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
      )}
    </button>
  );
}

function EmptyCell({ className }: { className?: string }) {
  return <div className={className ?? "w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-14 lg:h-14"} />;
}

export default function PeriodicTable({ onElementClick }: PeriodicTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">("all");
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  const matchingNumbers = useMemo<Set<number>>(() => {
    const q = search.trim().toLowerCase();
    const catFilter = selectedCategory !== "all";
    if (!q && !catFilter) return new Set(ELEMENTS.map((e) => e.atomicNumber));

    return new Set(
      ELEMENTS
        .filter((el) => {
          const categoryMatch = !catFilter || el.category === selectedCategory;
          if (!categoryMatch) return false;
          if (!q) return true;
          return (
            el.name.toLowerCase().includes(q) ||
            el.symbol.toLowerCase().includes(q) ||
            String(el.atomicNumber).startsWith(q)
          );
        })
        .map((e) => e.atomicNumber)
    );
  }, [search, selectedCategory]);

  function handleClick(el: ChemElement) {
    setSelectedElement(el.atomicNumber === selectedElement ? null : el.atomicNumber);
    onElementClick?.(el);
  }

  function renderCell(el: GridCell, key: string | number) {
    if (!el) return <EmptyCell key={key} />;
    return (
      <ElementCell
        key={el.atomicNumber}
        element={el}
        isSelected={selectedElement === el.atomicNumber}
        isDimmed={!matchingNumbers.has(el.atomicNumber)}
        onClick={() => handleClick(el)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM9.5 10.207l2.646 2.647"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search element, symbol, or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M10 3L3 10M3 3l7 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              selectedCategory === "all"
                ? "bg-slate-200 text-slate-900 border-slate-300"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const c = CATEGORY_COLORS[cat];
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(active ? "all" : cat)}
                className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                style={
                  active
                    ? { background: c.bg, color: c.text, border: `1px solid ${c.border}` }
                    : {
                        background: "transparent",
                        color: "rgb(148,163,184)",
                        border: "1px solid rgb(51,65,85)",
                      }
                }
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-0.5" style={{ minWidth: "max-content" }}>
          <div className="flex gap-0.5 items-center">
            <div className="flex gap-0.5">
              {Array.from({ length: 18 }, (_, colIdx) => {
                const colLabel = colIdx + 1;
                return (
                  <div
                    key={colIdx}
                    className="w-9 sm:w-11 md:w-13 lg:w-14 text-center text-[8px] sm:text-[9px] text-slate-600 font-semibold"
                  >
                    {colLabel}
                  </div>
                );
              })}
            </div>
          </div>

          {MAIN_GRID.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5 items-center">
              <div className="flex gap-0.5">
                {row.map((cell, colIdx) => renderCell(cell, `${rowIdx}-${colIdx}`))}
              </div>
            </div>
          ))}

          <div className="h-3" />

          <div className="flex gap-0.5 items-center pl-[calc(3*2.25rem+3*2px)] sm:pl-[calc(3*2.75rem+3*2px)] md:pl-[calc(3*3.25rem+3*2px)] lg:pl-[calc(3*3.5rem+3*2px)]">
            <span className="text-[8px] sm:text-[9px] text-slate-600 font-semibold mr-1 whitespace-nowrap w-20 text-right">
              57–71
            </span>
            <div className="flex gap-0.5">
              {LANTHANIDE_ROW.map((el) => renderCell(el, el!.atomicNumber))}
            </div>
          </div>

          <div className="flex gap-0.5 items-center pl-[calc(3*2.25rem+3*2px)] sm:pl-[calc(3*2.75rem+3*2px)] md:pl-[calc(3*3.25rem+3*2px)] lg:pl-[calc(3*3.5rem+3*2px)]">
            <span className="text-[8px] sm:text-[9px] text-slate-600 font-semibold mr-1 whitespace-nowrap w-20 text-right">
              89–103
            </span>
            <div className="flex gap-0.5">
              {ACTINIDE_ROW.map((el) => renderCell(el, el!.atomicNumber))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {ALL_CATEGORIES.map((cat) => {
          const c = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                opacity: selectedCategory !== "all" && selectedCategory !== cat ? 0.4 : 1,
              }}
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{ background: c.text }}
              />
              <span className="text-[10px] font-semibold" style={{ color: c.text }}>
                {CATEGORY_LABELS[cat]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
