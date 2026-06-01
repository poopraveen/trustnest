export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryVoters } from "@/lib/ward-voters";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ward = sp.get("ward") ? Number(sp.get("ward")) : undefined;
  const house = sp.get("house") || undefined;
  const q = sp.get("q") || undefined;
  const page = sp.get("page") ? Number(sp.get("page")) : 1;
  const limit = Math.min(sp.get("limit") ? Number(sp.get("limit")) : 50, 100);

  if (ward != null && Number.isNaN(ward)) {
    return NextResponse.json({ error: "Invalid ward" }, { status: 400 });
  }

  try {
    const result = queryVoters({ ward, house, q, page, limit });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Voter data not available" }, { status: 503 });
  }
}
