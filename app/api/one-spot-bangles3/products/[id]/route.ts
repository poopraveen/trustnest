import { NextRequest, NextResponse } from "next/server";
import type { BangleProduct } from "../route";

async function getPrisma() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    return prisma;
  } catch {
    return null;
  }
}

function dbToProduct(r: Record<string, unknown>): BangleProduct {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    price: r.price as number,
    originalPrice: r.originalPrice != null ? (r.originalPrice as number) : undefined,
    mediaUrl: (r.mediaUrl as string) ?? "",
    mediaType: (r.mediaType as string) === "video" ? "video" : "image",
    category: (r.category as string) ?? "Other",
    material: (r.material as string) ?? "",
    inStock: r.inStock as boolean,
    featured: r.featured as boolean,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as string),
  };
}

const memStore = () => global.__bangles as BangleProduct[];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const row = await prisma.bangleProduct.update({
          where: { id: params.id },
          data: {
            name: body.name,
            description: body.description,
            price: body.price != null ? Number(body.price) : undefined,
            originalPrice: body.originalPrice != null ? Number(body.originalPrice) : undefined,
            mediaUrl: body.mediaUrl,
            mediaType: body.mediaType,
            category: body.category,
            material: body.material,
            inStock: body.inStock,
            featured: body.featured,
          },
        });
        return NextResponse.json({ product: dbToProduct(row as unknown as Record<string, unknown>) });
      } catch (e) {
        console.error("DB PUT error:", e);
      } finally {
        await prisma.$disconnect();
      }
    }
    // Fallback
    const store = memStore();
    const idx = store.findIndex(p => p.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    store[idx] = { ...store[idx], ...body, id: params.id };
    return NextResponse.json({ product: store[idx] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.bangleProduct.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("DB DELETE error:", e);
    } finally {
      await prisma.$disconnect();
    }
  }
  // Fallback
  const store = memStore();
  const idx = store.findIndex(p => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
