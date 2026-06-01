import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/hbl-tenant";

// Public: list active tenants for login screen
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");

  // If ?all=1 require super-admin
  if (all) {
    const ctx = await getAdminContext(req);
    if (!ctx?.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tenants = await prisma.hblTenant.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ tenants });
  }

  // Public: only active tenants, minimal fields for branch selector
  const tenants = await prisma.hblTenant.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, address: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ tenants });
}

// Super-admin: create a new tenant
export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx?.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, legalName, address, email, gstin, fssai, phone, adminPin } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const exists = await prisma.hblTenant.findUnique({ where: { slug: cleanSlug } });
  if (exists) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  const tenant = await prisma.hblTenant.create({
    data: { name, slug: cleanSlug, legalName: legalName ?? "", address: address ?? "", email: email ?? "", gstin: gstin ?? "", fssai: fssai ?? "", phone: phone ?? "", adminPin: adminPin ?? "9999" },
  });
  return NextResponse.json({ tenant }, { status: 201 });
}
