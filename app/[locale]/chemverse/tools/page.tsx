import type { Metadata } from "next";
import MolarMassCalc from "@/components/chemverse/MolarMassCalc";
import EquationBalancer from "@/components/chemverse/EquationBalancer";
import { Calculator, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Chemistry Tools | ChemVerse",
  description: "Molar mass calculator and chemical equation balancer — all in the browser, no sign-in required.",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Chemistry Tools</h1>
            <p className="text-sm text-slate-400">Molar mass calculator and equation balancer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <MolarMassCalc />
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <EquationBalancer />
          </div>
        </div>

        <div className="mt-6 bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">How to use</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400">
            <div>
              <p className="font-semibold text-slate-300 mb-1">Molar Mass Calculator</p>
              <p>Enter a chemical formula like <code className="font-mono text-emerald-400 text-xs">Ca3(PO4)2</code> or <code className="font-mono text-emerald-400 text-xs">C6H12O6</code>. Supports nested parentheses and all 118 elements.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">Equation Balancer</p>
              <p>Enter reactants and products separated by <code className="font-mono text-violet-400 text-xs">-&gt;</code> or <code className="font-mono text-violet-400 text-xs">→</code>. Use <code className="font-mono text-violet-400 text-xs">+</code> between compounds, e.g. <code className="font-mono text-violet-400 text-xs">Fe + O2 -&gt; Fe2O3</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
