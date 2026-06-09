"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, Upload, ChevronRight, Package, Settings, CheckCircle2 } from "lucide-react";

interface Specs {
  title: string;
  width: string;
  height: string;
  depth: string;
  material: string;
  color: string;
  quantity: string;
  infill: string;
  notes: string;
}

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "Resin"];
const COLORS = ["White", "Black", "Gray", "Orange", "Blue", "Green", "Red", "Transparent"];

export default function OrderPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [specs, setSpecs] = useState<Specs>({
    title: "",
    width: "",
    height: "",
    depth: "",
    material: "PLA",
    color: "White",
    quantity: "1",
    infill: "20",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from URL params (sent by CAD designer)
  useEffect(() => {
    const w = searchParams.get("w");
    const h = searchParams.get("h");
    const d = searchParams.get("d");
    const title = searchParams.get("title");
    if (w || h || d || title) {
      setSpecs((prev) => ({
        ...prev,
        ...(w ? { width: w } : {}),
        ...(h ? { height: h } : {}),
        ...(d ? { depth: d } : {}),
        ...(title ? { title: decodeURIComponent(title) } : {}),
      }));
    }
  }, [searchParams]);

  const inputStyle = {
    background: "#060912",
    border: "1px solid rgba(249,115,22,0.2)",
    color: "white",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  } as const;

  const labelStyle = { color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.25rem", display: "block" } as const;

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#f97316" }} />
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-slate-400 mb-6">
            We&apos;ve received your order for <span className="text-white font-semibold">{specs.title || "your 3D print"}</span>.
            We&apos;ll get back to you within 24 hours with a quote.
          </p>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setFile(null); }}
            className="px-6 py-2.5 rounded-lg text-white font-semibold transition-colors"
            style={{ background: "#f97316" }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-6 h-6" style={{ color: "#f97316" }} />
        <h1 className="text-2xl font-bold text-white">Order a 3D Print</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Upload", icon: Upload },
          { n: 2, label: "Specifications", icon: Settings },
          { n: 3, label: "Confirm", icon: Package },
        ].map(({ n, label, icon: Icon }, i) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => n < step && setStep(n)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: step === n ? "#f97316" : step > n ? "rgba(249,115,22,0.2)" : "#0d1220",
                color: step === n ? "white" : step > n ? "#f97316" : "#94a3b8",
                border: `1px solid ${step >= n ? "rgba(249,115,22,0.4)" : "rgba(249,115,22,0.15)"}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
            {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Upload */}
      {step === 1 && (
        <div
          className="rounded-xl p-8"
          style={{ background: "#0d1220", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" style={{ color: "#f97316" }} />
            Upload your STL file
          </h2>
          <label
            className="flex flex-col items-center justify-center rounded-xl p-10 cursor-pointer transition-all"
            style={{
              border: "2px dashed rgba(249,115,22,0.3)",
              background: file ? "rgba(249,115,22,0.05)" : "transparent",
            }}
          >
            <Upload className="w-8 h-8 mb-3" style={{ color: file ? "#f97316" : "#64748b" }} />
            {file ? (
              <p className="text-white font-semibold">{file.name}</p>
            ) : (
              <>
                <p className="text-white font-semibold mb-1">Drop STL file here</p>
                <p className="text-slate-500 text-sm">or click to browse</p>
              </>
            )}
            <input
              type="file"
              accept=".stl"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
          </label>
          <p className="text-slate-500 text-xs mt-3">
            Don&apos;t have an STL? Use our{" "}
            <a href="/print3d/cad" className="underline" style={{ color: "#f97316" }}>CAD Designer</a>{" "}
            to create one.
          </p>
          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full py-2.5 rounded-lg text-white font-semibold transition-colors"
            style={{
              background: "#f97316",
              opacity: file ? 1 : 0.6,
              cursor: file ? "pointer" : "default",
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2 — Specifications */}
      {step === 2 && (
        <div
          className="rounded-xl p-8 space-y-4"
          style={{ background: "#0d1220", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          <h2 className="text-white font-bold flex items-center gap-2">
            <Settings className="w-4 h-4" style={{ color: "#f97316" }} />
            Specifications
          </h2>
          {searchParams.get("w") && (
            <div className="rounded-lg px-4 py-2 text-xs" style={{ background: "rgba(249,115,22,0.08)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}>
              Dimensions pre-filled from CAD Designer
            </div>
          )}
          <div>
            <label style={labelStyle}>Model Title</label>
            <input style={inputStyle} value={specs.title} onChange={(e) => setSpecs({ ...specs, title: e.target.value })} placeholder="e.g. Bracket v1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["width", "height", "depth"] as const).map((dim) => (
              <div key={dim}>
                <label style={labelStyle}>{dim.charAt(0).toUpperCase() + dim.slice(1)} (mm)</label>
                <input type="number" style={inputStyle} value={specs[dim]} onChange={(e) => setSpecs({ ...specs, [dim]: e.target.value })} placeholder="0" min="0" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Material</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={specs.material} onChange={(e) => setSpecs({ ...specs, material: e.target.value })}>
                {MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={specs.color} onChange={(e) => setSpecs({ ...specs, color: e.target.value })}>
                {COLORS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Quantity</label>
              <input type="number" style={inputStyle} value={specs.quantity} onChange={(e) => setSpecs({ ...specs, quantity: e.target.value })} min="1" />
            </div>
            <div>
              <label style={labelStyle}>Infill %</label>
              <input type="number" style={inputStyle} value={specs.infill} onChange={(e) => setSpecs({ ...specs, infill: e.target.value })} min="5" max="100" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              style={{ ...inputStyle, resize: "none", height: "80px" }}
              value={specs.notes}
              onChange={(e) => setSpecs({ ...specs, notes: e.target.value })}
              placeholder="Any special requirements..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: "#0d1220", color: "#94a3b8", border: "1px solid rgba(249,115,22,0.15)" }}>
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg text-white font-semibold transition-colors" style={{ background: "#f97316" }}>
              Review Order
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div
          className="rounded-xl p-8"
          style={{ background: "#0d1220", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          <h2 className="text-white font-bold mb-6 flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: "#f97316" }} />
            Order Summary
          </h2>
          <div className="space-y-3 text-sm mb-6">
            {[
              ["File", file?.name ?? "—"],
              ["Title", specs.title || "Untitled"],
              ["Dimensions", `${specs.width || "?"} × ${specs.height || "?"} × ${specs.depth || "?"} mm`],
              ["Material", specs.material],
              ["Color", specs.color],
              ["Quantity", specs.quantity],
              ["Infill", `${specs.infill}%`],
              ...(specs.notes ? [["Notes", specs.notes]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span style={{ color: "#94a3b8" }}>{k}</span>
                <span className="text-white font-medium text-right max-w-[60%]">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#0d1220", color: "#94a3b8", border: "1px solid rgba(249,115,22,0.15)" }}>
              Back
            </button>
            <button onClick={() => setSubmitted(true)} className="flex-1 py-2.5 rounded-lg text-white font-semibold" style={{ background: "#f97316" }}>
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
