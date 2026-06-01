import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHblInvoice } from "@/lib/hbl-invoice";

async function getMember(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return null;
  const session = await prisma.hblSession.findUnique({ where: { token }, include: { member: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.member;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.hblOrder.findUnique({
    where: { id: params.id, memberId: member.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

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
    items: order.items.map((item) => ({
      sku: item.productId.slice(-6).toUpperCase(),
      description: item.product.name,
      mrpPerUnit: item.price * 1.15, // MRP = retail + ~15% markup for display
      qty: item.qty,
      retailPricePerUnit: item.price,
    })),
    volumePoints: order.totalAmount / 100,
  };

  const pdfBytes = await generateHblInvoice(invoiceData);

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="HBL-Invoice-${order.orderNo}.pdf"`,
      "Content-Length": pdfBytes.length.toString(),
    },
  });
}
