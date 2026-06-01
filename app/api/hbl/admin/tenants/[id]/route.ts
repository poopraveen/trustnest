import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/hbl-tenant";

// Admin (own tenant) or super-admin: update tenant details
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Tenant admin can only update their own tenant
  if (!ctx.isSuperAdmin && ctx.tenant.id !== params.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, address, gstin, fssai, phone, adminPin, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (address !== undefined) data.address = address;
  if (gstin !== undefined) data.gstin = gstin;
  if (fssai !== undefined) data.fssai = fssai;
  if (phone !== undefined) data.phone = phone;
  if (adminPin !== undefined) data.adminPin = adminPin;
  if (isActive !== undefined && ctx.isSuperAdmin) data.isActive = isActive;

  const tenant = await prisma.hblTenant.update({ where: { id: params.id }, data });
  return NextResponse.json({ tenant });
}

// Super-admin only: delete tenant
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAdminContext(req);
  if (!ctx?.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.hblTenant.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
