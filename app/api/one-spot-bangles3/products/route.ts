import { NextRequest, NextResponse } from "next/server";

export interface BangleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mediaUrl: string;
  mediaType: "image" | "video";
  category: string;
  material: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

const DEMO: BangleProduct[] = [
  { id:"demo-1", name:"Gold Kundan Bangle Set", description:"Handcrafted 22K gold Kundan bangles with meenakari work. Set of 4.", price:12500, originalPrice:15000, mediaUrl:"", mediaType:"image", category:"Gold", material:"22K Gold", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"demo-2", name:"Silver Oxidised Kada", description:"Traditional oxidised silver kada with floral engravings. Adjustable fit.", price:2200, originalPrice:2800, mediaUrl:"", mediaType:"image", category:"Silver", material:"92.5 Silver", inStock:true, featured:false, createdAt:new Date().toISOString() },
  { id:"demo-3", name:"Rose Gold Diamond Bangle", description:"Delicate rose gold bangle studded with VS clarity diamonds.", price:38000, originalPrice:42000, mediaUrl:"", mediaType:"image", category:"Diamond", material:"18K Rose Gold", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"demo-4", name:"Antique Temple Bangle", description:"South Indian temple-style bangle with deity motifs and ruby stones.", price:8900, originalPrice:10500, mediaUrl:"", mediaType:"image", category:"Antique", material:"Brass Gold Plated", inStock:false, featured:false, createdAt:new Date().toISOString() },
  { id:"demo-5", name:"Polki Bridal Set", description:"Uncut diamond Polki bangle set — 6 pieces. Perfect for weddings.", price:55000, originalPrice:65000, mediaUrl:"", mediaType:"image", category:"Bridal", material:"22K Gold, Polki", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"demo-6", name:"Thread Silk Bangle", description:"Handwoven silk thread bangles — set of 12, assorted festive colours.", price:450, mediaUrl:"", mediaType:"image", category:"Fashion", material:"Silk Thread", inStock:true, featured:false, createdAt:new Date().toISOString() },
];

// ── Prisma helper (graceful fallback when DB not available) ──

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

// ── Fallback in-memory store (only used when DB unavailable) ──

declare global { var __bangles: BangleProduct[] | undefined; }
const memStore = (): BangleProduct[] => {
  // Only seed if this is the first load AND db is unavailable
  if (!global.__bangles) global.__bangles = [...DEMO];
  return global.__bangles!;
};

function uid() { return `mem-${Math.random().toString(36).slice(2, 12)}`; }

// ── Route handlers ──

export async function GET() {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.bangleProduct.findMany({ orderBy: { createdAt: "desc" } });
      // Seed demo data only when DB is genuinely empty
      if (rows.length === 0) {
        await prisma.bangleProduct.createMany({
          data: DEMO.map(d => ({
            name: d.name,
            description: d.description,
            price: d.price,
            originalPrice: d.originalPrice ?? null,
            mediaUrl: d.mediaUrl,
            mediaType: d.mediaType,
            category: d.category,
            material: d.material,
            inStock: d.inStock,
            featured: d.featured,
          })),
        });
        const seeded = await prisma.bangleProduct.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json({ products: seeded.map(dbToProduct) });
      }
      return NextResponse.json({ products: rows.map(dbToProduct) });
    } catch (e) {
      console.error("DB GET error:", e);
    } finally {
      await prisma.$disconnect();
    }
  }
  return NextResponse.json({ products: memStore() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const row = await prisma.bangleProduct.create({
          data: {
            name: body.name ?? "Untitled",
            description: body.description ?? "",
            price: Number(body.price) || 0,
            originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
            mediaUrl: body.mediaUrl ?? "",
            mediaType: body.mediaType === "video" ? "video" : "image",
            category: body.category ?? "Other",
            material: body.material ?? "",
            inStock: body.inStock !== false,
            featured: body.featured === true,
          },
        });
        return NextResponse.json({ product: dbToProduct(row as unknown as Record<string, unknown>) });
      } catch (e) {
        console.error("DB POST error:", e);
      } finally {
        await prisma.$disconnect();
      }
    }
    // Fallback
    const product: BangleProduct = {
      id: uid(),
      name: body.name ?? "Untitled",
      description: body.description ?? "",
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      mediaUrl: body.mediaUrl ?? "",
      mediaType: body.mediaType === "video" ? "video" : "image",
      category: body.category ?? "Other",
      material: body.material ?? "",
      inStock: body.inStock !== false,
      featured: body.featured === true,
      createdAt: new Date().toISOString(),
    };
    memStore().unshift(product);
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
