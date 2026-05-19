import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function adminOnly(session: any) {
  return !session || session.user.role !== "ADMIN";
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { seller: { select: { id: true, name: true, email: true } } },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { status, verified, featured, disabled } = body;

  const data: any = {};
  if (status) data.status = status;
  if (typeof verified === "boolean") data.verified = verified;
  if (typeof featured === "boolean") data.featured = featured;
  if (typeof disabled === "boolean") data.disabled = disabled;

  try {
    const property = await prisma.property.update({ where: { id: params.id }, data });
    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.property.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
