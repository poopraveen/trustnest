import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProductSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().positive(),
  priceNegotiable: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  category: z.enum([
    "GARDEN_DECOR", "PLANTS", "FURNITURE", "LIGHTING", "TOOLS",
    "STORAGE", "TEXTILES", "KITCHENWARE", "ELECTRONICS", "SPORTS",
    "TOYS", "BOOKS", "CLOTHING", "OTHER",
  ]),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]).default("NEW"),
  stock: z.number().int().min(0).default(1),
  brand: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  shippingInfo: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const skip = (page - 1) * limit;

  const requestedStatus = searchParams.get("status");
  const where: any = isAdmin && requestedStatus
    ? { status: requestedStatus }
    : { status: "APPROVED", disabled: false };

  const categories = searchParams.getAll("category");
  const conditions = searchParams.getAll("condition");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const sellerId = searchParams.get("sellerId");

  if (categories.length > 0) where.category = { in: categories };
  if (conditions.length > 0) where.condition = { in: conditions };
  if (sellerId) where.sellerId = sellerId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const sortBy = searchParams.get("sortBy");
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  else if (sortBy === "price_desc") orderBy = { price: "desc" };
  else if (sortBy === "oldest") orderBy = { createdAt: "asc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only sellers can post products" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = ProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        sellerId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
