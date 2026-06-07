import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Object Detection | TrustNest",
  description: "Real-time object detection powered by RF-DETR / COCO-SSD — fully offline, on-device AI",
};

const ObjectDetectClient = dynamic(
  () => import("@/components/object-detect/ObjectDetectClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading detection model…</p>
        </div>
      </div>
    ),
  }
);

export default function ObjectDetectPage() {
  return <ObjectDetectClient />;
}
