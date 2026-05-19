"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useRouter } from "@/navigation";
import {
  Plus, Search, LayoutGrid, MapPin, Trash2, ExternalLink,
  CheckCircle2, Clock, Archive, AlertCircle, TrendingUp,
  BarChart3, Home, Loader2, X,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

// ─── Types ────────────────────────────────────────────────────────────────────

type LayoutProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "ARCHIVED";
type PlotStatus = "available" | "sold" | "reserved";

interface Plot {
  id: string;
  name: string;
  status: PlotStatus;
  size: string;
  price: string;
  facing: string;
  coordinates: [number, number][];
}

interface LayoutProject {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  totalArea: string | null;
  imageUrl: string | null;
  status: LayoutProjectStatus;
  plots: Plot[];
  ownerId: string;
  owner: { name: string | null; email: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LayoutProjectStatus, {
  label: string;
  badge: string;
  dot: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  ACTIVE:    { label: "Active",    badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2  },
  COMPLETED: { label: "Completed", badge: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-500",   Icon: CheckCircle2  },
  ON_HOLD:   { label: "On Hold",   badge: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500",  Icon: Clock         },
  ARCHIVED:  { label: "Archived",  badge: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400",  Icon: Archive       },
};

const FILTER_TABS: { key: "ALL" | LayoutProjectStatus; label: string }[] = [
  { key: "ALL",       label: "All"       },
  { key: "ACTIVE",    label: "Active"    },
  { key: "COMPLETED", label: "Completed" },
  { key: "ON_HOLD",   label: "On Hold"   },
  { key: "ARCHIVED",  label: "Archived"  },
];

function computePlotStats(plots: Plot[]) {
  const total     = plots.length;
  const available = plots.filter(p => p.status === "available").length;
  const sold      = plots.filter(p => p.status === "sold").length;
  const reserved  = plots.filter(p => p.status === "reserved").length;
  const soldPct   = total > 0 ? Math.round((sold / total) * 100) : 0;
  return { total, available, sold, reserved, soldPct };
}

// ─── PlotBar — mini horizontal bar showing plot status proportions ─────────

function PlotBar({ plots }: { plots: Plot[] }) {
  const { total, available, sold, reserved } = computePlotStats(plots);
  if (total === 0) {
    return <div className="h-2 bg-slate-100 rounded-full" />;
  }
  return (
    <div className="h-2 flex rounded-full overflow-hidden gap-px">
      {available > 0 && (
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${(available / total) * 100}%` }}
          title={`${available} available`}
        />
      )}
      {sold > 0 && (
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${(sold / total) * 100}%` }}
          title={`${sold} sold`}
        />
      )}
      {reserved > 0 && (
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${(reserved / total) * 100}%` }}
          title={`${reserved} reserved`}
        />
      )}
    </div>
  );
}

// ─── New Project Modal ────────────────────────────────────────────────────────

function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: LayoutProject) => void;
}) {
  const [name, setName]           = useState("");
  const [location, setLocation]   = useState("");
  const [description, setDesc]    = useState("");
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/layout-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), location: location.trim() || null, description: description.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project: LayoutProject = await res.json();
      onCreate(project);
      toast("Project created! Opening layout editor…", "success");
      router.push(`/layout-projects/${project.id}`);
    } catch {
      toast("Failed to create project", "error");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-lg">New Layout Project</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project Name *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Green Valley Phase 2"
              className="input-base w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location (optional)</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Chennai, Tamil Nadu"
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief description of the project…"
              rows={3}
              className="input-base w-full resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? "Creating…" : "Create & Open"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onDelete,
}: {
  project: LayoutProject;
  onDelete: (id: string) => void;
}) {
  const cfg   = STATUS_CONFIG[project.status];
  const plots = Array.isArray(project.plots) ? (project.plots as unknown as Plot[]) : [];
  const stats = computePlotStats(plots);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    onDelete(project.id);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col">
      {/* Card header */}
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{project.name}</h3>
            {project.location && (
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </p>
            )}
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Plot bar */}
        <div className="mb-3">
          <PlotBar plots={plots} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Total",     value: stats.total,     color: "text-slate-700" },
            { label: "Available", value: stats.available, color: "text-emerald-600" },
            { label: "Sold",      value: stats.sold,      color: "text-red-600"   },
            { label: "Reserved",  value: stats.reserved,  color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Sold % bar */}
        {stats.total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Sold</span>
              <span>{stats.soldPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${stats.soldPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Updated */}
        <p className="text-[10px] text-slate-400">
          Updated {new Date(project.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <Link
          href={`/layout-projects/${project.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Layout
        </Link>
        <button
          onClick={handleDelete}
          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LayoutProjectsPage() {
  const [projects, setProjects]   = useState<LayoutProject[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | LayoutProjectStatus>("ALL");
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/layout-projects");
      if (!res.ok) throw new Error("Failed");
      const data: LayoutProject[] = await res.json();
      setProjects(data);
    } catch {
      toast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/layout-projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setProjects(prev => prev.filter(p => p.id !== id));
      toast("Project deleted", "success");
    } catch {
      toast("Failed to delete project", "error");
    }
  }

  // Filtered projects
  const filtered = projects.filter(p => {
    const matchStatus = statusTab === "ALL" || p.status === statusTab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.location ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Global stats
  const allPlots   = projects.flatMap(p => Array.isArray(p.plots) ? (p.plots as unknown as Plot[]) : []);
  const globalStats = computePlotStats(allPlots);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="w-5 h-5 text-primary-600" />
                <h1 className="text-2xl font-bold text-slate-800">Layout Projects</h1>
              </div>
              <p className="text-slate-500 text-sm">Manage your real estate layout plans and track plot sales</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Layout Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Projects", value: projects.length,       icon: LayoutGrid,   color: "text-primary-600",  bg: "bg-primary-50"  },
            { label: "Total Plots",    value: globalStats.total,     icon: Home,         color: "text-slate-700",    bg: "bg-slate-100"   },
            { label: "Available",      value: globalStats.available, icon: CheckCircle2, color: "text-emerald-600",  bg: "bg-emerald-50"  },
            { label: "Sold",           value: globalStats.sold,      icon: TrendingUp,   color: "text-red-600",      bg: "bg-red-50"      },
            { label: "Reserved",       value: globalStats.reserved,  icon: AlertCircle,  color: "text-amber-600",    bg: "bg-amber-50"    },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location…"
              className="input-base pl-9 w-full"
            />
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusTab === key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
                {key !== "ALL" && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {projects.filter(p => p.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">
              {projects.length === 0 ? "No projects yet" : "No matching projects"}
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              {projects.length === 0
                ? "Create your first layout project to start tracking plot sales."
                : "Try adjusting your search or filter."}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
