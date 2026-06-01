import type { Metadata } from "next";
import { Link } from "@/navigation";
import { ArrowLeft } from "lucide-react";
import WardDetailView from "@/components/ward-election/WardDetailView";
import { WARD_ANALYTICS } from "@/lib/ward-election-analytics";
import { WARDS } from "@/lib/ward-election-data";

export function generateStaticParams() {
  const parts = new Set<number>();
  WARDS.forEach((w) => { if (w.partNo) parts.add(w.partNo); });
  WARD_ANALYTICS.forEach((w) => parts.add(w.ward));
  return [...parts].map((part) => ({ part: String(part) }));
}

export async function generateMetadata({
  params,
}: {
  params: { part: string };
}): Promise<Metadata> {
  return { title: `Part ${params.part} | Ward Election` };
}

export default function WardDetailPage({ params }: { params: { part: string } }) {
  const part = Number(params.part);
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/ward-election" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> All wards
        </Link>
        <WardDetailView part={part} />
      </div>
    </div>
  );
}
