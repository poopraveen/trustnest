"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "@/navigation";
import { toast } from "@/components/ui/Toaster";

interface Props {
  entityId: string;
  entityType: "property" | "product";
}

export default function AdminDashboardTabs({ entityId, entityType }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function action(status: "APPROVED" | "REJECTED") {
    setLoading(status === "APPROVED" ? "approve" : "reject");
    const endpoint =
      entityType === "property"
        ? `/api/admin/properties/${entityId}`
        : `/api/admin/products/${entityId}`;
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast(
      status === "APPROVED" ? "Approved and live!" : "Rejected",
      status === "APPROVED" ? "success" : "warning"
    );
    setLoading(null);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => action("APPROVED")}
        disabled={!!loading}
        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Approve
      </button>
      <button
        onClick={() => action("REJECTED")}
        disabled={!!loading}
        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        Reject
      </button>
    </>
  );
}
