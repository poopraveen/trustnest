export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryVoters } from "@/lib/ward-voters";
import { isValidAreaId, resolveAreaId } from "@/lib/ward-election-areas";

function parseRequest(
  sp: URLSearchParams,
  body?: Record<string, unknown>
) {
  const wardRaw = body?.ward ?? sp.get("ward");
  const ward = wardRaw != null && wardRaw !== "" ? Number(wardRaw) : undefined;
  const house =
    body?.house != null
      ? String(body.house)
      : sp.get("house")
        ? decodeURIComponent(sp.get("house")!)
        : undefined;
  const q = (body?.q as string) ?? sp.get("q") ?? undefined;
  const page = body?.page != null ? Number(body.page) : sp.get("page") ? Number(sp.get("page")) : 1;
  const limit = Math.min(
    body?.limit != null ? Number(body.limit) : sp.get("limit") ? Number(sp.get("limit")) : 50,
    2000
  );
  const areaParam = (body?.areaId as string) ?? sp.get("area");
  const areaId =
    areaParam && isValidAreaId(areaParam) ? areaParam : resolveAreaId(areaParam);
  const allForWard =
    body?.allForWard === true ||
    sp.get("allForWard") === "1" ||
    sp.get("allForWard") === "true";

  return { ward, house: house || undefined, q, page, limit, areaId, allForWard };
}

async function handleQuery(params: ReturnType<typeof parseRequest>) {
  const { ward, house, q, page, limit, areaId, allForWard } = params;

  if (ward != null && Number.isNaN(ward)) {
    return NextResponse.json({ error: "Invalid ward" }, { status: 400 });
  }

  try {
    const result = allForWard
      ? queryVoters({ areaId, ward, q, page: 1, limit: 2000 })
      : queryVoters({ areaId, ward, house, q, page, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ward-election/voters]", err);
    return NextResponse.json({ error: "Voter data not available" }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  return handleQuery(parseRequest(req.nextUrl.searchParams));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return handleQuery(parseRequest(req.nextUrl.searchParams, body));
}
