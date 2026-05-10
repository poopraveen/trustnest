/**
 * Legal PDF generator — Senior Advocate quality, Tamil Nadu court format
 *
 * Strategy:
 *   1. Call AI legal-tech API with rich structured facts from the user
 *   2. AI draft becomes the MAIN petition body (20-year advocate quality)
 *   3. If AI unavailable → fall back to structured template from user's data
 *   4. Wrap in court-standard PDF: header, parties, AI body, verification, signature
 *
 * IMPORTANT: Only facts provided by the user are sent to the AI.
 * The AI enhances language/structure only — never invents facts.
 */

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import type { SignaturePosition } from "./signflow";

const LEGAL_API_BASE =
  process.env.LEGAL_TECH_API_URL ?? "https://payrollsystem-2w0h.onrender.com";
const LEGAL_API = `${LEGAL_API_BASE}/legal-tech/generate-public`;

/* ── Reference maps ──────────────────────────────────────────── */
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
  "roads-&-infrastructure": "Tamil Nadu Highways Act, 2001 r/w Right to Public Services Act, 2011",
  "roads-infrastructure":   "Tamil Nadu Highways Act, 2001 r/w Right to Public Services Act, 2011",
  electricity:              "Electricity Act, 2003 r/w Right to Public Services Act, 2011",
  "water-supply":           "Tamil Nadu Water Supply and Drainage Board Act, 1970 r/w Right to Public Services Act, 2011",
  "health-services":        "Clinical Establishments Act r/w Right to Public Services Act, 2011",
  education:                "Right to Education Act, 2009 r/w Right to Public Services Act, 2011",
  "social-welfare":         "Tamil Nadu Social Welfare Act r/w Right to Public Services Act, 2011",
  "land-records":           "Tamil Nadu Land Revenue Act, 1880 r/w Right to Public Services Act, 2011",
  construction:             "Tamil Nadu Town and Country Planning Act, 1971 r/w Right to Public Services Act, 2011",
};
const DEFAULT_ACT = "Tamil Nadu Grievance Redressal Act r/w Right to Public Services Act, 2011";

const RELIEF_MAP: Record<string, string> = {
  "roads-&-infrastructure": "direct the Respondent to immediately inspect, repair and restore the road/infrastructure to a safe and serviceable condition and to take preventive measures to avoid recurrence",
  "roads-infrastructure":   "direct the Respondent to immediately inspect, repair and restore the road/infrastructure to a safe and serviceable condition and to take preventive measures to avoid recurrence",
  electricity:              "direct the Respondent to restore uninterrupted power supply, repair all defective infrastructure and ensure quality of supply as mandated by the Electricity Act, 2003",
  "water-supply":           "direct the Respondent to restore regular clean potable water supply, inspect the distribution network and submit a rectification report",
  "health-services":        "direct the Respondent to provide adequate healthcare personnel, medicines, equipment and facilities at the concerned public health institution",
  education:                "direct the Respondent to resolve the educational grievance, ensure quality education and comply with applicable statutory norms without further delay",
  "social-welfare":         "direct the Respondent to release all entitled benefits, rectify administrative errors and submit a compliance report within the statutory period",
  "land-records":           "direct the Respondent to rectify the land records, issue accurate revenue documentation and register corrections in the official register forthwith",
  construction:             "direct the Respondent to conduct a site inspection, take compliance action against unauthorised construction and submit a report to this authority",
};
const DEFAULT_RELIEF = "direct the Respondent to resolve the grievance within the 30-day statutory SLA and submit a compliance report to the Petitioner(s)";

/* ── Input / output types ────────────────────────────────────── */
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
  font:    PDFFont;   // Times Roman
  bold:    PDFFont;
  italic:  PDFFont;
  y:       number;    // current y from bottom (pdf-lib)
  lm:      number;
  rm:      number;
  W:       number;
  H:       number;
}

const CONTENT_FLOOR = 240; // content must not go below this — signatures live here

function usableW(ctx: Ctx) { return ctx.W - ctx.lm - ctx.rm; }

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = para.trim();
    if (!trimmed) { out.push(""); continue; }
    const words = trimmed.split(" ");
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > maxW && line) { out.push(line); line = w; }
      else line = t;
    }
    if (line) out.push(line);
  }
  return out;
}

function draw(ctx: Ctx, text: string, opts: {
  size?:   number;
  bold?:   boolean;
  italic?: boolean;
  center?: boolean;
  color?:  [number, number, number];
  indent?: number;
  gap?:    number;
} = {}): void {
  const sz  = opts.size ?? 9.5;
  const lh  = sz * 1.5;
  const f   = opts.bold ? ctx.bold : opts.italic ? ctx.italic : ctx.font;
  const col = rgb(...((opts.color ?? [0.04, 0.04, 0.04]) as [number, number, number]));
  const x   = ctx.lm + (opts.indent ?? 0);
  const mw  = usableW(ctx) - (opts.indent ?? 0);
  for (const line of wrapText(text, f, sz, mw)) {
    if (ctx.y < CONTENT_FLOOR) return;
    const lx = opts.center ? (ctx.W - f.widthOfTextAtSize(line, sz)) / 2 : x;
    ctx.page.drawText(line, { x: lx, y: ctx.y, size: sz, font: f, color: col });
    ctx.y -= lh;
  }
  ctx.y -= (opts.gap ?? 3);
}

function rule(ctx: Ctx, thick = 0.5, col: [number, number, number] = [0.75, 0.75, 0.75]) {
  ctx.page.drawLine({
    start: { x: ctx.lm, y: ctx.y + 2 }, end: { x: ctx.W - ctx.rm, y: ctx.y + 2 },
    thickness: thick, color: rgb(...col),
  });
  ctx.y -= 10;
}

function gap(ctx: Ctx, pts = 8) { ctx.y -= pts; }

/* ── Parse AI draft into labelled sections ───────────────────── */
interface DraftSection { heading: string; body: string }

function parseDraft(raw: string): DraftSection[] {
  // Common legal section headers the AI produces
  const HEADERS = [
    /^(MOST RESPECTFULLY SHOWETH\s*:?)/i,
    /^(STATEMENT OF FACTS?\s*:?)/i,
    /^(FACTS OF THE CASE\s*:?)/i,
    /^(GROUNDS?\s*:?)/i,
    /^(GROUNDS? OF PETITION\s*:?)/i,
    /^(PRAYER\s*:?)/i,
    /^(PRAYER FOR RELIEF\s*:?)/i,
    /^(RELIEF SOUGHT\s*:?)/i,
    /^(VERIFICATION\s*:?)/i,
    /^(HUMBLE PRAYER\s*:?)/i,
  ];

  const lines = raw.split("\n");
  const sections: DraftSection[] = [];
  let current: DraftSection = { heading: "", body: "" };

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeader = HEADERS.some(re => re.test(trimmed));

    if (isHeader && trimmed.length < 60) {
      if (current.body.trim()) sections.push(current);
      current = { heading: trimmed.replace(/:$/, "").trim().toUpperCase(), body: "" };
    } else {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current.body.trim() || current.heading) sections.push(current);

  // If AI produced no recognisable sections, treat the whole thing as one block
  if (sections.length <= 1 && sections[0]?.heading === "") {
    return [{ heading: "PETITION CONTENTS", body: raw.trim() }];
  }
  return sections.filter(s => s.body.trim() || s.heading);
}

/* ── Build the PDF ───────────────────────────────────────────── */
async function buildPdf(
  data: LegalPdfInput,
  aiDraft: string | undefined,
  numSigners: number,
): Promise<PdfResult> {

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595.28, 841.89]); // A4

  const font   = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold   = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const W = page.getWidth(), H = page.getHeight();
  const LM = 62, RM = 62;
  const ctx: Ctx = { page, font, bold, italic, y: 0, lm: LM, rm: RM, W, H };

  const dept      = DEPT_MAP[data.category]      ?? DEFAULT_DEPT;
  const authority = AUTHORITY_MAP[data.category] ?? DEFAULT_DEPT;
  const act       = ACT_MAP[data.category]       ?? DEFAULT_ACT;
  const relief    = RELIEF_MAP[data.category]    ?? DEFAULT_RELIEF;
  const location  = [data.address, data.locality, data.block, data.district].filter(Boolean).join(", ");
  const catLabel  = data.category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const filedStr  = data.filedAt.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "long", day: "numeric",
  });

  /* ── Outer border ── */
  page.drawRectangle({ x: 38, y: 38, width: W - 76, height: H - 76, borderColor: rgb(0.08, 0.32, 0.17), borderWidth: 1 });
  page.drawRectangle({ x: 42, y: 42, width: W - 84, height: H - 84, borderColor: rgb(0.08, 0.32, 0.17), borderWidth: 0.3 });

  /* ── Header banner ── */
  page.drawRectangle({ x: 38, y: H - 76, width: W - 76, height: 38, color: rgb(0.06, 0.28, 0.15) });
  page.drawText("GOVERNMENT OF TAMIL NADU  ·  CITIZEN GRIEVANCE PORTAL  ·  TN VETTRI", {
    x: LM, y: H - 56, size: 9, font: bold, color: rgb(0.85, 0.97, 0.88),
  });
  page.drawText("tamilnadu.gov.in  ·  pgportal.gov.in  ·  tnvettri.in", {
    x: LM, y: H - 70, size: 7.5, font, color: rgb(0.6, 0.85, 0.65),
  });

  ctx.y = H - 90;

  /* ── "To" block ── */
  draw(ctx, "To,", { italic: true, size: 9, gap: 1 });
  draw(ctx, authority + ",", { bold: true, size: 9, gap: 1 });
  draw(ctx, `${data.district} District, Tamil Nadu.`, { size: 9, gap: 10 });

  /* ── Sub / Ref ── */
  draw(ctx, `Sub: Grievance Petition – ${catLabel} – "${data.title}" – reg.`, { bold: true, size: 9, gap: 4 });
  draw(ctx, `Ref: Ticket No. ${data.ticketNo}  |  Date: ${filedStr}`, { italic: true, size: 9, gap: 8 });
  rule(ctx, 0.5);
  gap(ctx, 4);

  /* ── Petition title ── */
  draw(ctx, "P  E  T  I  T  I  O  N", { bold: true, size: 12, center: true, color: [0.06, 0.28, 0.15], gap: 2 });
  draw(ctx, `(Filed under the ${act})`, { italic: true, size: 8, center: true, color: [0.35, 0.35, 0.35], gap: 8 });
  rule(ctx, 0.5);
  gap(ctx, 4);

  /* ── Parties ── */
  const petLines = data.name.split(",").map(s => s.trim()).filter(Boolean);
  for (const pl of petLines) draw(ctx, pl, { bold: true, size: 9.5, gap: 1 });
  if (location) draw(ctx, location, { size: 9, gap: 1 });
  if (data.phone) draw(ctx, `Ph: ${data.phone}  |  Email: ${data.email || "—"}`, { size: 8.5, gap: 2 });

  const petLabel = "... PETITIONER(S)";
  page.drawText(petLabel, {
    x: W - RM - bold.widthOfTextAtSize(petLabel, 9.5),
    y: ctx.y + 12, size: 9.5, font: bold, color: rgb(0.04, 0.04, 0.04),
  });
  gap(ctx, 10);
  draw(ctx, "V  E  R  S  U  S", { bold: true, size: 8.5, center: true, color: [0.45, 0.45, 0.45], gap: 10 });

  draw(ctx, dept + ",", { bold: true, size: 9.5, gap: 1 });
  draw(ctx, `District Collectorate, ${data.district} District, Tamil Nadu.`, { size: 9, gap: 2 });
  const resLabel = "... RESPONDENT";
  page.drawText(resLabel, {
    x: W - RM - bold.widthOfTextAtSize(resLabel, 9.5),
    y: ctx.y + 12, size: 9.5, font: bold, color: rgb(0.04, 0.04, 0.04),
  });
  gap(ctx, 12);
  rule(ctx, 0.8, [0.06, 0.28, 0.15]);
  gap(ctx, 6);

  /* ═══════════════════════════════════════════════════════════
     PETITION BODY — AI draft (preferred) or template fallback
  ═══════════════════════════════════════════════════════════ */

  if (aiDraft && aiDraft.trim().length > 100) {
    /* ── AI path: parse into sections and render each ── */
    draw(ctx, "MOST RESPECTFULLY SHOWETH:", { bold: true, size: 10, gap: 8 });

    const sections = parseDraft(aiDraft);

    for (const sec of sections) {
      // Skip headers AI already included that we render ourselves
      const skip = ["MOST RESPECTFULLY SHOWETH", "VERIFICATION"].includes(sec.heading.toUpperCase());
      if (sec.heading && !skip) {
        draw(ctx, sec.heading, { bold: true, size: 9.5, color: [0.06, 0.28, 0.15], gap: 3 });
      }

      // Render body: detect numbered paragraphs (1. 2. etc.)
      const bodyLines = sec.body.split("\n");
      let paraBuffer = "";

      const flushPara = () => {
        const t = paraBuffer.trim();
        if (t) draw(ctx, t, { size: 9.5, indent: 0, gap: 7 });
        paraBuffer = "";
      };

      for (const line of bodyLines) {
        const trimmed = line.trim();
        if (!trimmed) { flushPara(); continue; }

        // Numbered para: starts with digit(s) followed by . or )
        const isNumbered = /^\d+[\.\)]/.test(trimmed);
        if (isNumbered && paraBuffer.trim()) flushPara();

        paraBuffer += (paraBuffer ? " " : "") + trimmed;
      }
      flushPara();
      gap(ctx, 4);
    }

  } else {
    /* ── Template fallback (AI unavailable) ── */
    draw(ctx, "MOST RESPECTFULLY SHOWETH:", { bold: true, size: 10, gap: 8 });

    const grounds = [
      `That the Petitioner(s) is/are a bona fide resident(s) of ${data.locality}, ${data.block} Taluk, ${data.district} District, Tamil Nadu, and is/are constitutionally and statutorily entitled to receive all civic amenities and public services in a timely and adequate manner.`,
      `That the Respondent, ${dept.replace(/^The\s+/i, "")}, is the competent authority under the applicable statute responsible for ensuring ${catLabel.toLowerCase()} services in the Petitioner's locality, and is bound by the 30-day SLA under the Tamil Nadu Grievance Redressal Act.`,
      `That the subject matter of this petition is: "${data.title}".`,
      data.description.trim()
        ? `That the Petitioner states the following facts: ${data.description}`
        : `That the Respondent has failed to discharge its statutory duty, causing serious inconvenience to the Petitioner(s).`,
      `That the continued inaction of the Respondent has resulted in public hardship and inconvenience, violating the Petitioner's fundamental and statutory rights.`,
      `That the Petitioner has not filed any other similar petition before any other forum, and this petition is filed bona fide in the interest of justice.`,
    ];

    for (let i = 0; i < grounds.length; i++) {
      draw(ctx, `${i + 1}.  ${grounds[i]}`, { size: 9.5, indent: 0, gap: 7 });
    }
    gap(ctx, 4);
    rule(ctx, 0.4);
    gap(ctx, 5);

    draw(ctx, "PRAYER", { bold: true, size: 10, center: true, color: [0.06, 0.28, 0.15], gap: 6 });
    draw(ctx, "In the light of the facts and circumstances stated above, the Petitioner(s) most respectfully pray(s) that this Honourable Authority may be pleased to:", { size: 9.5, gap: 5 });
    draw(ctx, `(a)  ${relief.charAt(0).toUpperCase() + relief.slice(1)};`, { size: 9.5, indent: 10, gap: 4 });
    draw(ctx, "(b)  Direct the Respondent to submit an action-taken report to the Petitioner within 30 days;", { size: 9.5, indent: 10, gap: 4 });
    draw(ctx, "(c)  Pass such other orders as this Honourable Authority deems fit and proper in the interest of justice.", { size: 9.5, indent: 10, gap: 8 });
    draw(ctx, "And for this act of kindness the Petitioner(s) shall, as in duty bound, ever pray.", { italic: true, size: 9.5, gap: 6 });
  }

  /* ── Verification (always template — standard legal boilerplate) ── */
  rule(ctx, 0.4);
  gap(ctx, 5);
  draw(ctx, "VERIFICATION", { bold: true, size: 10, center: true, color: [0.06, 0.28, 0.15], gap: 5 });
  draw(ctx,
    `I/We, ${data.name}, the Petitioner(s) above named, do hereby solemnly verify and affirm that the contents of this petition are true and correct to the best of my/our knowledge and belief, no part thereof is false, and nothing material has been concealed or mis-stated therein.`,
    { size: 9.5, gap: 4 }
  );
  draw(ctx, `Verified at ${data.locality}, ${data.district} on this ${filedStr}.`, { size: 9.5, gap: 6 });

  /* ── Signature blocks — FIXED at bottom of page ── */
  const SIG_LABEL_Y  = 228;
  const NAME_LABEL_Y = 213;
  const BOX_TOP_Y    = 200;
  const BOX_H        = 42;
  const BOX_BOTTOM_Y = BOX_TOP_Y - BOX_H;  // 158
  const DATE_Y       = BOX_BOTTOM_Y - 14;  // 144

  rule(ctx, 0.4);

  const signaturePositions: SignaturePosition[] = [];
  const sigCount = Math.max(numSigners, 1);
  const colW     = Math.min(195, (usableW(ctx) - 14 * (sigCount - 1)) / sigCount);

  page.drawText("SIGNATURE(S) OF PETITIONER(S):", {
    x: LM, y: SIG_LABEL_Y, size: 8.5, font: bold, color: rgb(0.06, 0.28, 0.15),
  });

  for (let i = 0; i < sigCount; i++) {
    const bx = LM + i * (colW + 16);

    page.drawText(sigCount === 1 ? "Petitioner:" : `Petitioner ${i + 1}:`, {
      x: bx, y: NAME_LABEL_Y, size: 8.5, font: bold, color: rgb(0.28, 0.28, 0.28),
    });

    page.drawRectangle({
      x: bx, y: BOX_BOTTOM_Y, width: colW, height: BOX_H,
      borderColor: rgb(0.35, 0.35, 0.35), borderWidth: 0.7,
    });

    page.drawText("(Sign here)", {
      x: bx + 8, y: BOX_BOTTOM_Y + 9, size: 8, font: italic, color: rgb(0.6, 0.6, 0.6),
    });

    // SignFlow coords: y=0 is top, y=1 is bottom
    signaturePositions.push({
      x:         parseFloat((bx / W).toFixed(4)),
      y:         parseFloat((1 - (BOX_TOP_Y / H)).toFixed(4)),
      pageIndex: 0,
      width:     parseFloat((colW / W).toFixed(4)),
      height:    parseFloat((BOX_H / H).toFixed(4)),
    });
  }

  page.drawText(`Date: ${filedStr}   ·   Place: ${data.locality}, ${data.district}`, {
    x: LM, y: DATE_Y, size: 8.5, font, color: rgb(0.18, 0.18, 0.18),
  });

  /* ── Footer ── */
  page.drawLine({ start: { x: LM, y: 52 }, end: { x: W - RM, y: 52 }, thickness: 0.4, color: rgb(0.7, 0.7, 0.7) });
  page.drawText(
    `Ticket: ${data.ticketNo}  ·  TN Vettri Citizen Grievance Portal  ·  tamilnadu.gov.in  ·  Computer-generated petition`,
    { x: LM, y: 42, size: 6.5, font, color: rgb(0.5, 0.5, 0.5) }
  );

  const pdfBytes = await pdfDoc.save();
  return { base64: Buffer.from(pdfBytes).toString("base64"), signaturePositions };
}

/* ── Fetch AI draft with RICH structured prompt ──────────────── */
async function fetchAiDraft(data: LegalPdfInput): Promise<string | null> {
  const apiKey = process.env.LEGAL_TECH_API_TOKEN;
  if (!apiKey) return null;

  const dept    = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief  = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
  const catLabel = data.category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  /*
   * Rich facts prompt — ONLY user-supplied data, no invented content.
   * Structured so the AI (trained senior advocate) can:
   *   - Identify the legal nature of the grievance
   *   - Frame it in court-appropriate language
   *   - Cite relevant rights/acts automatically
   *   - Suggest the proper relief without inventing facts
   */
  const factsOfCase = `
CATEGORY OF GRIEVANCE: ${catLabel}
JURISDICTION: ${data.locality}, ${data.block} Taluk, ${data.district} District, Tamil Nadu

PETITIONER'S EXACT STATEMENT — SUBJECT:
"${data.title}"

PETITIONER'S EXACT STATEMENT — DESCRIPTION OF PROBLEM:
"${data.description || "(No additional description provided)"}"

PETITIONER'S ADDRESS:
${[data.address, data.locality, data.block + " Taluk", data.district + " District, Tamil Nadu"].filter(Boolean).join(", ")}

INSTRUCTIONS TO ADVOCATE:
- Use ONLY the facts above — do not invent, assume or add any facts not stated.
- Enhance the language to court standard (Tamil Nadu District Collector petition format).
- Draft numbered grounds (1, 2, 3...) establishing legal basis for the grievance.
- Include a proper PRAYER section with specific, realistic relief.
- The petition should read as though drafted by a senior advocate with 20 years of Tamil Nadu court experience.
- Format: MOST RESPECTFULLY SHOWETH, numbered GROUNDS, PRAYER.
  `.trim();

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 22_000);

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        caseType:          `Tamil Nadu Grievance Petition – ${catLabel}`,
        jurisdiction:      `District Collectorate, ${data.district} District, Tamil Nadu`,
        petitionerName:    data.name,
        respondentName:    dept.replace(/^The\s+/i, ""),
        factsOfCase,
        reliefSought:      relief,
        additionalDetails: `Ticket: ${data.ticketNo}. Filed: ${data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}. Contact: ${data.phone}.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) {
      console.warn(`[legal-pdf] AI API ${res.status} — using template`);
      return null;
    }

    const json = await res.json() as Record<string, unknown>;
    const text = (json.draft ?? json.text ?? json.content) as string | undefined;
    if (typeof text !== "string" || text.length < 50) return null;

    console.log(`[legal-pdf] AI draft received (${text.length} chars)`);
    return text;
  } catch {
    console.warn("[legal-pdf] AI API unavailable — using template fallback");
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
    console.log(`[legal-pdf] Petition ready | aiDraft=${!!aiDraft} | signers=${numSigners} | b64=${result.base64.length}`);
    return result;
  } catch (err) {
    console.error("[legal-pdf] build failed:", err);
    return null;
  }
}
