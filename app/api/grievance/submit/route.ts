import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, buildGrievanceMessage } from "@/lib/telegram";
import { getLocalities } from "@/lib/tn-areas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, email, district, block, locality, address, category, title, description } = body;

    if (!name || !phone || !district || !block || !locality || !category || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticketNo = "TN" + Date.now().toString().slice(-8);
    const filedAt  = new Date();

    // Resolve locality display name and type
    const localities  = getLocalities(district, block);
    const localityObj = localities.find(l => l.id === locality);
    const localityName = localityObj?.name ?? locality;
    const localityType = localityObj?.type ?? "revenue_village";

    // Resolve district/block names from IDs
    const { TN_DISTRICTS } = await import("@/lib/tn-areas");
    const districtObj = TN_DISTRICTS.find(d => d.id === district);
    const blockObj    = districtObj?.blocks.find(b => b.id === block);
    const districtName = districtObj?.name ?? district;
    const blockName    = blockObj?.name ?? block;

    const msg = buildGrievanceMessage({
      ticketNo,
      name,
      phone,
      email:        email ?? "",
      district:     districtName,
      block:        blockName,
      locality:     localityName,
      localityType: localityType,
      address:      address ?? "",
      category,
      title,
      description:  description ?? "",
      filedAt,
    });

    await sendTelegramMessage({ text: msg });

    return NextResponse.json({ ticketNo, filedAt: filedAt.toISOString() });
  } catch (err) {
    console.error("[grievance/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
