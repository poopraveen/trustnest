import { NextRequest, NextResponse } from "next/server";
import type { BangleProduct } from "../route";

const store = () => global.__bangles as BangleProduct[];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const idx = store().findIndex(p => p.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    store()[idx] = { ...store()[idx], ...body, id: params.id };
    return NextResponse.json({ product: store()[idx] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const idx = store().findIndex(p => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store().splice(idx, 1);
  return NextResponse.json({ ok: true });
}
