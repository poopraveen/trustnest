import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const members = await prisma.hblMember.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "EXPIRED" | "SUSPENDED" } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ members });
}
