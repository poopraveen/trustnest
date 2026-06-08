"use client";

import { useState } from "react";
import { FlaskConical, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface ParsedSide {
  compounds: { formula: string; coeff: number }[];
}

function parseCompound(formula: string): Record<string, number> | null {
  const result: Record<string, number> = {};
  let i = 0;
  const stack: Record<string, number>[] = [{}];
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === "(" || ch === "[") { stack.push({}); i++; }
    else if (ch === ")" || ch === "]") {
      i++;
      let ns = ""; while (i < formula.length && /\d/.test(formula[i])) ns += formula[i++];
      const mult = ns ? parseInt(ns) : 1;
      const top = stack.pop()!;
      const cur = stack[stack.length - 1];
      for (const [el, cnt] of Object.entries(top)) cur[el] = (cur[el] ?? 0) + cnt * mult;
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch; i++;
      while (i < formula.length && /[a-z]/.test(formula[i])) sym += formula[i++];
      let ns = ""; while (i < formula.length && /\d/.test(formula[i])) ns += formula[i++];
      const cnt = ns ? parseInt(ns) : 1;
      const cur = stack[stack.length - 1];
      cur[sym] = (cur[sym] ?? 0) + cnt;
    } else { i++; }
  }
  if (stack.length !== 1) return null;
  Object.assign(result, stack[0]);
  return result;
}

function parseSide(side: string): ParsedSide | null {
  const parts = side.split("+").map(s => s.trim()).filter(Boolean);
  const compounds: { formula: string; coeff: number }[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)?\s*([A-Za-z0-9()[\]]+)$/);
    if (!m) return null;
    compounds.push({ formula: m[2], coeff: m[1] ? parseInt(m[1]) : 1 });
  }
  return { compounds };
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b); }

function balanceEquation(equation: string): string | null {
  const arrow = equation.includes("->") ? "->" : equation.includes("→") ? "→" : "=";
  const [lhs, rhs] = equation.split(arrow).map(s => s.trim());
  if (!lhs || !rhs) return null;
  const leftSide = parseSide(lhs);
  const rightSide = parseSide(rhs);
  if (!leftSide || !rightSide) return null;

  const allCompounds = [...leftSide.compounds, ...rightSide.compounds];
  const elementSet = new Set<string>();
  for (const { formula } of allCompounds) {
    const parsed = parseCompound(formula);
    if (!parsed) return null;
    Object.keys(parsed).forEach(el => elementSet.add(el));
  }
  const elements = Array.from(elementSet);
  const n = allCompounds.length;
  const m = elements.length;

  // Gaussian elimination to find null space (integer coefficients)
  // Build matrix: rows = elements, cols = compounds (left positive, right negative)
  const matrix: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let c = 0; c < n; c++) {
    const isRight = c >= leftSide.compounds.length;
    const parsed = parseCompound(allCompounds[c].formula);
    if (!parsed) return null;
    for (let r = 0; r < m; r++) {
      const cnt = parsed[elements[r]] ?? 0;
      matrix[r][c] = isRight ? -cnt : cnt;
    }
  }

  // Augment and row-reduce over rationals
  const aug = matrix.map(row => [...row, 0]);
  const pivotCols: number[] = [];
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let pivotRow = -1;
    for (let r = row; r < m; r++) {
      if (aug[r][col] !== 0) { pivotRow = r; break; }
    }
    if (pivotRow === -1) continue;
    [aug[row], aug[pivotRow]] = [aug[pivotRow], aug[row]];
    pivotCols.push(col);
    const pv = aug[row][col];
    for (let r = 0; r < m; r++) {
      if (r !== row && aug[r][col] !== 0) {
        const factor = aug[r][col] / pv;
        for (let c = 0; c <= n; c++) aug[r][c] -= factor * aug[row][c];
      }
    }
    row++;
  }

  // Free variables: set last free to 1
  const freeCols = Array.from({ length: n }, (_, i) => i).filter(c => !pivotCols.includes(c));
  if (freeCols.length === 0) return null;
  const freeVar = freeCols[freeCols.length - 1];
  const coeffs: number[] = Array(n).fill(0);
  coeffs[freeVar] = 1;
  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const pc = pivotCols[i];
    let sum = 0;
    for (let c = pc + 1; c < n; c++) sum += aug[i][c] * coeffs[c];
    coeffs[pc] = -sum / aug[i][pc];
  }

  // Convert to integers
  let denomLcm = 1;
  for (const c of coeffs) {
    const parts = c.toString().split(".");
    if (parts[1]) denomLcm = lcm(denomLcm, Math.pow(10, parts[1].length));
  }
  const intCoeffs = coeffs.map(c => Math.round(c * denomLcm));
  const g = intCoeffs.reduce((a, b) => gcd(Math.abs(a), Math.abs(b)));
  const final = intCoeffs.map(c => c / g);
  if (final.some(c => c <= 0)) return null;

  const fmtSide = (comps: { formula: string; coeff: number }[], offset: number) =>
    comps.map(({ formula }, i) => {
      const c = final[offset + i];
      return c === 1 ? formula : `${c}${formula}`;
    }).join(" + ");

  return `${fmtSide(leftSide.compounds, 0)} → ${fmtSide(rightSide.compounds, leftSide.compounds.length)}`;
}

const EXAMPLES = [
  "H2 + O2 -> H2O",
  "Fe + O2 -> Fe2O3",
  "CH4 + O2 -> CO2 + H2O",
  "NaOH + HCl -> NaCl + H2O",
  "Al + O2 -> Al2O3",
  "C3H8 + O2 -> CO2 + H2O",
];

export default function EquationBalancer() {
  const [input, setInput] = useState("Fe + O2 -> Fe2O3");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  function balance(eq?: string) {
    const eqStr = (eq ?? input).trim();
    if (!eqStr) { setResult(null); setError(""); return; }
    try {
      const balanced = balanceEquation(eqStr);
      if (!balanced) { setError("Could not balance — check your equation format"); setResult(null); return; }
      setError("");
      setResult(balanced);
      if (eq) setInput(eq);
    } catch {
      setError("Invalid equation format");
      setResult(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical className="w-5 h-5 text-violet-400" />
        <h2 className="font-bold text-white text-lg">Equation Balancer</h2>
      </div>

      <div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && balance()}
            placeholder="e.g. Fe + O2 -> Fe2O3"
            className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-violet-500 text-white rounded-xl px-4 py-3 font-mono text-base outline-none placeholder-slate-500 transition-colors"
          />
          <button
            onClick={() => balance()}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
          >
            Balance
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 ml-1">Use {'"->", "→"'} between reactants and products. Separate compounds with {'"+"'}.</p>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => balance(ex)}
            className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500/50 text-xs font-mono transition-all">
            {ex}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Balanced Equation</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {result.split("→").map((side, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <ArrowRight className="w-5 h-5 text-violet-400 shrink-0" />}
                <div className="flex flex-wrap gap-2">
                  {side.trim().split("+").map((comp, j) => (
                    <span key={j} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-white text-sm">
                      {comp.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">{result}</p>
        </div>
      )}
    </div>
  );
}
