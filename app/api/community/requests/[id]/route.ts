import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status, acceptedBy, notes } = body;

  const updated = await prisma.communityServiceRequest.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(acceptedBy ? { acceptedBy } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json({ request: updated });
}
