"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu, Sparkles, Plus, X, ChevronDown, ChevronUp,
  Loader2, Code2, Lightbulb, AlertCircle, ShoppingCart, Zap
} from "lucide-react";
import { PRODUCTS } from "@/lib/majestor/products";
import { Product } from "@/lib/majestor/types";
import { useCartStore } from "@/lib/majestor/store";
import { formatPrice } from "@/lib/majestor/utils";

interface Project {
  id: string;
  title: string;
  tagline: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  description: string;
  steps: string[];
  wiring: string;
  codeSnippet: string;
  codeLanguage: string;
  missingComponents: string[];
  useCases: string[];
}

interface WorkshopResult {
  projects: Project[];
  tip: string;
}

const DIFFICULTY_COLOR = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function WorkshopPage() {
  const [selected, setSelected] = useState<Product[]>([]);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkshopResult | null>(null);
  const [error, setError] = useState("");
  const [expandedProject, setExpandedProject] = useState<string | null>("1");
  const [showCode, setShowCode] = useState<string | null>(null);
  const cartItems = useCartStore(s => s.items);
  const addItem = useCartStore(s => s.addItem);
  const resultRef = useRef<HTMLDivElement>(null);

  // Pre-populate from cart
  useEffect(() => {
    if (cartItems.length > 0 && selected.length === 0) {
      setSelected(cartItems.map(i => i.product));
    }
  }, [cartItems]);

  function toggleProduct(product: Product) {
    setSelected(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }

  async function generate() {
    if (selected.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/majestor/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          components: selected.map(p => ({ name: p.name, tags: p.tags })),
          goal,
          experience,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setResult(data);
      } else {
        // SSE streaming
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ") && !line.includes("[DONE]")) {
              try { full += JSON.parse(line.slice(6)).text ?? ""; } catch { /* skip */ }
            }
          }
        }
        const parsed = JSON.parse(full);
        setResult(parsed);
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not generate projects. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  }

  const allInStock = PRODUCTS.filter(p => p.inStock);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 text-[#00e5a0] text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Electronics Workshop
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Build Something{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5a0] to-[#00bfff]">Amazing</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Select your components below — our AI designs a complete product with schematics, code, and step-by-step instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Component selector + settings */}
        <div className="lg:col-span-1 space-y-5">

          {/* Selected components */}
          <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00e5a0]" />
                Your Components
              </p>
              <span className="text-xs text-slate-500">{selected.length} selected</span>
            </div>

            {selected.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">Select components from the list below →</p>
            ) : (
              <div className="space-y-2">
                {selected.map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 p-2 bg-[#00e5a0]/5 border border-[#00e5a0]/15 rounded-xl">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                    </div>
                    <p className="text-white text-xs font-medium flex-1 leading-tight line-clamp-2">{p.name}</p>
                    <button onClick={() => toggleProduct(p)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal + Experience */}
          <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Project Goal <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. home automation, security camera, robot…"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#00e5a0]/40 placeholder-slate-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Experience Level</label>
              <div className="flex gap-2">
                {["Beginner", "Intermediate", "Advanced"].map(lvl => (
                  <button key={lvl}
                    onClick={() => setExperience(lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      experience === lvl
                        ? "bg-[#00e5a0]/15 border-[#00e5a0]/40 text-[#00e5a0]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={selected.length === 0 || loading}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-sm transition-all ${
              selected.length > 0 && !loading
                ? "bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10]"
                : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
            }`}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Designing your project…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Projects ({selected.length} components)</>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Right: Product picker */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available Components</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {allInStock.map(product => {
              const isSelected = selected.find(p => p.id === product.id);
              return (
                <button key={product.id}
                  onClick={() => toggleProduct(product)}
                  className={`relative flex flex-col gap-2 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#00e5a0]/10 border-[#00e5a0]/50 shadow-[0_0_15px_rgba(0,229,160,0.1)]"
                      : "bg-[#0d1117] border-white/8 hover:border-white/20"
                  }`}>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/5">
                    <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#00e5a0]/20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#00e5a0] flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#0a0c10]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">{product.name}</p>
                  <p className={`text-[10px] font-bold ${isSelected ? "text-[#00e5a0]" : "text-slate-400"}`}>
                    {formatPrice(product.salePrice)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#00e5a0]/15 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-[#00e5a0]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Your Project Ideas</h2>
              <p className="text-slate-400 text-sm">3 projects designed for your {selected.length} components</p>
            </div>
          </div>

          {result.tip && (
            <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl mb-6 text-sm">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200"><span className="font-bold">Pro tip:</span> {result.tip}</p>
            </div>
          )}

          <div className="space-y-4">
            {result.projects.map((project, idx) => {
              const isExpanded = expandedProject === project.id;
              return (
                <div key={project.id}
                  className={`bg-[#0d1117] border rounded-2xl overflow-hidden transition-all ${
                    isExpanded ? "border-[#00e5a0]/30" : "border-white/8"
                  }`}>
                  {/* Header */}
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/2 transition-colors"
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                    <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/10 border border-[#00e5a0]/20 flex items-center justify-center shrink-0 font-black text-[#00e5a0]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-black text-base">{project.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[project.difficulty]}`}>
                          {project.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-500">⏱ {project.estimatedTime}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{project.tagline}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {/* Body */}
                  {isExpanded && (
                    <div className="px-5 pb-6 space-y-5 border-t border-white/5">
                      <p className="text-slate-300 text-sm leading-relaxed pt-4">{project.description}</p>

                      {/* Steps */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Build Steps</p>
                        <ol className="space-y-2">
                          {project.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-[#00e5a0]/15 text-[#00e5a0] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Wiring */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Wiring Diagram</p>
                        <pre className="bg-black/40 border border-white/8 rounded-xl p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {project.wiring}
                        </pre>
                      </div>

                      {/* Code */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" />
                            {project.codeLanguage === "arduino" ? "Arduino Code" : "MicroPython Code"}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(project.codeSnippet);
                            }}
                            className="text-[10px] text-slate-500 hover:text-[#00e5a0] transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="bg-black/60 border border-white/8 rounded-xl p-4 text-xs text-green-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-64">
                          {project.codeSnippet}
                        </pre>
                      </div>

                      {/* Missing + Use cases */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.missingComponents.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Also Need</p>
                            <div className="space-y-1.5">
                              {project.missingComponents.map(c => (
                                <div key={c} className="flex items-center justify-between py-1.5 px-3 bg-white/3 border border-white/8 rounded-lg">
                                  <span className="text-xs text-slate-300">{c}</span>
                                  <Link href={`/majestor/shop`}
                                    className="text-[10px] text-[#00e5a0] hover:underline font-semibold shrink-0 ml-2">
                                    Find →
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Use Cases</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.useCases.map(u => (
                              <span key={u} className="text-[10px] text-slate-400 bg-white/5 border border-white/8 px-2 py-1 rounded-md">
                                {u}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Build it CTA */}
                      <div className="flex items-center gap-3 pt-2">
                        <Link href="/majestor/cart"
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] rounded-xl font-black text-xs transition-colors">
                          <ShoppingCart className="w-3.5 h-3.5" /> Build This Project
                        </Link>
                        <button
                          onClick={() => {
                            const text = `${project.title}\n\n${project.description}\n\nSteps:\n${project.steps.join("\n")}`;
                            navigator.clipboard.writeText(text);
                          }}
                          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-xs border border-white/8 transition-colors">
                          Copy Project Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
