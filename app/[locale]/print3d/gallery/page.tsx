import { Images } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <Images className="w-12 h-12 mb-4" style={{ color: "#22d3ee" }} />
      <h1 className="text-2xl font-bold text-white mb-2">Community Gallery</h1>
      <p className="text-slate-400">Coming soon — browse community 3D prints here.</p>
    </div>
  );
}
