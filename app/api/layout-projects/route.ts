import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const where = session.user.role === "ADMIN" ? {} : { ownerId: session.user.id };
    const projects = await (prisma as any).layoutProject.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { owner: { select: { name: true, email: true } } },
    });
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("GET /api/layout-projects:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const project = await (prisma as any).layoutProject.create({
      data: {
        name:        body.name?.trim() || "Untitled Project",
        description: body.description ?? null,
        location:    body.location    ?? null,
        totalArea:   body.totalArea   ?? null,
        ownerId:     session.user.id,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/layout-projects:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
