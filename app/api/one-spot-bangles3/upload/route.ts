import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads/bangles");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    const isVideo = file.type.startsWith("video/");
    return NextResponse.json({ url: `/uploads/bangles/${filename}`, type: isVideo ? "video" : "image" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
