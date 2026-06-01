import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Super-admin bootstrap: creates the first tenant + assigns existing orphan members/products to it
// Requires env HBL_ADMIN_PIN (default 9999)
export async function POST(req: NextRequest) {
  const pin = req.headers.get("x-hbl-admin");
  const envPin = process.env.HBL_ADMIN_PIN ?? "9999";
  if (pin !== envPin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, address, gstin, fssai, phone } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  // Create or return existing tenant with this slug
  let tenant = await prisma.hblTenant.findUnique({ where: { slug: cleanSlug } });
  if (!tenant) {
    tenant = await prisma.hblTenant.create({
      data: { name, slug: cleanSlug, address: address ?? "", gstin: gstin ?? "", fssai: fssai ?? "", phone: phone ?? "", adminPin: envPin },
    });
  } else {
    tenant = await prisma.hblTenant.update({ where: { id: tenant.id }, data: { name, address: address ?? tenant.address } });
  }

  // Assign orphan members (no tenantId) to this tenant and generate memberCodes
  const orphans = await prisma.hblMember.findMany({ where: { tenantId: null } });
  const prefix = cleanSlug.slice(0, 3).toUpperCase();
  let i = 0;
  for (const m of orphans) {
    i++;
    const memberCode = `${prefix}-${String(i).padStart(4, "0")}`;
    await prisma.hblMember.update({
      where: { id: m.id },
      data: { tenantId: tenant.id, memberCode: m.memberCode ?? memberCode },
    }).catch(() => {});
  }

  // Assign orphan products
  await prisma.hblProduct.updateMany({ where: { tenantId: null }, data: { tenantId: tenant.id } });

  // Assign orphan orders
  await prisma.hblOrder.updateMany({ where: { tenantId: null }, data: { tenantId: tenant.id } });

  // Assign orphan sessions
  await prisma.hblSession.updateMany({ where: { tenantId: null }, data: { tenantId: tenant.id } });

  return NextResponse.json({ tenant, migrated: { members: orphans.length } }, { status: 201 });
}
