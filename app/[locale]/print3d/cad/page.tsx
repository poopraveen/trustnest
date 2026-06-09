"use client";

import dynamic from "next/dynamic";

const CADDesigner = dynamic(() => import("./CADDesigner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center"
      style={{ height: "calc(100vh - 3.5rem)", background: "#060912" }}
    >
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(249,115,22,0.3)", borderTopColor: "#f97316" }}
        />
        <p className="text-slate-400 text-sm">Loading CAD Designer…</p>
      </div>
    </div>
  ),
});

export default function CADPage() {
  return <CADDesigner />;
}
