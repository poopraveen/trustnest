export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getHouseholdsByWard } from "@/lib/ward-households";

export async function GET(req: NextRequest) {
  const ward = Number(req.nextUrl.searchParams.get("ward"));
  if (!ward || Number.isNaN(ward)) {
    return NextResponse.json({ error: "ward query param required" }, { status: 400 });
  }
  const households = getHouseholdsByWard(ward);
  return NextResponse.json({ ward, households, total: households.length });
}
