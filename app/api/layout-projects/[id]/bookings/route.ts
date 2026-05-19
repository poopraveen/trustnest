import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BookingSchema = z.object({
  plotId:        z.string().min(1),
  plotName:      z.string().min(1),
  buyerName:     z.string().min(2),
  buyerPhone:    z.string().min(10),
  buyerEmail:    z.string().email().optional().nullable(),
  buyerAddress:  z.string().min(5),
  buyerIdType:   z.enum(["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE", "VOTER_ID"]),
  buyerIdNumber: z.string().min(4),
  bookingAmount: z.number().positive().optional().nullable(),
  notes:         z.string().optional().nullable(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await (prisma as any).layoutProject.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (session.user.role !== "ADMIN" && project.ownerId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const bookings = await (prisma as any).plotBooking.findMany({
      where: { projectId: params.id },
      include: { agent: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error("GET /api/layout-projects/[id]/bookings:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await (prisma as any).layoutProject.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (session.user.role !== "ADMIN" && project.ownerId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Check if plot is sold — no new bookings on sold plots
    const plots: any[] = Array.isArray(project.plots) ? project.plots : JSON.parse(project.plots as string || "[]");
    const plot = plots.find((p: any) => p.id === data.plotId);
    if (plot?.status === "sold") {
      return NextResponse.json({ error: "Plot is already sold" }, { status: 409 });
    }

    // Create booking
    const booking = await (prisma as any).plotBooking.create({
      data: {
        projectId:     params.id,
        plotId:        data.plotId,
        plotName:      data.plotName,
        buyerName:     data.buyerName,
        buyerPhone:    data.buyerPhone,
        buyerEmail:    data.buyerEmail ?? null,
        buyerAddress:  data.buyerAddress,
        buyerIdType:   data.buyerIdType,
        buyerIdNumber: data.buyerIdNumber,
        bookingAmount: data.bookingAmount ?? null,
        notes:         data.notes ?? null,
        agentId:       session.user.id,
      },
      include: { agent: { select: { name: true, email: true } } },
    });

    // Update plot status to "reserved" if it was "available"
    if (plot && plot.status === "available") {
      const updatedPlots = plots.map((p: any) =>
        p.id === data.plotId ? { ...p, status: "reserved" } : p
      );
      await (prisma as any).layoutProject.update({
        where: { id: params.id },
        data: { plots: updatedPlots },
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/layout-projects/[id]/bookings:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
