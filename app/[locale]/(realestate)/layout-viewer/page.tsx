"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, ZoomIn, ZoomOut, RotateCcw, Plus, Edit2, Trash2,
  MousePointer, PenTool, Move, Save, X, CheckCircle,
  MapPin, SquareCode, Compass, Tag, Download, List,
  Info, ImageIcon, ChevronRight, Eye, EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlotStatus = "available" | "sold" | "reserved";
type EditorMode = "view" | "draw" | "edit-vertex";

interface Plot {
  id: string;
  name: string;
  status: PlotStatus;
  size: string;
  price: string;
  facing: string;
  coordinates: [number, number][];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PlotStatus, {
  stroke: string; fill: string; hoverFill: string;
  badge: string; dot: string; label: string;
}> = {
  available: {
    stroke: "#16a34a", fill: "rgba(22,163,74,0.18)", hoverFill: "rgba(22,163,74,0.42)",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500", label: "Available",
  },
  sold: {
    stroke: "#dc2626", fill: "rgba(220,38,38,0.18)", hoverFill: "rgba(220,38,38,0.42)",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500", label: "Sold",
  },
  reserved: {
    stroke: "#d97706", fill: "rgba(217,119,6,0.18)", hoverFill: "rgba(217,119,6,0.42)",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500", label: "Reserved",
  },
};

const FACINGS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];

const SAMPLE_PLOTS: Plot[] = [
  { id: "P101", name: "Plot 101", status: "available", size: "1,200 sqft", price: "₹45 Lakhs", facing: "East", coordinates: [[80,80],[220,80],[220,200],[80,200]] },
  { id: "P102", name: "Plot 102", status: "sold",      size: "1,500 sqft", price: "₹62 Lakhs", facing: "North", coordinates: [[230,80],[390,80],[390,200],[230,200]] },
  { id: "P103", name: "Plot 103", status: "reserved",  size: "900 sqft",   price: "₹38 Lakhs", facing: "West",  coordinates: [[80,210],[220,210],[220,320],[80,320]] },
  { id: "P104", name: "Plot 104", status: "available", size: "1,800 sqft", price: "₹75 Lakhs", facing: "South-East", coordinates: [[230,210],[390,210],[370,320],[230,320]] },
  { id: "P105", name: "Plot 105", status: "available", size: "2,100 sqft", price: "₹88 Lakhs", facing: "North", coordinates: [[100,340],[260,340],[260,440],[100,440]] },
];

const BLANK_FORM = { name: "", status: "available" as PlotStatus, size: "", price: "", facing: "East" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LayoutViewerPage() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // transform (zoom/pan)
  const xformRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const [xform, setXform] = useState({ tx: 0, ty: 0, scale: 1 });

  function applyXform(next: typeof xform) {
    xformRef.current = next;
    setXform(next);
  }

  // main state
  const [image, setImage]           = useState<string | null>(null);
  const [imageDims, setImageDims]   = useState({ w: 500, h: 500 });
  const [plots, setPlots]           = useState<Plot[]>(SAMPLE_PLOTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [mode, setMode]             = useState<EditorMode>("view");
  const [tab, setTab]               = useState<"info" | "plots" | "upload">("plots");
  const [isDragOver, setIsDragOver] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);

  // draw
  const [drawPts, setDrawPts]         = useState<[number, number][]>([]);
  const [mousePos, setMousePos]       = useState<[number, number]>([0, 0]);
  const [showDrawForm, setShowDrawForm] = useState(false);
  const [drawForm, setDrawForm]       = useState(BLANK_FORM);

  // pan
  const isPanning   = useRef(false);
  const panOrigin   = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // vertex edit
  const [vertexPlotId, setVertexPlotId] = useState<string | null>(null);
  const dragVertex = useRef<{ plotId: string; idx: number } | null>(null);

  // edit form
  const [editForm, setEditForm] = useState<(typeof BLANK_FORM & { id: string }) | null>(null);

  const selectedPlot = plots.find(p => p.id === selectedId) ?? null;

  // ── Zoom via wheel (non-passive) ──────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { tx, ty, scale } = xformRef.current;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const ns = Math.max(0.15, Math.min(10, scale * factor));
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      applyXform({
        scale: ns,
        tx: mx - (mx - tx) * (ns / scale),
        ty: my - (my - ty) * (ns / scale),
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  // ── ESC cancels ──────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrawPts([]); setShowDrawForm(false); setDrawForm(BLANK_FORM);
      setMode("view"); setEditForm(null); setVertexPlotId(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toSVGCoord = useCallback((e: React.MouseEvent<SVGSVGElement>): [number, number] => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const { tx, ty, scale } = xformRef.current;
    return [
      Math.round((e.clientX - rect.left - tx) / scale),
      Math.round((e.clientY - rect.top  - ty) / scale),
    ];
  }, []);

  const toPointsStr = (coords: [number, number][]) => coords.map(c => c.join(",")).join(" ");

  const centroid = (coords: [number, number][]): [number, number] => [
    coords.reduce((s, c) => s + c[0], 0) / coords.length,
    coords.reduce((s, c) => s + c[1], 0) / coords.length,
  ];

  // ── SVG mouse handlers ────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const tgt = e.target as SVGElement;
    const isBackground = tgt.tagName === "svg" || tgt.dataset.bg === "1";
    if (mode === "view" && isBackground) {
      isPanning.current = true;
      const { tx, ty } = xformRef.current;
      panOrigin.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coord = toSVGCoord(e);
    setMousePos(coord);

    if (isPanning.current && mode === "view") {
      const o = panOrigin.current;
      const { scale } = xformRef.current;
      applyXform({ scale, tx: o.tx + (e.clientX - o.x), ty: o.ty + (e.clientY - o.y) });
      return;
    }

    if (dragVertex.current && mode === "edit-vertex") {
      const { plotId, idx } = dragVertex.current;
      setPlots(prev => prev.map(p => {
        if (p.id !== plotId) return p;
        const coords = [...p.coordinates] as [number, number][];
        coords[idx] = coord;
        return { ...p, coordinates: coords };
      }));
    }
  };

  const onMouseUp = () => {
    isPanning.current = false;
    dragVertex.current = null;
  };

  const onSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "draw") return;
    const coord = toSVGCoord(e);
    if (drawPts.length >= 3) {
      const [fx, fy] = drawPts[0];
      if (Math.hypot(coord[0] - fx, coord[1] - fy) < 16 / xform.scale) {
        setShowDrawForm(true);
        return;
      }
    }
    setDrawPts(prev => [...prev, coord]);
  };

  const onPlotClick = (e: React.MouseEvent, id: string) => {
    if (mode === "draw") return;
    e.stopPropagation();
    setSelectedId(prev => prev === id ? null : id);
    if (tab !== "info") setTab("info");
  };

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomBy = (factor: number) => {
    const { tx, ty, scale } = xformRef.current;
    const ns = Math.max(0.15, Math.min(10, scale * factor));
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    const mx = width / 2, my = height / 2;
    applyXform({ scale: ns, tx: mx - (mx - tx) * (ns / scale), ty: my - (my - ty) * (ns / scale) });
  };

  const resetView = () => applyXform({ tx: 0, ty: 0, scale: 1 });

  const fitView = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    const scaleX = (width - 40) / imageDims.w;
    const scaleY = (height - 40) / imageDims.h;
    const ns = Math.min(scaleX, scaleY, 2);
    applyXform({
      scale: ns,
      tx: (width - imageDims.w * ns) / 2,
      ty: (height - imageDims.h * ns) / 2,
    });
  };

  // ── Draw actions ──────────────────────────────────────────────────────────
  const cancelDraw = () => {
    setDrawPts([]); setShowDrawForm(false); setDrawForm(BLANK_FORM);
    if (mode === "draw") setMode("view");
  };

  const savePlot = () => {
    if (!drawForm.name.trim() || drawPts.length < 3) return;
    const newPlot: Plot = {
      id: `P${Date.now()}`,
      name: drawForm.name.trim(),
      status: drawForm.status,
      size: drawForm.size,
      price: drawForm.price,
      facing: drawForm.facing,
      coordinates: drawPts,
    };
    setPlots(prev => [...prev, newPlot]);
    setSelectedId(newPlot.id);
    cancelDraw();
    setMode("view");
    setTab("info");
  };

  // ── Edit actions ──────────────────────────────────────────────────────────
  const openEdit = (plot: Plot) => {
    setEditForm({ id: plot.id, name: plot.name, status: plot.status, size: plot.size, price: plot.price, facing: plot.facing });
  };

  const saveEdit = () => {
    if (!editForm) return;
    setPlots(prev => prev.map(p => p.id === editForm.id ? { ...p, ...editForm } : p));
    setEditForm(null);
  };

  const deletePlot = (id: string) => {
    setPlots(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const changeStatus = (id: string, status: PlotStatus) => {
    setPlots(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|svg\+xml)/)) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
      setImage(url);
      setTimeout(fitView, 50);
    };
    img.src = url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([JSON.stringify(plots, null, 2)], { type: "application/json" })),
      download: "layout-mapping.json",
    });
    a.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const { tx, ty, scale } = xform;

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <span className="font-bold text-white text-sm mr-2">Layout Viewer</span>

        {/* Mode */}
        <div className="flex bg-slate-700 rounded-lg p-0.5 gap-0.5">
          {([
            { m: "view" as EditorMode, icon: MousePointer, label: "View" },
            { m: "draw" as EditorMode, icon: PenTool,      label: "Draw Plot" },
            { m: "edit-vertex" as EditorMode, icon: Move,  label: "Edit Vertices" },
          ]).map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              onClick={() => { setMode(m); if (m !== "draw") cancelDraw(); if (m !== "edit-vertex") setVertexPlotId(null); }}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === m ? "bg-primary-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-600 mx-1" />

        {/* Zoom */}
        <button onClick={() => zoomBy(1.2)}  title="Zoom In"   className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ZoomIn  className="w-4 h-4" /></button>
        <button onClick={() => zoomBy(1/1.2)} title="Zoom Out"  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={fitView}              title="Fit View"  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><RotateCcw className="w-4 h-4" /></button>
        <span className="text-slate-400 text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>

        <div className="w-px h-5 bg-slate-600 mx-1" />

        {/* Labels toggle */}
        <button
          onClick={() => setLabelsVisible(v => !v)}
          title={labelsVisible ? "Hide labels" : "Show labels"}
          className={`p-1.5 rounded-lg transition-colors ${labelsVisible ? "text-amber-400 hover:bg-slate-700" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
        >
          {labelsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <div className="flex-1" />

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          {(["available","sold","reserved"] as PlotStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CFG[s].dot}`} />
              {STATUS_CFG[s].label}
            </span>
          ))}
        </div>

        {/* Export */}
        <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Export JSON
        </button>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas ──────────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden bg-slate-900">

          {/* Mode banner */}
          {mode === "draw" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              <PenTool className="w-3.5 h-3.5" />
              {drawPts.length === 0
                ? "Click to start drawing a plot boundary"
                : drawPts.length < 3
                ? `${drawPts.length} point${drawPts.length > 1 ? "s" : ""} — keep clicking to add more`
                : "Click first point to close polygon · ESC to cancel"}
              {drawPts.length > 0 && (
                <button onClick={cancelDraw} className="ml-2 hover:opacity-70">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {mode === "edit-vertex" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              <Move className="w-3.5 h-3.5" />
              Drag the white handles to reposition vertices · ESC to exit
            </div>
          )}

          {/* No image hint */}
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Upload a layout image to get started</p>
                <p className="text-slate-500 text-xs mt-1">or interact with the sample plot boundaries below</p>
              </div>
            </div>
          )}

          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: mode === "draw" ? "crosshair" : isPanning.current ? "grabbing" : mode === "view" ? "grab" : "default" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={onSVGClick}
          >
            {/* Background tap target */}
            <rect
              x={-9999} y={-9999} width={99999} height={99999}
              fill="transparent"
              data-bg="1"
              onClick={() => mode === "view" && setSelectedId(null)}
            />

            <g transform={`translate(${tx},${ty}) scale(${scale})`}>
              {/* Layout image */}
              {image && (
                <image
                  href={image}
                  x={0} y={0}
                  width={imageDims.w}
                  height={imageDims.h}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}

              {/* Grid (when no image) */}
              {!image && (
                <g opacity={0.12}>
                  <defs>
                    <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth={0.5} />
                    </pattern>
                  </defs>
                  <rect x={0} y={0} width={500} height={500} fill="url(#grid)" />
                </g>
              )}

              {/* Plot polygons */}
              {plots.map(plot => {
                const cfg = STATUS_CFG[plot.status];
                const isHovered  = hoveredId === plot.id;
                const isSelected = selectedId === plot.id;
                const isVertex   = mode === "edit-vertex" && isSelected;
                const [cx, cy]   = centroid(plot.coordinates);

                return (
                  <g key={plot.id}>
                    <polygon
                      points={toPointsStr(plot.coordinates)}
                      fill={isHovered || isSelected ? cfg.hoverFill : cfg.fill}
                      stroke={cfg.stroke}
                      strokeWidth={(isSelected ? 2.5 : 1.5) / scale}
                      strokeLinejoin="round"
                      style={{ cursor: mode === "draw" ? "crosshair" : "pointer", transition: "fill 0.1s" }}
                      onClick={e => onPlotClick(e, plot.id)}
                      onMouseEnter={() => setHoveredId(plot.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />

                    {/* Selection ring */}
                    {isSelected && (
                      <polygon
                        points={toPointsStr(plot.coordinates)}
                        fill="none"
                        stroke={cfg.stroke}
                        strokeWidth={3 / scale}
                        strokeDasharray={`${6/scale},${3/scale}`}
                        opacity={0.7}
                        pointerEvents="none"
                      />
                    )}

                    {/* Label */}
                    {labelsVisible && (
                      <text
                        x={cx} y={cy - 6 / scale}
                        textAnchor="middle"
                        fontSize={11 / scale}
                        fill={cfg.stroke}
                        fontWeight="700"
                        pointerEvents="none"
                        style={{ userSelect: "none" }}
                      >
                        {plot.name}
                      </text>
                    )}
                    {labelsVisible && (
                      <text
                        x={cx} y={cy + 8 / scale}
                        textAnchor="middle"
                        fontSize={9 / scale}
                        fill={cfg.stroke}
                        opacity={0.8}
                        pointerEvents="none"
                        style={{ userSelect: "none" }}
                      >
                        {plot.size}
                      </text>
                    )}

                    {/* Vertex handles (edit-vertex mode) */}
                    {isVertex && plot.coordinates.map(([vx, vy], idx) => (
                      <circle
                        key={idx}
                        cx={vx} cy={vy}
                        r={6 / scale}
                        fill="white"
                        stroke={cfg.stroke}
                        strokeWidth={2 / scale}
                        style={{ cursor: "move" }}
                        onMouseDown={e => {
                          e.stopPropagation();
                          dragVertex.current = { plotId: plot.id, idx };
                        }}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Drawing preview */}
              {mode === "draw" && drawPts.length > 0 && (
                <g>
                  {/* Closed-area preview */}
                  {drawPts.length >= 3 && (
                    <polygon
                      points={toPointsStr(drawPts)}
                      fill="rgba(99,102,241,0.15)"
                      stroke="none"
                      pointerEvents="none"
                    />
                  )}

                  {/* Lines to mouse */}
                  <polyline
                    points={[...drawPts, mousePos].map(c => c.join(",")).join(" ")}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={1.5 / scale}
                    strokeDasharray={`${5/scale},${3/scale}`}
                    pointerEvents="none"
                  />
                  {/* Close-line */}
                  {drawPts.length >= 2 && (
                    <line
                      x1={mousePos[0]} y1={mousePos[1]}
                      x2={drawPts[0][0]} y2={drawPts[0][1]}
                      stroke="#6366f1"
                      strokeWidth={1 / scale}
                      strokeDasharray={`${3/scale},${3/scale}`}
                      opacity={0.4}
                      pointerEvents="none"
                    />
                  )}

                  {/* Point handles */}
                  {drawPts.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x} cy={y}
                      r={(i === 0 && drawPts.length >= 3 ? 8 : 5) / scale}
                      fill={i === 0 ? "#6366f1" : "white"}
                      stroke="#6366f1"
                      strokeWidth={2 / scale}
                      style={{ cursor: i === 0 && drawPts.length >= 3 ? "pointer" : "crosshair" }}
                      onClick={e => {
                        if (i === 0 && drawPts.length >= 3) {
                          e.stopPropagation();
                          setShowDrawForm(true);
                        }
                      }}
                    />
                  ))}

                  {/* Coord badge at mouse */}
                  <g transform={`translate(${mousePos[0] + 10 / scale},${mousePos[1] - 14 / scale})`}>
                    <rect
                      x={0} y={0}
                      width={80 / scale} height={16 / scale}
                      rx={4 / scale}
                      fill="rgba(99,102,241,0.85)"
                    />
                    <text
                      x={4 / scale} y={11 / scale}
                      fontSize={9 / scale}
                      fill="white"
                      style={{ userSelect: "none" }}
                    >
                      {mousePos[0]}, {mousePos[1]}
                    </text>
                  </g>
                </g>
              )}
            </g>
          </svg>

          {/* Hover tooltip */}
          {hoveredId && mode === "view" && (() => {
            const p = plots.find(x => x.id === hoveredId)!;
            const cfg = STATUS_CFG[p.status];
            return (
              <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white shadow-xl pointer-events-none z-10 min-w-[160px]">
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.size} · {p.facing}</p>
                <p className="text-sm font-semibold text-primary-400 mt-1">{p.price}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
            );
          })()}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="w-72 lg:w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">

          {/* Sidebar tabs */}
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {([
              { id: "info"   as const, icon: Info,      label: "Info" },
              { id: "plots"  as const, icon: List,      label: "Plots" },
              { id: "upload" as const, icon: Upload,    label: "Upload" },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === id
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === "plots" && (
                  <span className="bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">{plots.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── Info tab ─────────────────────────────────────────── */}
            {tab === "info" && (
              <div className="p-4">
                {selectedPlot ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-bold text-slate-800 text-base">{selectedPlot.name}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedPlot.id}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${STATUS_CFG[selectedPlot.status].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[selectedPlot.status].dot}`} />
                        {STATUS_CFG[selectedPlot.status].label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-2.5">
                      {[
                        { icon: Tag,        label: "Price",   value: selectedPlot.price },
                        { icon: SquareCode, label: "Size",    value: selectedPlot.size },
                        { icon: Compass,    label: "Facing",  value: selectedPlot.facing },
                        { icon: MapPin,     label: "Points",  value: `${selectedPlot.coordinates.length} vertices` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 leading-none">{label}</p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status change */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Change Status</p>
                      <div className="flex gap-2">
                        {(["available","sold","reserved"] as PlotStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => changeStatus(selectedPlot.id, s)}
                            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors ${
                              selectedPlot.status === s
                                ? STATUS_CFG[s].badge + " border-current"
                                : "text-slate-500 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {STATUS_CFG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Coordinates</p>
                      <div className="bg-slate-50 rounded-lg p-2 font-mono text-[10px] text-slate-500 max-h-28 overflow-y-auto">
                        {selectedPlot.coordinates.map(([x,y], i) => (
                          <div key={i}>[{x}, {y}]</div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(selectedPlot)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold rounded-xl transition-colors border border-primary-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => { setMode("edit-vertex"); setVertexPlotId(selectedPlot.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-xl transition-colors border border-violet-200"
                      >
                        <Move className="w-3.5 h-3.5" /> Vertices
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${selectedPlot.name}"?`)) deletePlot(selectedPlot.id); }}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Info className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No plot selected</p>
                    <p className="text-slate-400 text-xs mt-1">Click a plot on the canvas to view details</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Plots tab ─────────────────────────────────────────── */}
            {tab === "plots" && (
              <div className="p-3 space-y-2">
                <button
                  onClick={() => { setMode("draw"); setTab("info"); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Plot
                </button>

                {plots.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">No plots yet</div>
                )}

                {plots.map(plot => {
                  const cfg = STATUS_CFG[plot.status];
                  const isSelected = selectedId === plot.id;
                  return (
                    <div
                      key={plot.id}
                      onClick={() => { setSelectedId(plot.id); setTab("info"); }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                        isSelected
                          ? "bg-primary-50 border-primary-200"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{plot.name}</p>
                        <p className="text-xs text-slate-400">{plot.size} · {plot.price}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="pt-2 border-t border-slate-100 mt-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Summary</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available","sold","reserved"] as PlotStatus[]).map(s => {
                      const count = plots.filter(p => p.status === s).length;
                      return (
                        <div key={s} className={`rounded-lg p-2 text-center border ${STATUS_CFG[s].badge}`}>
                          <p className="text-lg font-bold">{count}</p>
                          <p className="text-[10px] capitalize">{s}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Upload tab ────────────────────────────────────────── */}
            {tab === "upload" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">Upload Layout Image</h3>
                  <p className="text-xs text-slate-500">PNG, JPG or SVG. The image is used as the background for drawing plot boundaries.</p>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-primary-400 bg-primary-50"
                      : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-primary-500" : "text-slate-300"}`} />
                  <p className="text-sm font-medium text-slate-600">Drop image here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>

                {/* Preview */}
                {image && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">Preview</p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={image} alt="Layout" className="w-full object-contain max-h-40" />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">{imageDims.w} × {imageDims.h}px</p>
                    <div className="flex gap-2">
                      <button onClick={fitView} className="flex-1 text-xs py-1.5 bg-primary-50 text-primary-700 font-semibold rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors">
                        Fit to View
                      </button>
                      <button onClick={() => { setImage(null); resetView(); }} className="text-xs py-1.5 px-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">Tips</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Use a high-res image for precise mapping</li>
                    <li>Scroll to zoom, drag to pan</li>
                    <li>Use <strong>Draw Plot</strong> mode to trace boundaries</li>
                    <li>Click the first point to close a polygon</li>
                    <li>Export JSON saves all plot coordinates</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Draw form modal ──────────────────────────────────────────── */}
      {showDrawForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">New Plot Details</h3>
              <button onClick={cancelDraw} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <FormField label="Plot Name *" required>
                <input
                  autoFocus
                  value={drawForm.name}
                  onChange={e => setDrawForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Plot 106"
                  className="input-base"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Size">
                  <input value={drawForm.size} onChange={e => setDrawForm(f => ({ ...f, size: e.target.value }))} placeholder="1200 sqft" className="input-base" />
                </FormField>
                <FormField label="Price">
                  <input value={drawForm.price} onChange={e => setDrawForm(f => ({ ...f, price: e.target.value }))} placeholder="₹45 Lakhs" className="input-base" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Facing">
                  <select value={drawForm.facing} onChange={e => setDrawForm(f => ({ ...f, facing: e.target.value }))} className="input-base">
                    {FACINGS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </FormField>
                <FormField label="Status">
                  <select value={drawForm.status} onChange={e => setDrawForm(f => ({ ...f, status: e.target.value as PlotStatus }))} className="input-base">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </FormField>
              </div>
              <p className="text-xs text-slate-400">{drawPts.length} vertices captured</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={cancelDraw} className="flex-1 btn-secondary py-2.5">Cancel</button>
              <button
                onClick={savePlot}
                disabled={!drawForm.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
              >
                <Save className="w-4 h-4" /> Save Plot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit form modal ──────────────────────────────────────────── */}
      {editForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Edit Plot</h3>
              <button onClick={() => setEditForm(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <FormField label="Plot Name">
                <input autoFocus value={editForm.name} onChange={e => setEditForm(f => f && ({ ...f, name: e.target.value }))} className="input-base" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Size">
                  <input value={editForm.size} onChange={e => setEditForm(f => f && ({ ...f, size: e.target.value }))} className="input-base" />
                </FormField>
                <FormField label="Price">
                  <input value={editForm.price} onChange={e => setEditForm(f => f && ({ ...f, price: e.target.value }))} className="input-base" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Facing">
                  <select value={editForm.facing} onChange={e => setEditForm(f => f && ({ ...f, facing: e.target.value }))} className="input-base">
                    {FACINGS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </FormField>
                <FormField label="Status">
                  <select value={editForm.status} onChange={e => setEditForm(f => f && ({ ...f, status: e.target.value as PlotStatus }))} className="input-base">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </FormField>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditForm(null)} className="flex-1 btn-secondary py-2.5">Cancel</button>
              <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
