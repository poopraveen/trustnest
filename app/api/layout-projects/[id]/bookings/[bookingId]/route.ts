import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorizeProject(projectId: string, session: any) {
  const project = await (prisma as any).layoutProject.findUnique({ where: { id: projectId } });
  if (!project) return null;
  if (session.user.role !== "ADMIN" && project.ownerId !== session.user.id) return null;
  return project;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; bookingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await authorizeProject(params.id, session);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const booking = await (prisma as any).plotBooking.findUnique({ where: { id: params.bookingId } });
    if (!booking || booking.projectId !== params.id)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const body = await req.json();
    const { action } = body; // "cancel" | "confirm" | "convert-to-sale"

    if (action === "cancel") {
      const updated = await (prisma as any).plotBooking.update({
        where: { id: params.bookingId },
        data: { status: "CANCELLED" },
      });

      // If no more ACTIVE/CONFIRMED bookings for this plot, revert to available
      const remaining = await (prisma as any).plotBooking.count({
        where: {
          projectId: params.id,
          plotId: booking.plotId,
          status: { in: ["ACTIVE", "CONFIRMED"] },
        },
      });
      if (remaining === 0) {
        const plots: any[] = Array.isArray(project.plots) ? project.plots : JSON.parse(project.plots || "[]");
        const updatedPlots = plots.map((p: any) =>
          p.id === booking.plotId ? { ...p, status: "available" } : p
        );
        await (prisma as any).layoutProject.update({
          where: { id: params.id },
          data: { plots: updatedPlots },
        });
      }
      return NextResponse.json(updated);
    }

    if (action === "confirm") {
      const updated = await (prisma as any).plotBooking.update({
        where: { id: params.bookingId },
        data: { status: "CONFIRMED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "convert-to-sale") {
      // Mark this booking CONVERTED, cancel all other ACTIVE/CONFIRMED for this plot
      await (prisma as any).plotBooking.update({
        where: { id: params.bookingId },
        data: { status: "CONVERTED" },
      });
      await (prisma as any).plotBooking.updateMany({
        where: {
          projectId: params.id,
          plotId: booking.plotId,
          status: { in: ["ACTIVE", "CONFIRMED"] },
          id: { not: params.bookingId },
        },
        data: { status: "CANCELLED" },
      });

      // Update plot status to "sold"
      const plots: any[] = Array.isArray(project.plots) ? project.plots : JSON.parse(project.plots || "[]");
      const updatedPlots = plots.map((p: any) =>
        p.id === booking.plotId ? { ...p, status: "sold" } : p
      );
      await (prisma as any).layoutProject.update({
        where: { id: params.id },
        data: { plots: updatedPlots },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/layout-projects/[id]/bookings/[bookingId]:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; bookingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await authorizeProject(params.id, session);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const booking = await (prisma as any).plotBooking.findUnique({ where: { id: params.bookingId } });
    if (!booking || booking.projectId !== params.id)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    await (prisma as any).plotBooking.delete({ where: { id: params.bookingId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/layout-projects/[id]/bookings/[bookingId]:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
