import { TrendingUp, TrendingDown, Minus, ExternalLink, Download, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SLAStatus = "on-target" | "vulnerable" | "jeopardy" | "neutral";

interface KpiTileProps {
  label: string;
  labelTamil?: string;
  value: string;
  target?: string;
  progress?: number;        // 0–100 fill for progress bar
  delta?: number;
  deltaLabel?: string;
  status?: SLAStatus;
  source?: string;
  lastUpdated?: string;
  auditHref?: string;
  downloadHref?: string;
  methodologyHref?: string;
  icon?: React.ReactNode;
  className?: string;
  /** Overrides built-in English status pill text (use translated string). */
  badgeStatusText?: string;
  /** Overrides "{progress}% of target" line. */
  progressLineText?: string;
  /** Prefix before lastUpdated date (e.g. "Updated" / "புதுப்பிப்பு"). */
  updatedPrefix?: string;
  auditLinkText?: string;
  dataLinkText?: string;
  howLinkText?: string;
}

const statusConfig: Record<SLAStatus, {
  bg: string; fg: string; label: string;
  border: string; bar: string; glow: string;
}> = {
  "on-target":  { bg: "bg-sla-on-target-bg",  fg: "text-sla-on-target-fg",  label: "On Target",
                  border: "border-l-emerald-500", bar: "bg-emerald-500", glow: "bg-emerald-50" },
  "vulnerable": { bg: "bg-sla-vulnerable-bg", fg: "text-sla-vulnerable-fg", label: "At Risk",
                  border: "border-l-amber-500",   bar: "bg-amber-500",   glow: "bg-amber-50" },
  "jeopardy":   { bg: "bg-sla-jeopardy-bg",   fg: "text-sla-jeopardy-fg",   label: "Jeopardy",
                  border: "border-l-red-500",     bar: "bg-red-500",     glow: "bg-red-50" },
  "neutral":    { bg: "bg-slate-100",          fg: "text-slate-600",          label: "",
                  border: "border-l-slate-300",   bar: "bg-primary-500", glow: "bg-slate-50" },
};

export default function KpiTile({
  label, labelTamil, value, target, progress, delta, deltaLabel,
  status = "neutral", source, lastUpdated, auditHref,
  downloadHref, methodologyHref, icon, className,
  badgeStatusText, progressLineText, updatedPrefix,
  auditLinkText, dataLinkText, howLinkText,
}: KpiTileProps) {
  const cfg = statusConfig[status];
  const isUp   = delta !== undefined && delta > 0;
  const isDown = delta !== undefined && delta < 0;

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300",
      "border border-slate-100 border-l-4 flex flex-col gap-0 overflow-hidden group",
      cfg.border, className
    )}>
      {/* Top accent strip */}
      <div className={cn("h-0.5 w-full", cfg.bar, "opacity-60")} />

      <div className="p-5 flex flex-col gap-2.5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            {icon && (
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.glow)}>
                <span className={cn("text-sm", cfg.fg)}>{icon}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-700 leading-tight">{label}</p>
              {labelTamil && (
                <p className="text-xs text-slate-400 font-tamil mt-0.5">{labelTamil}</p>
              )}
            </div>
          </div>
          {status !== "neutral" && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap",
              cfg.bg, cfg.fg
            )}>
              {badgeStatusText ?? cfg.label}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-data tabular-nums tracking-tight">
            {value}
          </span>
          {target && (
            <span className="text-xs text-slate-400 font-medium">/ {target}</span>
          )}
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {progressLineText ?? `${progress}% of target`}
            </p>
          </div>
        )}

        {/* Delta */}
        {delta !== undefined && (
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-md",
            isUp   ? "bg-success-100 text-success-600" :
            isDown ? "bg-danger-100 text-danger-600"   :
                     "bg-slate-100 text-slate-500"
          )}>
            {isUp   ? <TrendingUp  className="w-3.5 h-3.5" /> :
             isDown ? <TrendingDown className="w-3.5 h-3.5" /> :
                      <Minus className="w-3.5 h-3.5" />}
            <span>{delta > 0 ? "+" : ""}{delta}%</span>
            {deltaLabel && <span className="font-normal opacity-80">{deltaLabel}</span>}
          </div>
        )}

        {/* Trust strip */}
        {(source || lastUpdated || auditHref || downloadHref || methodologyHref) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100 mt-auto">
            {source && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {source}
              </span>
            )}
            {lastUpdated && (
              <span>{updatedPrefix ?? "Updated"} {lastUpdated}</span>
            )}
            {auditHref && (
              <a href={auditHref} className="flex items-center gap-0.5 hover:text-primary-600 transition-colors font-medium">
                <ExternalLink className="w-3 h-3" /> {auditLinkText ?? "Audit"}
              </a>
            )}
            {downloadHref && (
              <a href={downloadHref} className="flex items-center gap-0.5 hover:text-primary-600 transition-colors font-medium">
                <Download className="w-3 h-3" /> {dataLinkText ?? "Data"}
              </a>
            )}
            {methodologyHref && (
              <a href={methodologyHref} className="flex items-center gap-0.5 hover:text-primary-600 transition-colors font-medium">
                <HelpCircle className="w-3 h-3" /> {howLinkText ?? "How?"}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
