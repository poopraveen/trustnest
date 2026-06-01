import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/hbl-tenant";

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, memberId } = await req.json();

  const member = await prisma.hblMember.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  let message = "";
  if (type === "renewal") {
    const days = Math.ceil((member.expiresAt.getTime() - Date.now()) / 86400000);
    message = `Hi ${member.name}! Your Herbalife membership expires in ${days} days. Contact us to renew. 💚`;
  } else if (type === "welcome") {
    message = `Welcome to our Herbalife family, ${member.name}! 🌿 Your ${member.plan} membership is active. See you at the nutrition club!`;
  } else if (type === "order_ready") {
    message = `Hi ${member.name}! Your order is ready for pickup at the nutrition club. See you soon! 🥤`;
  }

  const whatsappUrl = `https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ success: true, whatsappUrl, message });
}
