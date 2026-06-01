"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Leaf } from "lucide-react";

// Redirect QR scans from /hbl/qr/[token] → /api/hbl/qr/[token]
// The API sets the session cookie and redirects to dashboard.
export default function QrRedirectPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  useEffect(() => {
    // Navigate to the API route which sets cookie + redirects
    window.location.href = `/api/hbl/qr/${token}`;
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-500 flex flex-col items-center justify-center gap-5 p-6">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
        <Leaf className="w-10 h-10 text-green-600" />
      </div>
      <div className="text-center text-white">
        <h1 className="text-2xl font-black">Herbalife Club</h1>
        <p className="text-green-100 mt-1">Opening your dashboard…</p>
      </div>
      <div className="bg-white/20 rounded-2xl px-6 py-4 flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-medium">Signing you in</span>
      </div>
    </div>
  );
}
