"use client";

import { useEffect, useState } from "react";
import { Link } from "@/navigation";
import { FileText, Eye, X, Download, ExternalLink } from "lucide-react";

export interface RollWard {
  id: string;
  name: string;
  number: number;
  partNo?: number;
  sections?: string[];
  pollingStation?: string;
  male?: number;
  female?: number;
  electorate?: number;
  rollPdf?: string;
}

const fmt = (n?: number) => (n == null ? "—" : n.toLocaleString("en-IN"));

export default function WardRollsTable({
  wards,
  areaId = "veppampattu",
}: {
  wards: RollWard[];
  areaId?: string;
}) {
  const partHref = (part: number) =>
    `/ward-election/wards/${part}?area=${encodeURIComponent(areaId)}`;
  const [active, setActive] = useState<RollWard | null>(null);

  const totalMale = wards.reduce((s, w) => s + (w.male ?? 0), 0);
  const totalFemale = wards.reduce((s, w) => s + (w.female ?? 0), 0);
  const totalElectors = wards.reduce((s, w) => s + (w.electorate ?? 0), 0);

  // Lock body scroll while the viewer is open and close on Escape.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">Part</th>
              <th>Ward / Sections</th>
              <th>Polling Station</th>
              <th className="num">Male</th>
              <th className="num">Female</th>
              <th className="num">Electors</th>
              <th>Roll</th>
            </tr>
          </thead>
          <tbody>
            {wards.map((w) => (
              <tr key={w.id}>
                    <td className="font-bold text-slate-400">
                      {w.partNo ?? w.number ? (
                        <Link href={partHref(w.partNo ?? w.number)} className="text-indigo-600 hover:text-indigo-800">
                          {w.partNo ?? w.number}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="font-medium text-slate-800 max-w-xs">
                      <Link href={partHref(w.partNo ?? w.number)} className="hover:text-indigo-700">
                        {w.name}
                      </Link>
                  {w.sections && w.sections.length > 0 && (
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {w.sections.join(" · ")}
                    </span>
                  )}
                </td>
                <td className="text-slate-600 max-w-xs">{w.pollingStation ?? "—"}</td>
                <td className="num">{fmt(w.male)}</td>
                <td className="num">{fmt(w.female)}</td>
                <td className="num font-semibold">{fmt(w.electorate)}</td>
                <td>
                  {w.rollPdf ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActive(w)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <a
                        href={w.rollPdf}
                        download
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-slate-700 border-t-2 border-slate-200">
              <td colSpan={3} className="text-right pr-4">Total</td>
              <td className="num">{totalMale.toLocaleString("en-IN")}</td>
              <td className="num">{totalFemale.toLocaleString("en-IN")}</td>
              <td className="num">{totalElectors.toLocaleString("en-IN")}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {active && active.rollPdf && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Electoral Roll — Part {active.partNo ?? active.number}</span>
                </p>
                <p className="text-xs text-slate-400 truncate">{active.pollingStation}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={active.rollPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> New tab
                </a>
                <a
                  href={active.rollPdf}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-800"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={`${active.rollPdf}#view=FitH`}
              title={`Electoral Roll Part ${active.partNo ?? active.number}`}
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}
    </>
  );
}
