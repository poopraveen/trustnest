"use client";

import { useState } from "react";
import { FlaskConical, Calculator, AlertCircle } from "lucide-react";

const ATOMIC_MASSES: Record<string, number> = {
  H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.811,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.180,
  Na:22.990,Mg:24.305,Al:26.982,Si:28.086,P:30.974,S:32.065,Cl:35.453,Ar:39.948,K:39.098,Ca:40.078,
  Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,
  Ga:69.723,Ge:72.630,As:74.922,Se:78.971,Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,
  Nb:92.906,Mo:95.96,Tc:98,Ru:101.07,Rh:102.906,Pd:106.42,Ag:107.868,Cd:112.411,In:114.818,Sn:118.710,
  Sb:121.760,Te:127.60,I:126.904,Xe:131.293,Cs:132.905,Ba:137.327,La:138.905,Ce:140.116,Pr:140.908,
  Nd:144.242,Pm:145,Sm:150.36,Eu:151.964,Gd:157.25,Tb:158.925,Dy:162.500,Ho:164.930,Er:167.259,
  Tm:168.934,Yb:173.054,Lu:174.967,Hf:178.49,Ta:180.948,W:183.84,Re:186.207,Os:190.23,Ir:192.217,
  Pt:195.084,Au:196.967,Hg:200.59,Tl:204.383,Pb:207.2,Bi:208.980,Po:209,At:210,Rn:222,Fr:223,Ra:226,
  Ac:227,Th:232.038,Pa:231.036,U:238.029,Np:237,Pu:244,Am:243,Cm:247,Bk:247,Cf:251,Es:252,Fm:257,
  Md:258,No:259,Lr:266,Rf:267,Db:268,Sg:269,Bh:270,Hs:277,Mt:278,Ds:281,Rg:282,Cn:285,
  Nh:286,Fl:289,Mc:290,Lv:293,Ts:294,Og:294,
};

interface Breakdown { symbol: string; count: number; mass: number; }

function parseFormula(formula: string): Breakdown[] | null {
  const stack: Record<string, number>[] = [{}];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === "(" || ch === "[") {
      stack.push({});
      i++;
    } else if (ch === ")" || ch === "]") {
      i++;
      let numStr = "";
      while (i < formula.length && /\d/.test(formula[i])) { numStr += formula[i++]; }
      const mult = numStr ? parseInt(numStr) : 1;
      const top = stack.pop();
      if (!top) return null;
      const current = stack[stack.length - 1];
      for (const [el, cnt] of Object.entries(top)) {
        current[el] = (current[el] ?? 0) + cnt * mult;
      }
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      while (i < formula.length && /[a-z]/.test(formula[i])) sym += formula[i++];
      if (!ATOMIC_MASSES[sym]) return null;
      let numStr = "";
      while (i < formula.length && /\d/.test(formula[i])) numStr += formula[i++];
      const cnt = numStr ? parseInt(numStr) : 1;
      const current = stack[stack.length - 1];
      current[sym] = (current[sym] ?? 0) + cnt;
    } else if (/\d/.test(ch)) {
      return null;
    } else {
      i++;
    }
  }
  if (stack.length !== 1) return null;
  return Object.entries(stack[0]).map(([symbol, count]) => ({
    symbol, count, mass: ATOMIC_MASSES[symbol] * count,
  })).sort((a, b) => a.symbol.localeCompare(b.symbol));
}

const EXAMPLES = ["H2O", "NaCl", "Ca3(PO4)2", "C6H12O6", "Fe2(SO4)3", "Al2(SO4)3", "CuSO4·5H2O".replace("·","")];

export default function MolarMassCalc() {
  const [formula, setFormula] = useState("H2O");
  const [result, setResult] = useState<Breakdown[] | null>(null);
  const [error, setError] = useState("");

  function calculate(f?: string) {
    const input = (f ?? formula).trim().replace(/\s/g, "");
    if (!input) { setResult(null); setError(""); return; }
    const parsed = parseFormula(input);
    if (!parsed) { setError("Invalid formula or unknown element"); setResult(null); return; }
    setError("");
    setResult(parsed);
    if (f) setFormula(f);
  }

  const totalMass = result ? result.reduce((s, b) => s + b.mass, 0) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5 text-emerald-400" />
        <h2 className="font-bold text-white text-lg">Molar Mass Calculator</h2>
      </div>

      <div>
        <div className="flex gap-2">
          <input value={formula} onChange={e => setFormula(e.target.value)}
            onKeyDown={e => e.key === "Enter" && calculate()}
            placeholder="Enter formula, e.g. Ca3(PO4)2"
            className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 text-white rounded-xl px-4 py-3 font-mono text-base outline-none placeholder-slate-500 transition-colors"
          />
          <button onClick={() => calculate()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            Calculate
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => calculate(ex)}
            className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 text-xs font-mono transition-all">
            {ex}
          </button>
        ))}
      </div>

      {result && result.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Molar Mass</p>
              <p className="text-3xl font-black text-white">
                {totalMass.toFixed(3)}
                <span className="text-lg text-slate-400 font-normal ml-1">g/mol</span>
              </p>
            </div>
            <FlaskConical className="w-8 h-8 text-emerald-400/50" />
          </div>
          <div className="p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Element Breakdown</p>
            <div className="space-y-2">
              {result.map(b => {
                const pct = (b.mass / totalMass) * 100;
                return (
                  <div key={b.symbol}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">{b.symbol}</span>
                        <span className="text-sm text-slate-300">×{b.count}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">{b.mass.toFixed(3)}</span>
                        <span className="text-xs text-slate-400 ml-1">g/mol</span>
                        <span className="text-xs text-slate-500 ml-2">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
