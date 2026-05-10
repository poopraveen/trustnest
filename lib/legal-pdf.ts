/**
 * Legal PDF generator — uses pdf-lib (pure JS, works in any serverless env)
 *
 * Strategy:
 *   1. Build a styled A4 PDF from form data using pdf-lib — always succeeds
 *   2. Optionally call the AI legal-tech API for enriched draft text
 *      — embedded in the PDF when available, skipped when not
 */

import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  PDFPage,
} from "pdf-lib";
import type { SignaturePosition } from "./signflow";

const LEGAL_API_BASE =
  process.env.LEGAL_TECH_API_URL ?? "https://payrollsystem-2w0h.onrender.com";
const LEGAL_API = `${LEGAL_API_BASE}/legal-tech/generate-public`;

/* ── Category maps ───────────────────────────────────────────── */
const DEPT_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Tamil Nadu Highways Department",
  "roads-infrastructure":   "Tamil Nadu Highways Department",
  electricity:              "TANGEDCO – Tamil Nadu Generation and Distribution Corporation",
  "water-supply":           "Tamil Nadu Water Supply and Drainage Board (TWAD)",
  "health-services":        "Tamil Nadu Health and Family Welfare Department",
  education:                "Tamil Nadu School Education Department",
  "social-welfare":         "Tamil Nadu Social Welfare and Women Empowerment Department",
  "land-records":           "Tamil Nadu Revenue and Disaster Management Department",
  construction:             "Tamil Nadu Housing Board / Local Body Engineering Department",
};
const DEFAULT_DEPT = "Tamil Nadu State Government – Concerned Department";

const RELIEF_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Immediate inspection, repair and restoration of road / infrastructure causing public hardship",
  "roads-infrastructure":   "Immediate inspection, repair and restoration of road / infrastructure causing public hardship",
  electricity:              "Restoration of uninterrupted power supply and repair of faulty electrical infrastructure",
  "water-supply":           "Restoration of regular, clean potable water supply to the affected locality",
  "health-services":        "Provision of adequate healthcare personnel, medicines and facilities at the public health centre",
  education:                "Resolution of the educational grievance and provision of quality education as per government norms",
  "social-welfare":         "Release of all entitled social welfare benefits and correction of administrative errors",
  "land-records":           "Rectification of land records and issuance of proper revenue documentation without delay",
  construction:             "Immediate inspection and compliance action on the reported construction irregularity",
};
const DEFAULT_RELIEF =
  "Prompt resolution within the 30-day SLA stipulated by the Tamil Nadu Grievance Redressal Act";

/* ── Input type ──────────────────────────────────────────────── */
export interface LegalPdfInput {
  ticketNo:     string;
  name:         string;
  phone:        string;
  email:        string;
  district:     string;
  block:        string;
  locality:     string;
  localityType: string;
  address:      string;
  category:     string;
  title:        string;
  description:  string;
  filedAt:      Date;
}

/* ── Text layout helpers ─────────────────────────────────────── */
interface DrawCtx {
  page:     PDFPage;
  font:     PDFFont;
  bold:     PDFFont;
  y:        number;
  size:     number;
  lMargin:  number;
  rMargin:  number;
  lineH:    number;
}

function wordWrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.push(""); // paragraph break
  }
  // remove trailing empty
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function drawText(
  ctx: DrawCtx,
  text: string,
  opts: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number } = {}
): number {
  const f    = opts.bold ? ctx.bold : ctx.font;
  const sz   = opts.size ?? ctx.size;
  const col  = opts.color ? rgb(...(opts.color as [number, number, number])) : rgb(0.07, 0.07, 0.07);
  const lh   = sz * 1.5;
  const x    = ctx.lMargin + (opts.indent ?? 0);
  const maxW = ctx.page.getWidth() - ctx.rMargin - x;
  const lines = wordWrap(text, f, sz, maxW);

  for (const line of lines) {
    if (ctx.y < 80) return ctx.y; // stop at bottom margin
    ctx.page.drawText(line, { x, y: ctx.y, size: sz, font: f, color: col });
    ctx.y -= lh;
  }
  return ctx.y;
}

function drawHRule(ctx: DrawCtx, color: [number, number, number] = [0.82, 0.82, 0.82]) {
  ctx.page.drawLine({
    start: { x: ctx.lMargin, y: ctx.y + 4 },
    end:   { x: ctx.page.getWidth() - ctx.rMargin, y: ctx.y + 4 },
    thickness: 0.6,
    color: rgb(...color),
  });
  ctx.y -= 10;
}

function drawLabel(ctx: DrawCtx, label: string) {
  drawText(ctx, label.toUpperCase(), { bold: true, size: 7.5, color: [0.42, 0.42, 0.42] });
  ctx.y -= 2;
}

export interface PdfResult {
  base64:             string;
  signaturePositions: SignaturePosition[];
}

/* ── Build the PDF ───────────────────────────────────────────── */
async function buildPdf(
  data: LegalPdfInput,
  aiDraft?: string,
  numSigners = 1,
): Promise<PdfResult> {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595, 842]); // A4

  const font  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold  = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const W     = page.getWidth();
  const LM    = 50, RM = 50;

  const dept   = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
  const location = [data.address, data.locality, data.block, data.district]
    .filter(Boolean).join(", ");
  const filedStr = data.filedAt.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "long", day: "numeric",
  });
  const catLabel = data.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  /* ── Green header banner ── */
  page.drawRectangle({ x: 0, y: 782, width: W, height: 60, color: rgb(0.08, 0.32, 0.17) });
  page.drawText("GOVERNMENT OF TAMIL NADU", {
    x: LM, y: 820, size: 13, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText("Citizen Grievance Portal  ·  TN Vettri  ·  tamilnadu.gov.in", {
    x: LM, y: 800, size: 8.5, font, color: rgb(0.73, 0.97, 0.80),
  });

  const ctx: DrawCtx = { page, font, bold, y: 770, size: 10, lMargin: LM, rMargin: RM, lineH: 15 };

  /* ── Ticket / date line ── */
  ctx.y -= 6;
  drawText(ctx, `Ticket No: ${data.ticketNo}   ·   Filed: ${filedStr}`, {
    bold: true, size: 8.5, color: [0.08, 0.47, 0.22],
  });
  ctx.y -= 4;
  drawHRule(ctx, [0.08, 0.47, 0.22]);
  ctx.y -= 4;

  /* ── Subject ── */
  drawText(ctx, "GRIEVANCE NOTICE", { bold: true, size: 13, color: [0.07, 0.07, 0.07] });
  ctx.y -= 2;
  drawText(ctx, `RE: ${data.title}`, { size: 11 });
  ctx.y -= 6;
  drawHRule(ctx);
  ctx.y -= 4;

  /* ── Petitioner ── */
  drawLabel(ctx, "From (Petitioner)");
  drawText(ctx, data.name, { bold: true });
  if (data.phone) drawText(ctx, `Phone: ${data.phone}`);
  if (data.email) drawText(ctx, `Email: ${data.email}`);
  if (location)   drawText(ctx, `Address: ${location}`);
  ctx.y -= 8;

  /* ── Respondent ── */
  drawLabel(ctx, "To (Respondent)");
  drawText(ctx, dept, { bold: true });
  drawText(ctx, `District Collectorate, ${data.district} District, Tamil Nadu`);
  ctx.y -= 8;
  drawHRule(ctx);
  ctx.y -= 4;

  /* ── Category ── */
  drawLabel(ctx, "Category");
  drawText(ctx, catLabel);
  ctx.y -= 8;

  /* ── Facts ── */
  drawLabel(ctx, "Facts of the Case");
  drawText(ctx, data.description || data.title, { size: 9.5 });
  ctx.y -= 8;

  /* ── Relief ── */
  drawLabel(ctx, "Relief Sought");
  drawText(ctx, relief, { size: 9.5 });
  ctx.y -= 8;
  drawHRule(ctx);
  ctx.y -= 4;

  /* ── AI draft section (optional) ── */
  if (aiDraft) {
    drawLabel(ctx, "AI-Generated Legal Draft (for reference)");
    ctx.y -= 2;
    drawText(ctx, aiDraft, { size: 8.5 });
    ctx.y -= 8;
    drawHRule(ctx);
    ctx.y -= 4;
  }

  /* ── Declaration ── */
  drawText(ctx,
    "I, the undersigned, hereby declare that the facts stated above are true and correct " +
    "to the best of my knowledge and belief, and request the concerned authority to take " +
    "immediate action in accordance with the Tamil Nadu Grievance Redressal Act.",
    { size: 9.5 }
  );
  ctx.y -= 20;

  /* ── Signature block — one row per signer ── */
  const PAGE_H = page.getHeight(); // 842
  const signaturePositions: SignaturePosition[] = [];
  const sigCount = Math.max(numSigners, 1);

  for (let i = 0; i < sigCount; i++) {
    const label = sigCount === 1
      ? "Petitioner Signature:"
      : `Petitioner ${i + 1} Signature:`;

    // Draw the label
    drawText(ctx, label, { bold: true, size: 9 });

    // Blank signing space — draw a rect outline for the field
    const sigBoxY = ctx.y + 4;           // top of box in pdf-lib coords (from bottom)
    const sigBoxX = LM + 10;
    const sigBoxW = 220;
    const sigBoxH = 36;
    page.drawRectangle({
      x: sigBoxX, y: sigBoxY - sigBoxH,
      width: sigBoxW, height: sigBoxH,
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 0.5,
    });

    // Normalised coords for SignFlow:
    // SignFlow x: 0 = left, 1 = right  →  sigBoxX / W
    // SignFlow y: 0 = top,  1 = bottom →  1 - (sigBoxY / PAGE_H)
    // Centre the field inside the box
    const sfX = sigBoxX / W;
    const sfY = 1 - (sigBoxY / PAGE_H);
    signaturePositions.push({
      x:          parseFloat(sfX.toFixed(4)),
      y:          parseFloat(sfY.toFixed(4)),
      pageIndex:  0,
      width:      parseFloat((sigBoxW / W).toFixed(4)),
      height:     parseFloat((sigBoxH / PAGE_H).toFixed(4)),
    });

    ctx.y = sigBoxY - sigBoxH - 8;

    // Date & place on the same row
    drawText(ctx, `Date: ${filedStr}   ·   Place: ${[data.locality, data.district].filter(Boolean).join(", ")}`, { size: 8.5 });
    ctx.y -= 12;
  }

  /* ── Footer ── */
  page.drawLine({ start: { x: LM, y: 42 }, end: { x: W - RM, y: 42 }, thickness: 0.4, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(
    `Generated by TN Vettri Citizen Grievance Portal  ·  Ticket: ${data.ticketNo}  ·  Computer generated document`,
    { x: LM, y: 30, size: 7, font, color: rgb(0.6, 0.6, 0.6) }
  );

  const pdfBytes = await pdfDoc.save();
  return { base64: Buffer.from(pdfBytes).toString("base64"), signaturePositions };
}

/* ── Optional AI API call ────────────────────────────────────── */
async function fetchAiDraft(data: LegalPdfInput): Promise<string | null> {
  const apiKey = process.env.LEGAL_TECH_API_TOKEN;
  if (!apiKey) return null;

  const dept   = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
  const location = [data.address, data.locality, data.block, data.district]
    .filter(Boolean).join(", ");

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 18_000);

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body:    JSON.stringify({
        caseType:          "grievance-notice",
        jurisdiction:      `District Collectorate – ${data.district}`,
        petitionerName:    data.name,
        respondentName:    dept,
        factsOfCase:       `${data.title}. ${data.description ?? ""}`.trim(),
        reliefSought:      relief,
        additionalDetails: `Ticket: ${data.ticketNo}. Location: ${location}. Phone: ${data.phone}. Filed: ${data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) {
      console.warn(`[legal-pdf] AI API ${res.status} — skipping draft`);
      return null;
    }

    const json = await res.json() as Record<string, unknown>;
    const text = (json.draft ?? json.text ?? json.content) as string | undefined;
    return typeof text === "string" && text.length > 20 ? text : null;
  } catch {
    console.warn("[legal-pdf] AI API unavailable — generating base PDF");
    return null;
  }
}

/* ── Main export ─────────────────────────────────────────────── */
export async function generateGrievancePdf(
  data: LegalPdfInput,
  numSigners = 1,
): Promise<PdfResult | null> {
  try {
    const aiDraft = await fetchAiDraft(data);
    const result  = await buildPdf(data, aiDraft ?? undefined, numSigners);
    console.log(
      `[legal-pdf] PDF ready (${result.base64.length} chars) aiDraft=${!!aiDraft}`,
      "signaturePositions:", result.signaturePositions,
    );
    return result;
  } catch (err) {
    console.error("[legal-pdf] build failed:", err);
    return null;
  }
}
