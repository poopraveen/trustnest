import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/hbl-tenant";

// Member-facing: get products for their tenant (via session cookie)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") !== "false";

  // Resolve tenant from session or query param
  let tenantId: string | null = null;
  const token = req.cookies.get("hbl_session")?.value;
  if (token) {
    const session = await prisma.hblSession.findUnique({ where: { token } });
    if (session?.tenantId) tenantId = session.tenantId;
  }
  if (!tenantId) {
    const t = searchParams.get("tenantId");
    if (t) tenantId = t;
  }

  const products = await prisma.hblProduct.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(tenantId ? { tenantId } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantId = ctx.isSuperAdmin ? null : ctx.tenant.id;
  const { name, nameTa, category, price, mrp, stock, minStock, imageUrl, sku, barcode } = await req.json();
  if (!name || !category || price === undefined) return NextResponse.json({ error: "name, category, price required" }, { status: 400 });
  const product = await prisma.hblProduct.create({ data: { name, nameTa, category, price, mrp, stock: stock ?? 0, minStock: minStock ?? 10, imageUrl, sku, barcode, tenantId } });
  return NextResponse.json({ product }, { status: 201 });
}
