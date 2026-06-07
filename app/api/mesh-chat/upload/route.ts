import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Files stored in /public/mesh-uploads/ — served statically
// On Vercel this is ephemeral; for local use it persists while server runs
const UPLOAD_DIR = join(process.cwd(), "public", "mesh-uploads");

export async function POST(req: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(join(UPLOAD_DIR, safeName), Buffer.from(bytes));

    return NextResponse.json({
      url: `/mesh-uploads/${safeName}`,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
