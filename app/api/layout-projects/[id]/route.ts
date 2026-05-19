import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize(id: string, session: any) {
  try {
    const p = await (prisma as any).layoutProject.findUnique({ where: { id } });
    if (!p) return null;
    if (session.user.role !== "ADMIN" && p.ownerId !== session.user.id) return null;
    return p;
  } catch {
    return null;
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p = await authorize(params.id, session);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(p);
  } catch (err: any) {
    console.error("GET /api/layout-projects/[id]:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await authorize(params.id, session);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const data: any = {};
    if (body.name        !== undefined) data.name        = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.location    !== undefined) data.location    = body.location;
    if (body.totalArea   !== undefined) data.totalArea   = body.totalArea;
    if (body.imageUrl    !== undefined) data.imageUrl    = body.imageUrl;
    if (body.status      !== undefined) data.status      = body.status;
    if (body.plots       !== undefined) data.plots       = body.plots;

    const updated = await (prisma as any).layoutProject.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/layout-projects/[id]:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await authorize(params.id, session);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await (prisma as any).layoutProject.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/layout-projects/[id]:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
