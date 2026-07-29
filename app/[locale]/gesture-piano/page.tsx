import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Gesture Piano | TrustNest",
  description: "Play a piano in the air — on-device hand-tracking turns your webcam into a touchless keyboard",
};

const GesturePianoClient = dynamic(
  () => import("@/components/gesture-piano/GesturePianoClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading hand-tracking model…</p>
        </div>
      </div>
    ),
  }
);

export default function GesturePianoPage() {
  return <GesturePianoClient />;
}
