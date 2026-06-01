import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getMember(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return null;
  const session = await prisma.hblSession.findUnique({ where: { token }, include: { member: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.member;
}

function generateOrderNo() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `HBL-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.hblOrder.findMany({
    where: { memberId: member.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (member.status !== "ACTIVE") return NextResponse.json({ error: "Membership inactive" }, { status: 403 });

  const { items, pickupTime, notes } = await req.json();
  if (!items?.length) return NextResponse.json({ error: "No items in order" }, { status: 400 });

  const products = await prisma.hblProduct.findMany({
    where: { id: { in: items.map((i: { productId: string }) => i.productId) }, isActive: true },
  });

  let totalAmount = 0;
  const orderItems = items.map((item: { productId: string; qty: number }) => {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) throw new Error(`Product ${item.productId} not found`);
    totalAmount += p.price * item.qty;
    return { productId: p.id, qty: item.qty, price: p.price };
  });

  const order = await prisma.hblOrder.create({
    data: {
      memberId: member.id,
      orderNo: generateOrderNo(),
      totalAmount,
      pickupTime: pickupTime ? new Date(pickupTime) : null,
      notes,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  // Award 1 point per ₹100 spent
  const pointsEarned = Math.floor(totalAmount / 100);
  if (pointsEarned > 0) {
    await prisma.$transaction([
      prisma.hblMember.update({ where: { id: member.id }, data: { points: { increment: pointsEarned } } }),
      prisma.hblLoyaltyTxn.create({ data: { memberId: member.id, points: pointsEarned, reason: `Order ${order.orderNo}` } }),
    ]);
  }

  return NextResponse.json({ order, pointsEarned }, { status: 201 });
}
