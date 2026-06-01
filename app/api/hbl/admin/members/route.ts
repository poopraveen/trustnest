import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere, nextMemberCode } from "@/lib/hbl-tenant";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const members = await prisma.hblMember.findMany({
    where: {
      ...tenantWhere(ctx),
      ...(status ? { status: status as "ACTIVE" | "EXPIRED" | "SUSPENDED" } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { memberCode: { contains: search, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, email, plan, months } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "name and phone required" }, { status: 400 });

  const tenantId = ctx.isSuperAdmin ? undefined : ctx.tenant.id;
  const tenantSlug = ctx.isSuperAdmin ? "hbl" : ctx.tenant.slug;

  // Check duplicate phone within tenant
  const exists = await prisma.hblMember.findFirst({ where: { phone, ...(tenantId ? { tenantId } : {}) } });
  if (exists) return NextResponse.json({ error: "Phone already registered in this branch" }, { status: 409 });

  const memberCode = tenantId ? await nextMemberCode(tenantSlug, tenantId) : undefined;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + (months ?? 1));

  const member = await prisma.hblMember.create({
    data: {
      name, phone, email: email ?? null,
      plan: plan ?? "BASIC",
      qrCode: randomUUID(),
      memberCode: memberCode ?? undefined,
      expiresAt,
      tenantId: tenantId ?? null,
    },
  });
  return NextResponse.json({ member }, { status: 201 });
}
