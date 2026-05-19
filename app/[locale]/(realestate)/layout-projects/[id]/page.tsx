"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/navigation";
import {
  Upload, ZoomIn, ZoomOut, RotateCcw, Plus, Edit2, Trash2,
  MousePointer, PenTool, Move, Save, X, Download, List,
  Info, ImageIcon, ChevronRight, Eye, EyeOff, Maximize2,
  MapPin, SquareCode, Compass, Tag, ArrowLeft, Check, Loader2,
  Building2, BarChart3, Phone, User, Calendar, ClipboardList,
  CheckCircle2, XCircle, AlertTriangle, BookOpen, Banknote,
  FileText, BadgeCheck, ChevronDown,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlotStatus = "available" | "sold" | "reserved";
type EditorMode  = "view" | "draw" | "edit-vertex";
type LayoutProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "ARCHIVED";
type SaveStatus = "saved" | "saving" | "unsaved";
type BookingStatus = "ACTIVE" | "CONFIRMED" | "CANCELLED" | "CONVERTED";
type BuyerIdType  = "AADHAAR" | "PAN" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID";

interface Plot {
  id:          string;
  name:        string;
  status:      PlotStatus;
  size:        string;
  price:       string;
  facing:      string;
  coordinates: [number, number][];
}

interface Booking {
  id:            string;
  projectId:     string;
  plotId:        string;
  plotName:      string;
  buyerName:     string;
  buyerPhone:    string;
  buyerEmail:    string | null;
  buyerAddress:  string;
  buyerIdType:   BuyerIdType;
  buyerIdNumber: string;
  bookingAmount: number | null;
  notes:         string | null;
  status:        BookingStatus;
  agentId:       string;
  agent:         { name: string | null; email: string };
  createdAt:     string;
  updatedAt:     string;
}

interface BookingForm {
  buyerName:     string;
  buyerPhone:    string;
  buyerEmail:    string;
  buyerAddress:  string;
  buyerIdType:   BuyerIdType;
  buyerIdNumber: string;
  bookingAmount: string;
  notes:         string;
}

interface XForm { tx: number; ty: number; scale: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS: Record<PlotStatus, {
  stroke: string; fill: string; zoom: string;
  badge: string; dot: string; label: string;
}> = {
  available: {
    stroke: "#16a34a", fill: "rgba(22,163,74,0.15)", zoom: "rgba(22,163,74,0.35)",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Available",
  },
  sold: {
    stroke: "#dc2626", fill: "rgba(220,38,38,0.15)", zoom: "rgba(220,38,38,0.35)",
    badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", label: "Sold",
  },
  reserved: {
    stroke: "#d97706", fill: "rgba(217,119,6,0.15)", zoom: "rgba(217,119,6,0.35)",
    badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Reserved",
  },
};

const BOOKING_STATUS: Record<BookingStatus, { label: string; badge: string; dot: string }> = {
  ACTIVE:    { label: "Active",    badge: "bg-amber-100 text-amber-700 border-amber-200",    dot: "bg-amber-500"  },
  CONFIRMED: { label: "Confirmed", badge: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500"   },
  CANCELLED: { label: "Cancelled", badge: "bg-slate-100 text-slate-500 border-slate-200",    dot: "bg-slate-400"  },
  CONVERTED: { label: "Sold",      badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

const ID_TYPES: { value: BuyerIdType; label: string }[] = [
  { value: "AADHAAR",        label: "Aadhaar Card"       },
  { value: "PAN",            label: "PAN Card"           },
  { value: "PASSPORT",       label: "Passport"           },
  { value: "DRIVING_LICENSE",label: "Driving License"    },
  { value: "VOTER_ID",       label: "Voter ID"           },
];

const PROJECT_STATUS_CONFIG: Record<LayoutProjectStatus, { label: string; badge: string }> = {
  ACTIVE:    { label: "Active",    badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completed", badge: "bg-blue-100 text-blue-700 border-blue-200"          },
  ON_HOLD:   { label: "On Hold",   badge: "bg-amber-100 text-amber-700 border-amber-200"       },
  ARCHIVED:  { label: "Archived",  badge: "bg-slate-100 text-slate-600 border-slate-200"       },
};

const FACINGS  = ["East","West","North","South","North-East","North-West","South-East","South-West"];
const BLANK    = { name:"", status:"available" as PlotStatus, size:"", price:"", facing:"East" };
const DURATION = 750;

const BLANK_BOOKING: BookingForm = {
  buyerName: "", buyerPhone: "", buyerEmail: "", buyerAddress: "",
  buyerIdType: "AADHAAR", buyerIdNumber: "", bookingAmount: "", notes: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function centroid(coords: [number, number][]): [number, number] {
  return [
    coords.reduce((s,c) => s+c[0], 0) / coords.length,
    coords.reduce((s,c) => s+c[1], 0) / coords.length,
  ];
}

function bbox(coords: [number, number][]) {
  const xs = coords.map(c=>c[0]), ys = coords.map(c=>c[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

function pts(coords: [number, number][]) { return coords.map(c=>c.join(",")).join(" "); }

function zoomToBBox(coords: [number, number][], svgW: number, svgH: number, padding = 0.85): XForm {
  const { x0, x1, y0, y1 } = bbox(coords);
  const bw = Math.max(x1-x0, 1), bh = Math.max(y1-y0, 1);
  const scale = Math.min(8, padding / Math.max(bw/svgW, bh/svgH));
  const cx = (x0+x1)/2, cy = (y0+y1)/2;
  return { scale, tx: svgW/2 - scale*cx, ty: svgH/2 - scale*cy };
}

function computeStats(plots: Plot[]) {
  const total     = plots.length;
  const available = plots.filter(p=>p.status==="available").length;
  const sold      = plots.filter(p=>p.status==="sold").length;
  const reserved  = plots.filter(p=>p.status==="reserved").length;
  const soldPct   = total>0 ? Math.round((sold/total)*100) : 0;
  return { total, available, sold, reserved, soldPct };
}

function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4) + "XXXX";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LayoutProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const svgRef  = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Transform
  const xRef = useRef<XForm>({ tx:0, ty:0, scale:1 });
  const [xform, setXform]   = useState<XForm>({ tx:0, ty:0, scale:1 });
  const [animated, setAnim] = useState(false);

  function applyXform(next: XForm, animate = false) {
    xRef.current = next;
    if (animate) {
      setAnim(true);
      setXform(next);
      setTimeout(() => setAnim(false), DURATION + 10);
    } else {
      setAnim(false);
      setXform(next);
    }
  }

  // Project state
  const [pageLoading, setPageLoading]         = useState(true);
  const [projectName, setProjectName]         = useState("Untitled Project");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectStatus, setProjectStatus]     = useState<LayoutProjectStatus>("ACTIVE");
  const [imageUrl, setImageUrl]               = useState<string | null>(null);
  const [saveStatus, setSaveStatus]           = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved]             = useState<Date | null>(null);
  const [editingName, setEditingName]         = useState(false);
  const [nameInput, setNameInput]             = useState("");

  // Canvas state
  const [image, setImage]         = useState<string | null>(null);
  const [imgDims, setImgDims]     = useState({ w:500, h:500 });
  const [plots, setPlots]         = useState<Plot[]>([]);
  const [selectedId, setSelected] = useState<string | null>(null);
  const [hoveredId, setHovered]   = useState<string | null>(null);
  const [mode, setMode]           = useState<EditorMode>("view");
  const [tab, setTab]             = useState<"info"|"plots"|"upload"|"project">("plots");
  const [labels, setLabels]       = useState(true);
  const [isDragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Draw
  const [drawPts, setDrawPts]   = useState<[number,number][]>([]);
  const [mousePos, setMousePos] = useState<[number,number]>([0,0]);
  const [showForm, setShowForm] = useState(false);
  const [drawForm, setDrawForm] = useState(BLANK);

  // Pan
  const panning   = useRef(false);
  const panOrigin = useRef({ mx:0, my:0, tx:0, ty:0 });

  // Vertex drag
  const vertexDrag = useRef<{ plotId:string; idx:number } | null>(null);

  // Edit
  const [editForm, setEditForm] = useState<(typeof BLANK & { id:string }) | null>(null);

  // ── Booking state ──────────────────────────────────────────────────────────
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm]         = useState<BookingForm>(BLANK_BOOKING);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState<string | null>(null);
  const [confirmConvert, setConfirmConvert]   = useState<Booking | null>(null);

  const selectedPlot = plots.find(p => p.id === selectedId) ?? null;
  const stats = computeStats(plots);

  // Auto-save debounce
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPlots         = useRef(plots);
  const latestName          = useRef(projectName);
  const latestLocation      = useRef(projectLocation);
  const latestStatus        = useRef(projectStatus);
  const latestImageUrl      = useRef(imageUrl);
  const initialLoadDone     = useRef(false);

  latestPlots.current    = plots;
  latestName.current     = projectName;
  latestLocation.current = projectLocation;
  latestStatus.current   = projectStatus;
  latestImageUrl.current = imageUrl;

  function scheduleAutoSave() {
    if (!initialLoadDone.current) return;
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/layout-projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plots:    latestPlots.current,
            name:     latestName.current,
            location: latestLocation.current,
            status:   latestStatus.current,
            imageUrl: latestImageUrl.current,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch {
        setSaveStatus("unsaved");
        toast("Auto-save failed", "error");
      }
    }, 2500);
  }

  // Load project on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/layout-projects/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProjectName(data.name ?? "Untitled Project");
        setProjectLocation(data.location ?? "");
        setProjectStatus(data.status ?? "ACTIVE");
        setImageUrl(data.imageUrl ?? null);
        const rawPlots = Array.isArray(data.plots) ? data.plots : [];
        setPlots(rawPlots);
        if (data.imageUrl) {
          const img = new Image();
          img.onload = () => {
            setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
            setImage(data.imageUrl);
            setTimeout(fitAllRef.current, 80);
          };
          img.src = data.imageUrl;
        }
      } catch {
        toast("Failed to load project", "error");
      } finally {
        setPageLoading(false);
        setTimeout(() => { initialLoadDone.current = true; }, 200);
      }
    }
    load();
  }, [id]);

  // Load bookings when a plot is selected
  useEffect(() => {
    if (!selectedId) { setBookings([]); return; }
    let cancelled = false;
    async function load() {
      setBookingsLoading(true);
      try {
        const res = await fetch(`/api/layout-projects/${id}/bookings`);
        if (!res.ok) throw new Error("Failed");
        const all: Booking[] = await res.json();
        if (!cancelled) setBookings(all.filter(b => b.plotId === selectedId));
      } catch {
        if (!cancelled) toast("Failed to load bookings", "error");
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedId, id]);

  // Trigger auto-save on state changes
  useEffect(() => { scheduleAutoSave(); }, [plots, projectName, projectLocation, projectStatus, imageUrl]);

  // Non-passive wheel
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const { tx, ty, scale } = xRef.current;
      const f = e.deltaY < 0 ? 1.15 : 1/1.15;
      const ns = Math.max(0.1, Math.min(12, scale*f));
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      applyXform({ scale:ns, tx: mx-(mx-tx)*(ns/scale), ty: my-(my-ty)*(ns/scale) }, false);
    };
    svg.addEventListener("wheel", handler, { passive: false });
    return () => svg.removeEventListener("wheel", handler);
  }, []);

  // ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      cancelDraw(); setEditForm(null); setShowBookingForm(false); setConfirmConvert(null);
      if (selectedId) { setSelected(null); resetZoom(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedId]);

  // SVG coord
  const toSVG = useCallback((e: React.MouseEvent<SVGSVGElement>): [number,number] => {
    const svg = svgRef.current;
    if (!svg) return [0,0];
    const rect = svg.getBoundingClientRect();
    const { tx, ty, scale } = xRef.current;
    return [Math.round((e.clientX-rect.left-tx)/scale), Math.round((e.clientY-rect.top-ty)/scale)];
  }, []);

  function zoomToPlot(plot: Plot) {
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    applyXform(zoomToBBox(plot.coordinates, width, height), true);
  }

  function resetZoom() { applyXform({ tx:0, ty:0, scale:1 }, true); }

  function fitAll() {
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    const allCoords = plots.flatMap(p => p.coordinates);
    if (allCoords.length === 0) { resetZoom(); return; }
    applyXform(zoomToBBox(allCoords, width, height, 0.9), true);
  }

  const fitAllRef = useRef(fitAll);
  fitAllRef.current = fitAll;

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const tag = (e.target as SVGElement).tagName;
    if (mode === "view" && (tag === "svg" || (e.target as SVGElement).dataset.bg === "1")) {
      panning.current = true;
      const { tx, ty } = xRef.current;
      panOrigin.current = { mx: e.clientX, my: e.clientY, tx, ty };
    }
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coord = toSVG(e);
    setMousePos(coord);
    if (panning.current && mode === "view") {
      const o = panOrigin.current, { scale } = xRef.current;
      applyXform({ scale, tx: o.tx+(e.clientX-o.mx), ty: o.ty+(e.clientY-o.my) }, false);
      return;
    }
    if (vertexDrag.current && mode === "edit-vertex") {
      const { plotId, idx } = vertexDrag.current;
      setPlots(prev => prev.map(p => {
        if (p.id !== plotId) return p;
        const c = [...p.coordinates] as [number,number][];
        c[idx] = coord;
        return { ...p, coordinates: c };
      }));
    }
  };

  const onMouseUp = () => { panning.current = false; vertexDrag.current = null; };

  const onBgClick = () => {
    if (mode !== "view") return;
    setSelected(null);
    resetZoom();
  };

  const onPlotClick = (e: React.MouseEvent, plot: Plot) => {
    if (mode === "draw") return;
    e.stopPropagation();
    if (selectedId === plot.id) {
      setSelected(null); resetZoom();
    } else {
      setSelected(plot.id); setTab("info"); zoomToPlot(plot);
    }
  };

  const onSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "draw") return;
    const coord = toSVG(e);
    if (drawPts.length >= 3) {
      const [fx,fy] = drawPts[0];
      if (Math.hypot(coord[0]-fx, coord[1]-fy) < 16/xRef.current.scale) {
        setShowForm(true); return;
      }
    }
    setDrawPts(prev => [...prev, coord]);
  };

  function zoomBy(factor: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const { tx, ty, scale } = xRef.current;
    const ns = Math.max(0.1, Math.min(12, scale*factor));
    const { width, height } = svg.getBoundingClientRect();
    const mx = width/2, my = height/2;
    applyXform({ scale:ns, tx: mx-(mx-tx)*(ns/scale), ty: my-(my-ty)*(ns/scale) }, true);
  }

  const cancelDraw = useCallback(() => {
    setDrawPts([]); setShowForm(false); setDrawForm(BLANK);
    if (mode === "draw") setMode("view");
  }, [mode]);

  function savePlot() {
    if (!drawForm.name.trim() || drawPts.length < 3) return;
    const p: Plot = { id:`P${Date.now()}`, ...drawForm, name:drawForm.name.trim(), coordinates:drawPts };
    setPlots(prev => [...prev, p]);
    setSelected(p.id);
    cancelDraw(); setMode("view"); setTab("info");
    setTimeout(() => zoomToPlot(p), 100);
  }

  function openEdit(p: Plot) {
    setEditForm({ id:p.id, name:p.name, status:p.status, size:p.size, price:p.price, facing:p.facing });
  }
  function saveEdit() {
    if (!editForm) return;
    setPlots(prev => prev.map(p => p.id===editForm.id ? {...p,...editForm} : p));
    setEditForm(null);
  }
  function deletePlot(id: string) {
    setPlots(prev => prev.filter(p => p.id!==id));
    if (selectedId===id) { setSelected(null); resetZoom(); }
  }
  function changeStatus(plotId: string, status: PlotStatus) {
    setPlots(prev => prev.map(p => p.id===plotId ? {...p,status} : p));
  }

  // ── Booking actions ────────────────────────────────────────────────────────

  async function submitBooking() {
    if (!selectedPlot) return;
    const f = bookingForm;
    if (!f.buyerName.trim() || !f.buyerPhone.trim() || !f.buyerAddress.trim() || !f.buyerIdNumber.trim()) {
      toast("Please fill all required fields", "warning"); return;
    }
    setBookingSubmitting(true);
    try {
      const res = await fetch(`/api/layout-projects/${id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotId:        selectedPlot.id,
          plotName:      selectedPlot.name,
          buyerName:     f.buyerName.trim(),
          buyerPhone:    f.buyerPhone.trim(),
          buyerEmail:    f.buyerEmail.trim() || null,
          buyerAddress:  f.buyerAddress.trim(),
          buyerIdType:   f.buyerIdType,
          buyerIdNumber: f.buyerIdNumber.trim(),
          bookingAmount: f.bookingAmount ? parseFloat(f.bookingAmount) : null,
          notes:         f.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) toast("This plot is already sold", "error");
        else toast(data.error ?? "Booking failed", "error");
        return;
      }
      setBookings(prev => [data, ...prev]);
      // Update local plot status to reserved if it was available
      setPlots(prev => prev.map(p =>
        p.id === selectedPlot.id && p.status === "available" ? { ...p, status: "reserved" } : p
      ));
      setShowBookingForm(false);
      setBookingForm(BLANK_BOOKING);
      toast("Reservation created successfully", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setBookingSubmitting(false);
    }
  }

  async function bookingAction(booking: Booking, action: "cancel" | "confirm" | "convert-to-sale") {
    setActionLoading(booking.id + action);
    try {
      const res = await fetch(`/api/layout-projects/${id}/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { toast("Action failed", "error"); return; }

      if (action === "convert-to-sale") {
        // Mark booking CONVERTED and all others CANCELLED; set plot sold locally
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: "CONVERTED" } :
          ["ACTIVE","CONFIRMED"].includes(b.status) ? { ...b, status: "CANCELLED" } : b
        ));
        setPlots(prev => prev.map(p =>
          p.id === booking.plotId ? { ...p, status: "sold" } : p
        ));
        setConfirmConvert(null);
        toast("Plot marked as sold!", "success");
      } else if (action === "confirm") {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "CONFIRMED" } : b));
        toast("Booking confirmed", "success");
      } else if (action === "cancel") {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "CANCELLED" } : b));
        // If no more active bookings, revert plot to available
        const stillActive = bookings.filter(b =>
          b.id !== booking.id && ["ACTIVE","CONFIRMED"].includes(b.status)
        );
        if (stillActive.length === 0 && selectedPlot?.status === "reserved") {
          setPlots(prev => prev.map(p =>
            p.id === booking.plotId ? { ...p, status: "available" } : p
          ));
        }
        toast("Booking cancelled", "success");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // File upload
  async function handleFile(file: File) {
    if (!file.type.match(/image\/(png|jpeg|svg\+xml)/)) {
      toast("Please upload a PNG, JPG or SVG file", "warning"); return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setImageUrl(url);
      const img = new Image();
      img.onload = () => { setImgDims({ w: img.naturalWidth, h: img.naturalHeight }); setImage(url); setTimeout(fitAll, 80); };
      img.src = url;
      toast("Image uploaded and saved", "success");
    } catch {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { setImgDims({ w: img.naturalWidth, h: img.naturalHeight }); setImage(url); setTimeout(fitAll, 80); };
      img.src = url;
      toast("Image loaded locally (upload failed)", "warning");
    } finally {
      setIsUploading(false);
    }
  }

  function exportJSON() {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([JSON.stringify(plots, null, 2)], {type:"application/json"})),
      download: `${projectName.replace(/\s+/g,"-").toLowerCase()}-layout.json`,
    });
    a.click();
  }

  function startEditName() { setNameInput(projectName); setEditingName(true); }
  function finishEditName() {
    const v = nameInput.trim();
    if (v) setProjectName(v);
    setEditingName(false);
  }

  function SaveIndicator() {
    if (saveStatus === "saving") return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    );
    if (saveStatus === "saved") return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="w-3 h-3" /> Saved {lastSaved ? new Date(lastSaved).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}
      </span>
    );
    return <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>;
  }

  const { tx, ty, scale } = xform;
  const gStyle: React.CSSProperties = {
    transform:       `translate(${tx}px,${ty}px) scale(${scale})`,
    transformOrigin: "0 0",
    transition:      animated ? `transform ${DURATION}ms cubic-bezier(0.25,0.46,0.45,0.94)` : "none",
  };

  const activeBookings = bookings.filter(b => ["ACTIVE","CONFIRMED"].includes(b.status));

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0 flex-wrap">
        <Link href="/layout-projects" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Projects</span>
        </Link>
        <div className="w-px h-5 bg-slate-600" />
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {editingName ? (
            <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value)}
              onBlur={finishEditName}
              onKeyDown={e=>{ if(e.key==="Enter") finishEditName(); if(e.key==="Escape") setEditingName(false); }}
              className="bg-slate-700 text-white text-sm font-bold px-2 py-1 rounded-lg border border-primary-500 outline-none min-w-0 max-w-xs"
            />
          ) : (
            <button onClick={startEditName} className="text-white font-bold text-sm truncate max-w-[200px] hover:text-primary-300 transition-colors" title="Click to rename">
              {projectName}
            </button>
          )}
        </div>
        <div className="flex-shrink-0"><SaveIndicator /></div>
        <div className="w-px h-5 bg-slate-600" />
        <div className="flex bg-slate-700 rounded-lg p-0.5 gap-0.5">
          {([
            { m:"view"        as EditorMode, Icon:MousePointer, label:"View"          },
            { m:"draw"        as EditorMode, Icon:PenTool,      label:"Draw Plot"     },
            { m:"edit-vertex" as EditorMode, Icon:Move,         label:"Edit Vertices" },
          ]).map(({ m, Icon, label }) => (
            <button key={m} onClick={()=>{ setMode(m); if(m!=="draw") cancelDraw(); }} title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${mode===m ? "bg-primary-600 text-white" : "text-slate-300 hover:text-white"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-slate-600" />
        <button onClick={()=>zoomBy(1.3)}   title="Zoom In"  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ZoomIn    className="w-4 h-4" /></button>
        <button onClick={()=>zoomBy(1/1.3)} title="Zoom Out" className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ZoomOut   className="w-4 h-4" /></button>
        <button onClick={resetZoom}         title="Reset"    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={fitAll}            title="Fit All"  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><Maximize2 className="w-4 h-4" /></button>
        <span className="text-slate-500 text-xs font-mono w-10 text-center">{Math.round(scale*100)}%</span>
        <div className="w-px h-5 bg-slate-600" />
        <button onClick={()=>setLabels(v=>!v)} title={labels?"Hide labels":"Show labels"}
          className={`p-1.5 rounded-lg transition-colors ${labels?"text-amber-400":"text-slate-500 hover:text-white"} hover:bg-slate-700`}
        >
          {labels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <div className="flex-1" />
        <div className="hidden lg:flex items-center gap-3 mr-2">
          {(["available","sold","reserved"] as PlotStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${STATUS[s].dot}`} />
              {STATUS[s].label}
            </span>
          ))}
        </div>
        <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas ──────────────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden select-none">

          {mode === "view" && !selectedId && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-slate-800/80 backdrop-blur text-slate-300 text-xs px-4 py-2 rounded-full border border-slate-600">
                Click a plot to zoom in · Click background or ESC to zoom out
              </div>
            </div>
          )}
          {mode === "draw" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              <PenTool className="w-3.5 h-3.5" />
              {drawPts.length===0 ? "Click to start drawing" : drawPts.length<3 ? `${drawPts.length} points — keep clicking` : "Click first point to close · ESC to cancel"}
              {drawPts.length > 0 && <button onClick={cancelDraw} className="ml-1 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>}
            </div>
          )}
          {mode === "edit-vertex" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                <Move className="w-3.5 h-3.5 inline mr-1.5" />Drag white handles to reposition vertices · ESC to exit
              </div>
            </div>
          )}

          {!image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <ImageIcon className="w-14 h-14 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Upload a layout image or draw plots on the grid</p>
              </div>
            </div>
          )}

          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: mode==="draw" ? "crosshair" : panning.current ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={onSVGClick}
          >
            <rect x={-99999} y={-99999} width={199999} height={199999} fill="transparent" data-bg="1" onClick={onBgClick} />
            <g style={gStyle}>
              {!image && (
                <>
                  <defs>
                    <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
                      <path d="M40 0L0 0 0 40" fill="none" stroke="#334155" strokeWidth={0.5} />
                    </pattern>
                    <pattern id="grid5" width={200} height={200} patternUnits="userSpaceOnUse">
                      <rect width={200} height={200} fill="url(#grid)" />
                      <path d="M200 0L0 0 0 200" fill="none" stroke="#475569" strokeWidth={1} />
                    </pattern>
                  </defs>
                  <rect x={0} y={0} width={500} height={500} fill="url(#grid5)" rx={4} />
                </>
              )}
              {image && <image href={image} x={0} y={0} width={imgDims.w} height={imgDims.h} preserveAspectRatio="xMidYMid meet" />}
              {plots.map(plot => {
                const cfg = STATUS[plot.status];
                const isSelected = selectedId===plot.id, isHovered = hoveredId===plot.id;
                const [cx,cy] = centroid(plot.coordinates);
                const strokeW = (isSelected ? 2.5 : 1.5)/scale;
                const fillColor = (isSelected||isHovered) ? cfg.zoom : cfg.fill;
                return (
                  <g key={plot.id}>
                    <polygon points={pts(plot.coordinates)} fill={fillColor} stroke={cfg.stroke}
                      strokeWidth={strokeW} strokeLinejoin="round"
                      style={{ cursor: mode==="draw" ? "crosshair" : "pointer" }}
                      onClick={e=>onPlotClick(e,plot)}
                      onMouseEnter={()=>setHovered(plot.id)}
                      onMouseLeave={()=>setHovered(null)}
                    />
                    {isSelected && (
                      <polygon points={pts(plot.coordinates)} fill="none" stroke={cfg.stroke}
                        strokeWidth={4/scale} strokeDasharray={`${8/scale},${4/scale}`}
                        opacity={0.5} pointerEvents="none"
                        style={{ animation:"dash 1.5s linear infinite" }}
                      />
                    )}
                    {labels && (
                      <>
                        <text x={cx} y={cy-7/scale} textAnchor="middle" fontSize={12/scale} fill={cfg.stroke} fontWeight="700" pointerEvents="none" style={{userSelect:"none"}}>{plot.name}</text>
                        <text x={cx} y={cy+8/scale} textAnchor="middle" fontSize={10/scale} fill={cfg.stroke} opacity={0.8} pointerEvents="none" style={{userSelect:"none"}}>{plot.size}</text>
                      </>
                    )}
                    {mode==="edit-vertex" && isSelected && plot.coordinates.map(([vx,vy],i)=>(
                      <circle key={i} cx={vx} cy={vy} r={7/scale} fill="white" stroke={cfg.stroke} strokeWidth={2/scale}
                        style={{cursor:"move"}}
                        onMouseDown={e=>{ e.stopPropagation(); vertexDrag.current={plotId:plot.id,idx:i}; }}
                      />
                    ))}
                  </g>
                );
              })}
              {mode==="draw" && drawPts.length>0 && (
                <g>
                  {drawPts.length>=3 && <polygon points={pts(drawPts)} fill="rgba(99,102,241,0.12)" stroke="none" pointerEvents="none" />}
                  <polyline points={[...drawPts,mousePos].map(c=>c.join(",")).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2/scale} strokeDasharray={`${6/scale},${3/scale}`} pointerEvents="none" />
                  {drawPts.length>=2 && <line x1={mousePos[0]} y1={mousePos[1]} x2={drawPts[0][0]} y2={drawPts[0][1]} stroke="#6366f1" strokeWidth={1/scale} strokeDasharray={`${3/scale},${3/scale}`} opacity={0.35} pointerEvents="none" />}
                  {drawPts.map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r={(i===0&&drawPts.length>=3?9:5)/scale}
                      fill={i===0?"#6366f1":"white"} stroke="#6366f1" strokeWidth={2/scale}
                      style={{cursor:i===0&&drawPts.length>=3?"pointer":"crosshair"}}
                      onClick={e=>{if(i===0&&drawPts.length>=3){e.stopPropagation();setShowForm(true);}}}
                    />
                  ))}
                  <g transform={`translate(${mousePos[0]+12/scale},${mousePos[1]-16/scale})`}>
                    <rect width={76/scale} height={16/scale} rx={3/scale} fill="rgba(99,102,241,0.9)" />
                    <text x={4/scale} y={11/scale} fontSize={9/scale} fill="white" style={{userSelect:"none"}}>{mousePos[0]}, {mousePos[1]}</text>
                  </g>
                </g>
              )}
            </g>
          </svg>

          {hoveredId && mode==="view" && (() => {
            const p = plots.find(x=>x.id===hoveredId)!;
            const c = STATUS[p.status];
            return (
              <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-xl pointer-events-none z-10 min-w-[170px]">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-white text-sm">{p.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>{c.label}</span>
                </div>
                <p className="text-xs text-slate-400">{p.size} · {p.facing}</p>
                <p className="text-sm font-semibold text-primary-400 mt-1">{p.price}</p>
                <p className="text-[10px] text-slate-500 mt-2">Click to zoom in</p>
              </div>
            );
          })()}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden flex-shrink-0">

          {/* Tabs */}
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {([
              { id:"project" as const, Icon:Building2, label:"Project" },
              { id:"info"    as const, Icon:Info,      label:"Plot"    },
              { id:"plots"   as const, Icon:List,      label:"Plots"   },
              { id:"upload"  as const, Icon:Upload,    label:"Upload"  },
            ]).map(({ id: tabId, Icon, label }) => (
              <button key={tabId} onClick={()=>setTab(tabId)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab===tabId ? "border-primary-600 text-primary-700" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {tabId==="plots" && <span className="bg-slate-100 text-slate-600 rounded-full px-1.5 text-[10px] font-bold leading-4">{plots.length}</span>}
                {tabId==="info" && selectedId && activeBookings.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 rounded-full px-1.5 text-[10px] font-bold leading-4">{activeBookings.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── Project tab ───────────────────────────────────────────── */}
            {tab==="project" && (
              <div className="p-4 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Project Details</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Project Name</label>
                  <input value={projectName} onChange={e=>setProjectName(e.target.value)} className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Location</label>
                  <input value={projectLocation} onChange={e=>setProjectLocation(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Project Status</label>
                  <select value={projectStatus} onChange={e=>setProjectStatus(e.target.value as LayoutProjectStatus)} className="input-base w-full">
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${PROJECT_STATUS_CONFIG[projectStatus].badge}`}>
                    {PROJECT_STATUS_CONFIG[projectStatus].label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Project Stats
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label:"Total Plots", value:stats.total,     color:"text-slate-700"   },
                      { label:"Available",   value:stats.available, color:"text-emerald-600" },
                      { label:"Sold",        value:stats.sold,      color:"text-red-600"     },
                      { label:"Reserved",    value:stats.reserved,  color:"text-amber-600"   },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white rounded-lg p-2 text-center border border-slate-100">
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-[10px] text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  {stats.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Sold %</span><span>{stats.soldPct}%</span></div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{width:`${stats.soldPct}%`}} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Info tab (plot + bookings) ─────────────────────────────── */}
            {tab==="info" && (
              <div className="p-4">
                {selectedPlot ? (
                  <div className="space-y-4">
                    {/* Plot header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-bold text-slate-800">{selectedPlot.name}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedPlot.id}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${STATUS[selectedPlot.status].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS[selectedPlot.status].dot}`} />
                        {STATUS[selectedPlot.status].label}
                      </span>
                    </div>

                    {/* Plot details */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                      {[
                        { Icon:Tag,        label:"Price",    value:selectedPlot.price },
                        { Icon:SquareCode, label:"Size",     value:selectedPlot.size },
                        { Icon:Compass,    label:"Facing",   value:selectedPlot.facing },
                        { Icon:MapPin,     label:"Vertices", value:`${selectedPlot.coordinates.length} points` },
                      ].map(({ Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">{label}</p>
                            <p className="text-sm font-semibold text-slate-800">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status quick-change (only if not sold) */}
                    {selectedPlot.status !== "sold" && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Change Status</p>
                        <div className="flex gap-2">
                          {(["available","reserved"] as PlotStatus[]).map(s => (
                            <button key={s} onClick={()=>changeStatus(selectedPlot.id,s)}
                              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors ${selectedPlot.status===s ? STATUS[s].badge : "text-slate-500 border-slate-200 hover:border-slate-300"}`}
                            >
                              {STATUS[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={()=>zoomToPlot(selectedPlot)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                        <Maximize2 className="w-3.5 h-3.5" /> Zoom
                      </button>
                      <button onClick={resetZoom} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                      </button>
                      <button onClick={()=>openEdit(selectedPlot)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold rounded-xl border border-primary-200 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={()=>{ if(confirm(`Delete "${selectedPlot.name}"?`)) deletePlot(selectedPlot.id); }} className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ── Bookings section ────────────────────────────────── */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Reservations</span>
                          {bookings.length > 0 && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{bookings.length}</span>
                          )}
                        </div>
                        {selectedPlot.status !== "sold" && (
                          <button
                            onClick={()=>{ setShowBookingForm(true); setBookingForm(BLANK_BOOKING); }}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Reserve
                          </button>
                        )}
                      </div>

                      {bookingsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-6">
                          <ClipboardList className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-slate-400 text-xs">No reservations yet</p>
                          {selectedPlot.status !== "sold" && (
                            <button onClick={()=>setShowBookingForm(true)} className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700">
                              + Add first reservation
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {bookings.map(booking => {
                            const bcfg = BOOKING_STATUS[booking.status];
                            const isExpanded = expandedBookingId === booking.id;
                            const isActive = ["ACTIVE","CONFIRMED"].includes(booking.status);
                            return (
                              <div key={booking.id} className={`rounded-xl border transition-colors ${isActive ? "border-amber-200 bg-amber-50/40" : "border-slate-100 bg-white"}`}>
                                {/* Booking header */}
                                <button
                                  onClick={()=>setExpandedBookingId(isExpanded ? null : booking.id)}
                                  className="w-full flex items-center gap-3 p-3 text-left"
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-amber-100" : "bg-slate-100"}`}>
                                    <User className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{booking.buyerName}</p>
                                    <p className="text-xs text-slate-400">{maskPhone(booking.buyerPhone)} · {fmtDate(booking.createdAt)}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bcfg.badge}`}>{bcfg.label}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>
                                </button>

                                {/* Expanded detail */}
                                {isExpanded && (
                                  <div className="border-t border-slate-100 px-3 pb-3">
                                    <div className="mt-3 space-y-2.5">
                                      <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={booking.buyerPhone} />
                                      {booking.buyerEmail && <Detail icon={<FileText className="w-3.5 h-3.5" />} label="Email" value={booking.buyerEmail} />}
                                      <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={booking.buyerAddress} />
                                      <Detail icon={<BadgeCheck className="w-3.5 h-3.5" />} label={ID_TYPES.find(t=>t.value===booking.buyerIdType)?.label ?? booking.buyerIdType} value={booking.buyerIdNumber} />
                                      {booking.bookingAmount && <Detail icon={<Banknote className="w-3.5 h-3.5" />} label="Token Amount" value={`₹${booking.bookingAmount.toLocaleString()}`} />}
                                      {booking.notes && <Detail icon={<FileText className="w-3.5 h-3.5" />} label="Notes" value={booking.notes} />}
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Booked by {booking.agent.name ?? booking.agent.email} on {fmtDate(booking.createdAt)}</span>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    {isActive && (
                                      <div className="flex gap-2 mt-3">
                                        {booking.status === "ACTIVE" && (
                                          <button
                                            onClick={()=>bookingAction(booking,"confirm")}
                                            disabled={!!actionLoading}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                                          >
                                            {actionLoading===booking.id+"confirm" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            Confirm
                                          </button>
                                        )}
                                        <button
                                          onClick={()=>setConfirmConvert(booking)}
                                          disabled={!!actionLoading}
                                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          Finalize Sale
                                        </button>
                                        <button
                                          onClick={()=>bookingAction(booking,"cancel")}
                                          disabled={!!actionLoading}
                                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                                          title="Cancel booking"
                                        >
                                          {actionLoading===booking.id+"cancel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Info className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No plot selected</p>
                    <p className="text-slate-400 text-xs mt-1">Click any plot on the canvas to view details and manage reservations</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Plots tab ─────────────────────────────────────────────── */}
            {tab==="plots" && (
              <div className="p-3 space-y-2">
                <button onClick={()=>{ setMode("draw"); setTab("info"); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Plot
                </button>
                {plots.map(plot => {
                  const cfg = STATUS[plot.status];
                  const isSel = selectedId===plot.id;
                  return (
                    <div key={plot.id} onClick={()=>{ setSelected(plot.id); setTab("info"); zoomToPlot(plot); }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${isSel ? "bg-primary-50 border-primary-200" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
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
                <div className="pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(["available","sold","reserved"] as PlotStatus[]).map(s => {
                      const count = plots.filter(p=>p.status===s).length;
                      return (
                        <div key={s} className={`rounded-lg p-2 text-center border ${STATUS[s].badge}`}>
                          <p className="text-lg font-bold">{count}</p>
                          <p className="text-[10px] capitalize">{s}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Upload tab ─────────────────────────────────────────────── */}
            {tab==="upload" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">Upload Layout Image</h3>
                  <p className="text-xs text-slate-500">PNG, JPG or SVG accepted. The image is uploaded and saved to your project.</p>
                </div>
                <div
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
                  onClick={()=>!isUploading&&fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragOver?"border-primary-400 bg-primary-50":"border-slate-200 hover:border-primary-300 hover:bg-slate-50"} ${isUploading?"pointer-events-none opacity-60":""}`}
                >
                  {isUploading ? (
                    <><Loader2 className="w-8 h-8 mx-auto mb-2 text-primary-500 animate-spin" /><p className="text-sm font-medium text-slate-600">Uploading…</p></>
                  ) : (
                    <>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver?"text-primary-500":"text-slate-300"}`} />
                      <p className="text-sm font-medium text-slate-600">Drop image here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden"
                    onChange={e=>{ const f=e.target.files?.[0]; if(f)handleFile(f); }} />
                </div>
                {image && (
                  <div className="space-y-2">
                    <img src={image} alt="Layout" className="w-full rounded-xl border border-slate-200 object-contain max-h-40 bg-slate-100" />
                    <p className="text-[10px] text-slate-400 text-center">{imgDims.w}×{imgDims.h}px</p>
                    <div className="flex gap-2">
                      <button onClick={fitAll} className="flex-1 text-xs py-1.5 bg-primary-50 text-primary-700 font-semibold rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors">Fit to View</button>
                      <button onClick={()=>{ setImage(null); setImageUrl(null); resetZoom(); }} className="text-xs py-1.5 px-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Draw form modal ──────────────────────────────────────────────────── */}
      {showForm && (
        <Modal title="New Plot Details" onClose={cancelDraw}>
          <div className="space-y-4">
            <Field label="Plot Name *">
              <input autoFocus value={drawForm.name} onChange={e=>setDrawForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Plot 107" className="input-base" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Size"><input value={drawForm.size}  onChange={e=>setDrawForm(f=>({...f,size:e.target.value}))}  placeholder="1200 sqft"  className="input-base" /></Field>
              <Field label="Price"><input value={drawForm.price} onChange={e=>setDrawForm(f=>({...f,price:e.target.value}))} placeholder="₹45 Lakhs" className="input-base" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Facing">
                <select value={drawForm.facing} onChange={e=>setDrawForm(f=>({...f,facing:e.target.value}))} className="input-base">
                  {FACINGS.map(f=><option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={drawForm.status} onChange={e=>setDrawForm(f=>({...f,status:e.target.value as PlotStatus}))} className="input-base">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </Field>
            </div>
            <p className="text-xs text-slate-400">{drawPts.length} vertices captured</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={cancelDraw} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={savePlot} disabled={!drawForm.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              <Save className="w-4 h-4" /> Save Plot
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit form modal ──────────────────────────────────────────────────── */}
      {editForm && (
        <Modal title="Edit Plot" onClose={()=>setEditForm(null)}>
          <div className="space-y-4">
            <Field label="Plot Name">
              <input autoFocus value={editForm.name} onChange={e=>setEditForm(f=>f&&({...f,name:e.target.value}))} className="input-base" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Size"><input value={editForm.size}  onChange={e=>setEditForm(f=>f&&({...f,size:e.target.value}))}  className="input-base" /></Field>
              <Field label="Price"><input value={editForm.price} onChange={e=>setEditForm(f=>f&&({...f,price:e.target.value}))} className="input-base" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Facing">
                <select value={editForm.facing} onChange={e=>setEditForm(f=>f&&({...f,facing:e.target.value}))} className="input-base">
                  {FACINGS.map(f=><option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={editForm.status} onChange={e=>setEditForm(f=>f&&({...f,status:e.target.value as PlotStatus}))} className="input-base">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={()=>setEditForm(null)} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* ── Add Reservation modal ────────────────────────────────────────────── */}
      {showBookingForm && selectedPlot && (
        <Modal title={`Reserve ${selectedPlot.name}`} onClose={()=>{ setShowBookingForm(false); setBookingForm(BLANK_BOOKING); }}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Buyer Name *">
                <input autoFocus value={bookingForm.buyerName} onChange={e=>setBookingForm(f=>({...f,buyerName:e.target.value}))} placeholder="Full name" className="input-base" />
              </Field>
              <Field label="Phone *">
                <input value={bookingForm.buyerPhone} onChange={e=>setBookingForm(f=>({...f,buyerPhone:e.target.value}))} placeholder="98765 43210" className="input-base" />
              </Field>
            </div>
            <Field label="Email (optional)">
              <input value={bookingForm.buyerEmail} onChange={e=>setBookingForm(f=>({...f,buyerEmail:e.target.value}))} placeholder="buyer@example.com" className="input-base" />
            </Field>
            <Field label="Address *">
              <textarea value={bookingForm.buyerAddress} onChange={e=>setBookingForm(f=>({...f,buyerAddress:e.target.value}))} rows={2} placeholder="Full postal address" className="input-base resize-none" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID Type *">
                <select value={bookingForm.buyerIdType} onChange={e=>setBookingForm(f=>({...f,buyerIdType:e.target.value as BuyerIdType}))} className="input-base">
                  {ID_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="ID Number *">
                <input value={bookingForm.buyerIdNumber} onChange={e=>setBookingForm(f=>({...f,buyerIdNumber:e.target.value}))} placeholder="XXXX XXXX XXXX" className="input-base" />
              </Field>
            </div>
            <Field label="Token Amount (₹)">
              <input type="number" value={bookingForm.bookingAmount} onChange={e=>setBookingForm(f=>({...f,bookingAmount:e.target.value}))} placeholder="e.g. 50000" className="input-base" />
            </Field>
            <Field label="Notes">
              <textarea value={bookingForm.notes} onChange={e=>setBookingForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Any remarks…" className="input-base resize-none" />
            </Field>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={()=>{ setShowBookingForm(false); setBookingForm(BLANK_BOOKING); }} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={submitBooking} disabled={bookingSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {bookingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
              Save Reservation
            </button>
          </div>
        </Modal>
      )}

      {/* ── Convert to Sale confirmation ─────────────────────────────────────── */}
      {confirmConvert && (
        <Modal title="Finalize Sale?" onClose={()=>setConfirmConvert(null)}>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">This action cannot be undone</p>
                  <p className="text-xs text-amber-700">
                    This will mark the sale as complete for <strong>{confirmConvert.buyerName}</strong> and cancel all other active reservations for <strong>{confirmConvert.plotName}</strong>. The plot will be marked <strong>Sold</strong>.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600">Sale Details</p>
              <Detail icon={<User className="w-3.5 h-3.5" />} label="Buyer" value={confirmConvert.buyerName} />
              <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={confirmConvert.buyerPhone} />
              {confirmConvert.bookingAmount && (
                <Detail icon={<Banknote className="w-3.5 h-3.5" />} label="Token Paid" value={`₹${confirmConvert.bookingAmount.toLocaleString()}`} />
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={()=>setConfirmConvert(null)} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button
              onClick={()=>bookingAction(confirmConvert,"convert-to-sale")}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Yes, Finalize Sale
            </button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes dash { to { stroke-dashoffset: -24; } }`}</style>
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-800 break-words">{value}</p>
      </div>
    </div>
  );
}
