import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export interface AdminContext {
  tenant: { id: string; name: string; slug: string; address: string; gstin: string; fssai: string; phone: string; adminPin: string; isActive: boolean };
  isSuperAdmin: boolean;
}

/** Returns AdminContext or null (unauthorized). */
export async function getAdminContext(req: NextRequest): Promise<AdminContext | null> {
  const pin = req.headers.get("x-hbl-admin");
  const tenantId = req.headers.get("x-hbl-tenant");
  if (!pin) return null;

  // Super-admin path — env PIN, no tenant required
  const envPin = process.env.HBL_ADMIN_PIN ?? "9999";
  if (!tenantId) {
    if (pin !== envPin) return null;
    // Return a synthetic super-admin context
    return { tenant: null as never, isSuperAdmin: true };
  }

  const tenant = await prisma.hblTenant.findUnique({ where: { id: tenantId } });
  if (!tenant || !tenant.isActive) return null;
  // Accept tenant PIN or super-admin env PIN
  if (tenant.adminPin !== pin && pin !== envPin) return null;
  return { tenant, isSuperAdmin: pin === envPin };
}

/** Prisma where-filter scoped to a tenant (or empty for super-admin). */
export function tenantWhere(ctx: AdminContext) {
  return ctx.isSuperAdmin && !ctx.tenant ? {} : { tenantId: ctx.tenant.id };
}

/** Generate next member code for a tenant, e.g. "VPT-0001".
 * memberCode is globally unique, so we count by prefix (not by tenant) to avoid
 * collisions between tenants whose slugs share the same first 3 letters. */
export async function nextMemberCode(tenantSlug: string, _tenantId: string): Promise<string> {
  const prefix = tenantSlug.slice(0, 3).toUpperCase();
  const count = await prisma.hblMember.count({ where: { memberCode: { startsWith: `${prefix}-` } } });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
