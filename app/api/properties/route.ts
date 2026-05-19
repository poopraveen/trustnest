import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deserializeProperty, serializeProperty } from "@/lib/db";
import { z } from "zod";

const PropertySchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().positive(),
  priceNegotiable: z.boolean().default(false),
  address: z.string().min(5),
  locality: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  bhk: z.number().int().min(1).max(20),
  bathrooms: z.number().int().min(1).max(20),
  area: z.number().positive(),
  areaUnit: z.string().default("sqft"),
  floor: z.number().int().optional().nullable(),
  totalFloors: z.number().int().optional().nullable(),
  propertyType: z.enum(["APARTMENT", "VILLA", "INDEPENDENT_HOUSE", "PLOT", "COMMERCIAL", "PG", "STUDIO"]),
  listingType: z.enum(["BUY", "RENT"]),
  furnishing: z.enum(["FULLY_FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).default("UNFURNISHED"),
  parking: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  facing: z.string().optional().nullable(),
  ageOfProperty: z.number().int().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const skip = (page - 1) * limit;

  const where: any = { status: "APPROVED", disabled: false };

  const city = searchParams.get("city");
  const listingType = searchParams.get("listingType");
  const search = searchParams.get("search");
  const propertyTypes = searchParams.getAll("propertyType");
  const bhks = searchParams.getAll("bhk").map(Number).filter(Boolean);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sellerId = searchParams.get("sellerId");

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (listingType) where.listingType = listingType;
  if (propertyTypes.length > 0) where.propertyType = { in: propertyTypes };
  if (bhks.length > 0) where.bhk = { in: bhks };
  if (sellerId) where.sellerId = sellerId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { locality: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    data: properties.map(deserializeProperty),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only sellers can post properties" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = PropertySchema.parse(body);

    const property = await prisma.property.create({
      data: {
        ...serializeProperty(data),
        sellerId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    });

    return NextResponse.json(deserializeProperty(property), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
