import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHblInvoice } from "@/lib/hbl-invoice";

async function getMember(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return null;
  const session = await prisma.hblSession.findUnique({
    where: { token },
    include: { member: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.member;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const member = await getMember(req);
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") ?? "download";

    const order = await prisma.hblOrder.findFirst({
      where: { id: params.id, memberId: member.id },
      include: { items: { include: { product: true } }, tenant: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Seller details come from the order's tenant (branch). Fall back to the
    // member's tenant if the order pre-dates multi-tenant support.
    const tenant =
      order.tenant ??
      (member.tenantId
        ? await prisma.hblTenant.findUnique({ where: { id: member.tenantId } })
        : null);

    const seller = tenant
      ? {
          name: tenant.name,
          legalName: tenant.legalName,
          address: tenant.address,
          gstin: tenant.gstin,
          fssai: tenant.fssai,
          phone: tenant.phone,
          email: tenant.email,
        }
      : undefined;

    const invoiceData = {
      orderNo: order.orderNo,
      invoiceNo: `INV-${order.orderNo}`,
      orderDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      }),
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email ?? undefined,
      },
      shipTo: {
        name: member.name,
        address: `Ph: ${member.phone}${member.email ? " | " + member.email : ""}`,
      },
      items: order.items.map((item) => {
        const prod = item.product as typeof item.product & { sku?: string | null; mrp?: number | null };
        return {
          sku: prod.sku ?? item.productId.slice(-6).toUpperCase(),
          description: prod.name,
          mrpPerUnit: prod.mrp ?? item.price * 1.15,
          qty: item.qty,
          retailPricePerUnit: item.price,
        };
      }),
      volumePoints: Math.round(order.totalAmount / 100),
      seller,
    };

    // Generate PDF — returns Uint8Array
    const pdfBytes = await generateHblInvoice(invoiceData);

    const disposition =
      mode === "view"
        ? "inline"
        : `attachment; filename="HBL-Invoice-${order.orderNo}.pdf"`;

    // Use native Response with ArrayBuffer — NextResponse corrupts binary data in App Router
    return new Response(pdfBytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[HBL invoice]", err);
    return NextResponse.json(
      { error: "Failed to generate invoice", detail: String(err) },
      { status: 500 }
    );
  }
}
