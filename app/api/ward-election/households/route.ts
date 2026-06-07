export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getHouseholdsByWard } from "@/lib/ward-households";
import { isValidAreaId, resolveAreaId } from "@/lib/ward-election-areas";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ward = Number(sp.get("ward"));
  if (!ward || Number.isNaN(ward)) {
    return NextResponse.json({ error: "ward query param required" }, { status: 400 });
  }
  const areaParam = sp.get("area");
  const areaId =
    areaParam && isValidAreaId(areaParam) ? areaParam : resolveAreaId(areaParam);
  const households = getHouseholdsByWard(ward, areaId);
  return NextResponse.json({ ward, areaId, households, total: households.length });
}
