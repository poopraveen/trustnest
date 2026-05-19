import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.user.role === "ADMIN" ? {} : { ownerId: session.user.id };
  const projects = await (prisma as any).layoutProject.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await (prisma as any).layoutProject.create({
    data: {
      name: body.name || "Untitled Project",
      description: body.description ?? null,
      location: body.location ?? null,
      totalArea: body.totalArea ?? null,
      ownerId: session.user.id,
      plots: [],
    },
  });
  return NextResponse.json(project, { status: 201 });
}
