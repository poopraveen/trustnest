import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

const DEFAULT_PRODUCTS = [
  { sku: "0006", barcode: "U0006IN0020256346174", name: "Herbal Aloe Concentrate", nameTa: "ஹெர்பல் அலோ கான்சன்ட்ரேட்", category: "SUPPLEMENT", price: 1125, mrp: 1250, minStock: 5 },
  { sku: "0065", barcode: "U0065IN0020265787474", name: "Herbalifeline", nameTa: "ஹெர்பலைஃப்லைன்", category: "SUPPLEMENT", price: 1512, mrp: 1680, minStock: 5 },
  { sku: "0077", barcode: "U0077IN0020252157715", name: "Herbal Control", nameTa: "ஹெர்பல் கண்ட்ரோல்", category: "SUPPLEMENT", price: 855, mrp: 950, minStock: 5 },
  { sku: "0111", barcode: "U0111IN0120253020655", name: "Cell-U-Loss", nameTa: "செல்-யு-லாஸ்", category: "SUPPLEMENT", price: 1305, mrp: 1450, minStock: 5 },
  { sku: "1232", barcode: "U1232IN1120264042589", name: "Formula 2 Multivitamin Mineral & Herbal Tablets", nameTa: "ஃபார்முலா 2 மல்டிவிட்டமின்", category: "SUPPLEMENT", price: 1890, mrp: 2100, minStock: 5 },
  { sku: "1233", barcode: "U1233002026000504261", name: "Personalized Protein Powder - 200g", nameTa: "பர்சனலைஸ்டு புரோட்டீன் பவுடர்", category: "SUPPLEMENT", price: 2115, mrp: 2350, minStock: 5 },
  { sku: "1239", barcode: "U1239002025000856103", name: "Formula 1 Nutritional Shake Mix - Strawberry", nameTa: "ஃபார்முலா 1 ஸ்ட்ராபெர்ரி ஷேக்", category: "SHAKE", price: 2835, mrp: 3150, minStock: 10 },
  { sku: "1295", barcode: "U1295IN2025055359097", name: "Afresh Energy Drink Mix - Lemon", nameTa: "ஏஃப்ரெஷ் லெமன் டீ", category: "TEA", price: 1485, mrp: 1650, minStock: 10 },
  { sku: "175K", barcode: "U175KIN0020261084705", name: "Male Factor +", nameTa: "மேல் ஃபேக்டர் பிளஸ்", category: "SUPPLEMENT", price: 2520, mrp: 2800, minStock: 3 },
  { sku: "183K", barcode: "U183K002026000609297", name: "Shake Mate", nameTa: "ஷேக் மேட்", category: "SHAKE", price: 1710, mrp: 1900, minStock: 5 },
  { sku: "2637", barcode: "U2637IN0020253491091", name: "Niteworks", nameTa: "நைட்வொர்க்ஸ்", category: "SUPPLEMENT", price: 6788, mrp: 7128, minStock: 3 },
  { sku: "3123", barcode: "U3123IN0020257336179", name: "Cell Activator", nameTa: "செல் ஆக்டிவேட்டர்", category: "SUPPLEMENT", price: 2109, mrp: 2215, minStock: 3 },
];

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = { created: 0, skipped: 0 };
  for (const p of DEFAULT_PRODUCTS) {
    const existing = await prisma.hblProduct.findUnique({ where: { sku: p.sku } });
    if (existing) { results.skipped++; continue; }
    await prisma.hblProduct.create({ data: p as any });
    results.created++;
  }
  return NextResponse.json({ success: true, ...results, total: DEFAULT_PRODUCTS.length });
}
