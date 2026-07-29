import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const announcements = await prisma.communityAnnouncement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Return defaults if none exist
  if (announcements.length === 0) {
    return NextResponse.json({
      announcements: [
        { id: "1", text: "Veppampattu Community Service Portal — Now Live!", textTamil: "வேப்பம்பட்டு சமூக சேவை போர்டல் — இப்போது நேரடியில்!" },
        { id: "2", text: "Free Aadhaar update camp on 15th — Ward 3 Community Hall", textTamil: "இலவச ஆதார் புதுப்பிப்பு முகாம் — 15ஆம் தேதி, வார்டு 3 சமூக மண்டபம்" },
        { id: "3", text: "Scholarship applications open for 2024-25 — Contact us to apply", textTamil: "2024-25 தொடக்கநிலை உதவித்தொகை விண்ணப்பங்கள் திறந்துள்ளன" },
      ],
    });
  }

  return NextResponse.json({ announcements });
}
