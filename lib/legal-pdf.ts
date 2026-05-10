/**
 * Legal PDF generator — Tamil Nadu court-standard petition format
 * Uses pdf-lib (pure JS — works in any serverless/edge environment)
 *
 * Format follows the Tamil Nadu Grievance Redressal Act petition style:
 *   Header → Parties (Petitioner vs Respondent) → Grounds (numbered) →
 *   Prayer → Verification → Signature block(s)
 */

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import type { SignaturePosition } from "./signflow";

const LEGAL_API_BASE =
  process.env.LEGAL_TECH_API_URL ?? "https://payrollsystem-2w0h.onrender.com";
const LEGAL_API = `${LEGAL_API_BASE}/legal-tech/generate-public`;

/* ── Maps ────────────────────────────────────────────────────── */
const DEPT_MAP: Record<string, string> = {
  "roads-&-infrastructure": "The Executive Engineer, Tamil Nadu Highways Department",
  "roads-infrastructure":   "The Executive Engineer, Tamil Nadu Highways Department",
  electricity:              "The Superintending Engineer, TANGEDCO",
  "water-supply":           "The Executive Engineer, Tamil Nadu Water Supply and Drainage Board (TWAD)",
  "health-services":        "The District Health Officer, Tamil Nadu Health and Family Welfare Department",
  education:                "The District Educational Officer, Tamil Nadu School Education Department",
  "social-welfare":         "The District Social Welfare Officer, Tamil Nadu Social Welfare Department",
  "land-records":           "The Tahsildar / District Revenue Officer, Tamil Nadu Revenue Department",
  construction:             "The District Town Planner / Local Body Engineer",
};
const DEFAULT_DEPT = "The District Collector, Tamil Nadu State Government";

const AUTHORITY_MAP: Record<string, string> = {
  "roads-&-infrastructure": "The District Collector and The Executive Engineer, Highways",
  "roads-infrastructure":   "The District Collector and The Executive Engineer, Highways",
  electricity:              "The District Collector and The Superintending Engineer, TANGEDCO",
  "water-supply":           "The District Collector and The Executive Engineer, TWAD",
  "health-services":        "The District Collector and The District Health Officer",
  education:                "The District Collector and The District Educational Officer",
  "social-welfare":         "The District Collector and The District Social Welfare Officer",
  "land-records":           "The District Collector and The Tahsildar",
  construction:             "The District Collector and The District Town Planner",
};

const ACT_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Tamil Nadu Highways Act, 2001 and the Right to Public Services Act, 2011",
  "roads-infrastructure":   "Tamil Nadu Highways Act, 2001 and the Right to Public Services Act, 2011",
  electricity:              "Electricity Act, 2003 and the Right to Public Services Act, 2011",
  "water-supply":           "Tamil Nadu Water Supply and Drainage Board Act, 1970 and the Right to Public Services Act, 2011",
  "health-services":        "Clinical Establishments Act and the Right to Public Services Act, 2011",
  education:                "Right to Education Act, 2009 and the Right to Public Services Act, 2011",
  "social-welfare":         "Tamil Nadu Social Welfare Act and the Right to Public Services Act, 2011",
  "land-records":           "Tamil Nadu Land Revenue Act, 1880 and the Right to Public Services Act, 2011",
  construction:             "Tamil Nadu Town and Country Planning Act, 1971 and the Right to Public Services Act, 2011",
};
const DEFAULT_ACT = "Tamil Nadu Grievance Redressal Act and the Right to Public Services Act, 2011";

const RELIEF_MAP: Record<string, string> = {
  "roads-&-infrastructure": "direct the Respondent to immediately inspect, repair and restore the road/infrastructure to a safe and serviceable condition",
  "roads-infrastructure":   "direct the Respondent to immediately inspect, repair and restore the road/infrastructure to a safe and serviceable condition",
  electricity:              "direct the Respondent to restore uninterrupted power supply and repair all defective electrical infrastructure forthwith",
  "water-supply":           "direct the Respondent to restore regular and clean potable water supply to the affected locality without further delay",
  "health-services":        "direct the Respondent to provide adequate healthcare personnel, medicines and facilities at the concerned public health centre",
  education:                "direct the Respondent to resolve the educational grievance and ensure provision of quality education as per statutory norms",
  "social-welfare":         "direct the Respondent to release all entitled social welfare benefits and rectify administrative errors without delay",
  "land-records":           "direct the Respondent to rectify the land records and issue proper revenue documentation forthwith",
  construction:             "direct the Respondent to inspect the construction irregularity and take appropriate compliance action",
};
const DEFAULT_RELIEF = "direct the Respondent to resolve the grievance within the statutory time limit of 30 days";

/* ── Input ───────────────────────────────────────────────────── */
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

export interface PdfResult {
  base64:             string;
  signaturePositions: SignaturePosition[];
}

/* ── Layout state ────────────────────────────────────────────── */
interface Ctx {
  page:    PDFPage;
  font:    PDFFont;
  bold:    PDFFont;
  italic:  PDFFont;
  y:       number;   // current y from BOTTOM (pdf-lib coords)
  lm:      number;
  rm:      number;
  W:       number;
  H:       number;
}

function usableW(ctx: Ctx) { return ctx.W - ctx.lm - ctx.rm; }

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r\n/g, "\n").split("\n")) {
    if (!para.trim()) { out.push(""); continue; }
    const words = para.split(" ");
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(t, size) > maxW && line) { out.push(line); line = w; }
      else line = t;
    }
    if (line) out.push(line);
  }
  return out;
}

/** Draw text block; returns final y */
/** Content is not allowed below this y — signatures live beneath */
const CONTENT_FLOOR = 235;

function draw(
  ctx: Ctx,
  text: string,
  opts: {
    size?:   number;
    bold?:   boolean;
    italic?: boolean;
    center?: boolean;
    color?:  [number, number, number];
    indent?: number;
    gap?:    number;
  } = {}
): number {
  const sz  = opts.size ?? 9.5;
  const lh  = sz * 1.45;
  const f   = opts.bold ? ctx.bold : opts.italic ? ctx.italic : ctx.font;
  const col = rgb(...((opts.color ?? [0.05, 0.05, 0.05]) as [number, number, number]));
  const x   = ctx.lm + (opts.indent ?? 0);
  const mw  = usableW(ctx) - (opts.indent ?? 0);
  const lines = wrapText(text, f, sz, mw);

  for (const line of lines) {
    if (ctx.y < CONTENT_FLOOR) return ctx.y; // stop before signature area
    const lx = opts.center ? (ctx.W - f.widthOfTextAtSize(line, sz)) / 2 : x;
    ctx.page.drawText(line, { x: lx, y: ctx.y, size: sz, font: f, color: col });
    ctx.y -= lh;
  }
  ctx.y -= (opts.gap ?? 3);
  return ctx.y;
}

function rule(ctx: Ctx, thick = 0.5, color: [number, number, number] = [0.75, 0.75, 0.75]) {
  ctx.page.drawLine({
    start: { x: ctx.lm, y: ctx.y + 3 },
    end:   { x: ctx.W - ctx.rm, y: ctx.y + 3 },
    thickness: thick, color: rgb(...color),
  });
  ctx.y -= 10;
}

function gap(ctx: Ctx, pts = 8) { ctx.y -= pts; }

/* ── Build the petition PDF ──────────────────────────────────── */
async function buildPdf(
  data: LegalPdfInput,
  aiDraft?: string,
  numSigners = 1,
): Promise<PdfResult> {

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595.28, 841.89]); // A4

  const font   = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold   = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const W = page.getWidth();
  const H = page.getHeight();
  const LM = 65, RM = 65;

  const ctx: Ctx = { page, font, bold, italic, y: 0, lm: LM, rm: RM, W, H };

  /* ── Derived values ── */
  const dept      = DEPT_MAP[data.category]      ?? DEFAULT_DEPT;
  const authority = AUTHORITY_MAP[data.category] ?? DEFAULT_DEPT;
  const act       = ACT_MAP[data.category]       ?? DEFAULT_ACT;
  const relief    = RELIEF_MAP[data.category]    ?? DEFAULT_RELIEF;
  const location  = [data.address, data.locality, data.block, data.district]
    .filter(Boolean).join(", ");
  const filedStr  = data.filedAt.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "long", day: "numeric",
  });
  const catLabel = data.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  /* ── Page border ── */
  page.drawRectangle({
    x: 40, y: 40, width: W - 80, height: H - 80,
    borderColor: rgb(0.08, 0.32, 0.17), borderWidth: 1,
  });

  /* ── Government emblem area (top) ── */
  ctx.y = H - 60;
  draw(ctx, "GOVERNMENT OF TAMIL NADU", { bold: true, size: 11, center: true, color: [0.08, 0.32, 0.17], gap: 2 });
  draw(ctx, "CITIZEN GRIEVANCE PORTAL  ·  TN VETTRI", { size: 8, center: true, color: [0.3, 0.3, 0.3], gap: 6 });
  rule(ctx, 1.5, [0.08, 0.32, 0.17]);
  gap(ctx, 4);

  /* ── Addressed to ── */
  draw(ctx, `To,`, { italic: true, size: 9, gap: 2 });
  draw(ctx, authority + ",", { bold: true, size: 9, gap: 2 });
  draw(ctx, `${data.district} District, Tamil Nadu.`, { size: 9, gap: 10 });

  /* ── Reference line ── */
  draw(ctx, `Sub: Grievance Petition – ${catLabel} – ${data.title} – Regarding.`, { bold: true, size: 9, gap: 6 });
  draw(ctx, `Ref: Ticket No. ${data.ticketNo}  |  Dated: ${filedStr}`, { italic: true, size: 9, gap: 8 });
  rule(ctx, 0.5);
  gap(ctx, 4);

  /* ── Title ── */
  draw(ctx, "PETITION", { bold: true, size: 13, center: true, color: [0.08, 0.32, 0.17], gap: 2 });
  draw(ctx, `(Under the ${act})`, { italic: true, size: 8.5, center: true, color: [0.3, 0.3, 0.3], gap: 8 });
  rule(ctx, 0.5);
  gap(ctx, 6);

  /* ── Parties ── */
  // Petitioner(s)
  const petitionerLines = data.name.split(",").map(s => s.trim()).filter(Boolean);
  for (const pl of petitionerLines) {
    draw(ctx, pl, { bold: true, size: 9.5, gap: 1 });
  }
  if (location) draw(ctx, location, { size: 9, gap: 1 });
  if (data.phone) draw(ctx, `Phone: ${data.phone}  |  Email: ${data.email || "N/A"}`, { size: 8.5, gap: 2 });
  // Right-align "PETITIONER(S)"
  const petLabel = "... PETITIONER(S)";
  ctx.page.drawText(petLabel, {
    x: W - RM - bold.widthOfTextAtSize(petLabel, 9.5),
    y: ctx.y + 10, size: 9.5, font: bold, color: rgb(0.05, 0.05, 0.05),
  });
  gap(ctx, 12);

  draw(ctx, "VERSUS", { bold: true, size: 9, center: true, color: [0.4, 0.4, 0.4], gap: 10 });

  // Respondent
  draw(ctx, dept + ",", { bold: true, size: 9.5, gap: 1 });
  draw(ctx, `District Collectorate, ${data.district} District, Tamil Nadu.`, { size: 9, gap: 2 });
  const resLabel = "... RESPONDENT";
  ctx.page.drawText(resLabel, {
    x: W - RM - bold.widthOfTextAtSize(resLabel, 9.5),
    y: ctx.y + 10, size: 9.5, font: bold, color: rgb(0.05, 0.05, 0.05),
  });
  gap(ctx, 14);
  rule(ctx, 0.5);
  gap(ctx, 6);

  /* ── Salutation ── */
  draw(ctx, "MOST RESPECTFULLY SHOWETH:", { bold: true, size: 10, gap: 8 });

  /* ── Grounds ── */
  const grounds: string[] = [
    `That the Petitioner(s) is/are a bona fide resident(s) of ${data.locality}, ${data.block} Taluk, ${data.district} District, Tamil Nadu, and is/are entitled to all civic amenities and services as guaranteed under the Constitution of India and Tamil Nadu statutes.`,
    `That the Respondent, ${dept.replace(/^The\s+/i, "")}, is the competent statutory authority responsible for ensuring ${catLabel.toLowerCase()} services and infrastructure within this jurisdiction.`,
    `That the Petitioner(s) is/are constrained to approach this authority on account of the following grievance: ${data.title}.`,
    data.description
      ? `That the facts of the matter are as follows: ${data.description}`
      : `That the grievance pertains to a failure of the Respondent to discharge its statutory obligations under the applicable Acts and Rules.`,
    `That the issue has been causing serious inconvenience, hardship and prejudice to the Petitioner(s) and to the general public of the locality, and necessitates immediate remedial action.`,
    `That the Petitioner(s) has/have not filed any similar petition before any other forum and this petition is filed in good faith in the interest of justice.`,
  ];

  if (aiDraft) {
    grounds.push(`That, in further support of this petition, the following additional legal grounds are urged: ${aiDraft.slice(0, 600)}`);
  }

  for (let i = 0; i < grounds.length; i++) {
    draw(ctx, `${i + 1}.  ${grounds[i]}`, { size: 9.5, indent: 0, gap: 8 });
  }

  gap(ctx, 4);
  rule(ctx, 0.5);
  gap(ctx, 6);

  /* ── Prayer ── */
  draw(ctx, "PRAYER", { bold: true, size: 10.5, center: true, color: [0.08, 0.32, 0.17], gap: 6 });
  draw(ctx,
    "In the light of the facts and circumstances stated above, the Petitioner(s) most respectfully pray(s) that this Honourable Authority may be pleased to:",
    { size: 9.5, gap: 6 }
  );
  draw(ctx, `(a)  ${relief.charAt(0).toUpperCase() + relief.slice(1)};`, { size: 9.5, indent: 10, gap: 4 });
  draw(ctx, "(b)  Direct the Respondent to submit a compliance report to the Petitioner(s) within 30 days of the order;", { size: 9.5, indent: 10, gap: 4 });
  draw(ctx, "(c)  Pass such other and further orders, directions and reliefs as this authority may deem fit and proper in the facts and circumstances of this case.", { size: 9.5, indent: 10, gap: 10 });

  draw(ctx, "And for this act of kindness, the Petitioner(s) shall, as in duty bound, ever pray.", { italic: true, size: 9.5, gap: 10 });
  rule(ctx, 0.5);
  gap(ctx, 6);

  /* ── Verification ── */
  draw(ctx, "VERIFICATION", { bold: true, size: 10, center: true, color: [0.08, 0.32, 0.17], gap: 6 });
  draw(ctx,
    `I/We, ${data.name}, the Petitioner(s) above named, do hereby verify that the contents of this petition are true and correct to the best of my/our knowledge and belief, and that no material fact has been concealed or misstated.`,
    { size: 9.5, gap: 6 }
  );
  draw(ctx, `Verified at ${data.locality}, ${data.district} on this ${filedStr}.`, { size: 9.5, gap: 12 });
  rule(ctx, 0.5);
  gap(ctx, 8);

  /* ── Signature blocks — FIXED at bottom of page (never overflows) ── */
  //
  // Layout (y from bottom of A4 page, 0 = bottom, 841 = top):
  //   y = 225  ← "SIGNATURE(S)" label
  //   y = 212  ← signer name label
  //   y = 170  ← top of signature box    (box height = 38)
  //   y = 132  ← bottom of signature box
  //   y = 118  ← Date / Place line
  //   y =  66  ← footer rule
  //   y =  54  ← footer text
  //
  const SIG_LABEL_Y  = 225;   // "SIGNATURE(S) OF PETITIONER(S):" label
  const NAME_LABEL_Y = 210;   // "Petitioner:" / "Petitioner 1:" label
  const BOX_TOP_Y    = 196;   // top of signature box (pdf-lib y = bottom+height)
  const BOX_H        = 40;    // box height
  const BOX_BOTTOM_Y = BOX_TOP_Y - BOX_H;  // 156
  const DATE_Y       = BOX_BOTTOM_Y - 14;  // 142

  const signaturePositions: SignaturePosition[] = [];
  const sigCount = Math.max(numSigners, 1);
  const colW     = Math.min(200, (usableW(ctx) - 12 * (sigCount - 1)) / sigCount);

  // Section heading
  page.drawText("SIGNATURE(S) OF PETITIONER(S):", {
    x: LM, y: SIG_LABEL_Y, size: 9, font: bold, color: rgb(0.08, 0.32, 0.17),
  });

  for (let i = 0; i < sigCount; i++) {
    const bx = LM + i * (colW + 14);

    // Signer label
    page.drawText(sigCount === 1 ? "Petitioner:" : `Petitioner ${i + 1}:`, {
      x: bx, y: NAME_LABEL_Y, size: 8.5, font: bold, color: rgb(0.3, 0.3, 0.3),
    });

    // Outlined signature box
    page.drawRectangle({
      x: bx, y: BOX_BOTTOM_Y, width: colW, height: BOX_H,
      borderColor: rgb(0.35, 0.35, 0.35), borderWidth: 0.7,
    });

    // Hint inside box
    page.drawText("(Sign here)", {
      x: bx + 8, y: BOX_BOTTOM_Y + 8, size: 8, font: italic,
      color: rgb(0.6, 0.6, 0.6),
    });

    // SignFlow normalised coords:
    //   x: left→right  (0–1)  → bx / W
    //   y: top→bottom  (0–1)  → 1 - (BOX_TOP_Y / H)
    signaturePositions.push({
      x:         parseFloat((bx / W).toFixed(4)),
      y:         parseFloat((1 - (BOX_TOP_Y / H)).toFixed(4)),
      pageIndex: 0,
      width:     parseFloat((colW / W).toFixed(4)),
      height:    parseFloat((BOX_H / H).toFixed(4)),
    });
  }

  // Date & Place line under the boxes
  page.drawText(`Date: ${filedStr}   ·   Place: ${data.locality}, ${data.district}`, {
    x: LM, y: DATE_Y, size: 8.5, font, color: rgb(0.2, 0.2, 0.2),
  });

  /* ── Footer ── */
  ctx.page.drawLine({ start: { x: LM, y: 54 }, end: { x: W - RM, y: 54 }, thickness: 0.5, color: rgb(0.75, 0.75, 0.75) });
  ctx.page.drawText(
    `Ticket: ${data.ticketNo}  |  TN Vettri Citizen Grievance Portal  |  tamilnadu.gov.in  |  Computer-generated petition`,
    { x: LM, y: 44, size: 7, font, color: rgb(0.55, 0.55, 0.55) }
  );

  const pdfBytes = await pdfDoc.save();
  return { base64: Buffer.from(pdfBytes).toString("base64"), signaturePositions };
}

/* ── Optional AI draft enrichment ───────────────────────────── */
async function fetchAiDraft(data: LegalPdfInput): Promise<string | null> {
  const apiKey = process.env.LEGAL_TECH_API_TOKEN;
  if (!apiKey) return null;

  const dept   = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
  const location = [data.address, data.locality, data.block, data.district].filter(Boolean).join(", ");

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 18_000);

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        caseType:          "grievance-notice",
        jurisdiction:      `District Collectorate – ${data.district}`,
        petitionerName:    data.name,
        respondentName:    dept,
        factsOfCase:       `${data.title}. ${data.description ?? ""}`.trim(),
        reliefSought:      relief,
        additionalDetails: `Ticket: ${data.ticketNo}. Location: ${location}. Filed: ${data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) { console.warn(`[legal-pdf] AI API ${res.status}`); return null; }
    const json = await res.json() as Record<string, unknown>;
    const text = (json.draft ?? json.text ?? json.content) as string | undefined;
    return typeof text === "string" && text.length > 20 ? text : null;
  } catch {
    console.warn("[legal-pdf] AI API unavailable");
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
    console.log(`[legal-pdf] Petition PDF ready (${result.base64.length} chars) aiDraft=${!!aiDraft} signers=${numSigners}`);
    return result;
  } catch (err) {
    console.error("[legal-pdf] build failed:", err);
    return null;
  }
}
