import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Camera Posture Detection | TrustNest",
  description: "Real-time body posture detection using your iPhone camera — powered by TensorFlow.js MoveNet.",
};

const CameraPostureDetector = dynamic(
  () => import("@/components/wifi-posture/CameraPostureDetector"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading pose detection model…</p>
        </div>
      </div>
    ),
  }
);

export default function CameraPosturePage() {
  return <CameraPostureDetector />;
}
