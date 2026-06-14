import { NextRequest, NextResponse } from "next/server";

// In-memory store (survives warm requests; seeds with demo data on first load)
export interface BangleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mediaUrl: string;       // image or video path
  mediaType: "image" | "video";
  category: string;
  material: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

const DEMO: BangleProduct[] = [
  { id:"1", name:"Gold Kundan Bangle Set", description:"Handcrafted 22K gold Kundan bangles with meenakari work. Set of 4.", price:12500, originalPrice:15000, mediaUrl:"", mediaType:"image", category:"Gold", material:"22K Gold", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"2", name:"Silver Oxidised Kada", description:"Traditional oxidised silver kada with floral engravings. Adjustable fit.", price:2200, originalPrice:2800, mediaUrl:"", mediaType:"image", category:"Silver", material:"92.5 Silver", inStock:true, featured:false, createdAt:new Date().toISOString() },
  { id:"3", name:"Rose Gold Diamond Bangle", description:"Delicate rose gold bangle studded with VS clarity diamonds.", price:38000, originalPrice:42000, mediaUrl:"", mediaType:"image", category:"Diamond", material:"18K Rose Gold", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"4", name:"Antique Temple Bangle", description:"South Indian temple-style bangle with deity motifs and ruby stones.", price:8900, originalPrice:10500, mediaUrl:"", mediaType:"image", category:"Antique", material:"Brass Gold Plated", inStock:false, featured:false, createdAt:new Date().toISOString() },
  { id:"5", name:"Polki Bridal Set", description:"Uncut diamond Polki bangle set — 6 pieces. Perfect for weddings.", price:55000, originalPrice:65000, mediaUrl:"", mediaType:"image", category:"Bridal", material:"22K Gold, Polki", inStock:true, featured:true, createdAt:new Date().toISOString() },
  { id:"6", name:"Thread Silk Bangle", description:"Handwoven silk thread bangles — set of 12, assorted festive colours.", price:450, mediaUrl:"", mediaType:"image", category:"Fashion", material:"Silk Thread", inStock:true, featured:false, createdAt:new Date().toISOString() },
];

declare global { var __bangles: BangleProduct[] | undefined; }
if (!global.__bangles) global.__bangles = [...DEMO];
const store = () => global.__bangles!;

function uid() { return Math.random().toString(36).slice(2,12); }

export async function GET() {
  return NextResponse.json({ products: store() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    store().unshift(product);
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
