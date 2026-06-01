import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

export interface InvoiceItem {
  sku: string;
  description: string;
  mrpPerUnit: number;
  qty: number;
  retailPricePerUnit: number;
}

export interface InvoiceSeller {
  name?: string;       // club / branch display name
  legalName?: string;  // FBO / proprietor name
  address?: string;
  gstin?: string;
  fssai?: string;
  phone?: string;
  email?: string;
}

export interface InvoiceData {
  orderNo: string;
  invoiceNo: string;
  orderDate: string;
  member: { id: string; name: string; phone: string; email?: string; address?: string };
  shipTo: { name: string; address: string };
  items: InvoiceItem[];
  volumePoints?: number;
  /** Seller / branch details — pulled from the tenant record. */
  seller?: InvoiceSeller;
  // Legacy aliases (still honoured if `seller` is not provided)
  clubName?: string;
  clubAddress?: string;
}

// ── Colours ──────────────────────────────────────────────────────────────────
const C = {
  green:  rgb(0.086, 0.529, 0.216),
  black:  rgb(0, 0, 0),
  dark:   rgb(0.15, 0.15, 0.15),
  gray:   rgb(0.45, 0.45, 0.45),
  lgray:  rgb(0.94, 0.94, 0.94),
  white:  rgb(1, 1, 1),
  border: rgb(0.78, 0.78, 0.78),
  tgreen: rgb(0.7, 1, 0.75),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function rect(page: PDFPage, x: number, y: number, w: number, h: number, fill: ReturnType<typeof rgb>, strokeColor?: ReturnType<typeof rgb>) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill, borderColor: strokeColor, borderWidth: strokeColor ? 0.4 : 0 });
}

function txt(page: PDFPage, s: string, x: number, y: number, font: PDFFont, size: number, color = C.dark, maxW?: number) {
  if (!s) return;
  let str = String(s);
  if (maxW) {
    while (str.length > 1 && font.widthOfTextAtSize(str, size) > maxW) str = str.slice(0, -1);
    if (str !== String(s)) str = str.slice(0, -1) + "…";
  }
  page.drawText(str, { x, y, size, font, color });
}

/** Draw text right-aligned so it ends at xRight. */
function txtRight(page: PDFPage, s: string, xRight: number, y: number, font: PDFFont, size: number, color = C.dark) {
  if (!s) return;
  const str = String(s);
  const w = font.widthOfTextAtSize(str, size);
  page.drawText(str, { x: xRight - w, y, size, font, color });
}

/** Draw text centred horizontally around xCenter. */
function txtCenter(page: PDFPage, s: string, xCenter: number, y: number, font: PDFFont, size: number, color = C.dark) {
  if (!s) return;
  const str = String(s);
  const w = font.widthOfTextAtSize(str, size);
  page.drawText(str, { x: xCenter - w / 2, y, size, font, color });
}

/** Word-wrap a string into lines that each fit within maxW. */
function wrapText(font: PDFFont, s: string, size: number, maxW: number): string[] {
  const words = String(s).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && font.widthOfTextAtSize(test, size) > maxW) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function hline(page: PDFPage, x: number, y: number, w: number, color = C.border) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.4, color });
}

function vline(page: PDFPage, x: number, y1: number, y2: number, color = C.border) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: 0.4, color });
}

function numWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const toW = (x: number): string => {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    if (x < 1000) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + toW(x % 100) : "");
    if (x < 100000) return toW(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + toW(x % 1000) : "");
    return toW(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + toW(x % 100000) : "");
  };
  const r = Math.round(n);
  return (toW(r) || "Zero") + " Rupees Only";
}

// ── Main generator ────────────────────────────────────────────────────────────
export async function generateHblInvoice(data: InvoiceData): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595, 842]); // A4
  const L = 36; // left margin
  const W = 595 - L * 2; // usable width
  let y = 842 - L; // cursor starts near top

  // Resolve seller details (tenant record → legacy aliases → sensible defaults)
  const seller = data.seller ?? {};
  const club    = seller.name    ?? data.clubName    ?? "Herbalife Nutrition Club";
  const addr    = seller.address ?? data.clubAddress ?? "Veppampattu, Tiruvallur, Tamil Nadu 602024";
  const gstin   = (seller.gstin ?? "").trim();
  const fssai   = (seller.fssai ?? "").trim();
  const legal   = (seller.legalName ?? "").trim();
  const sPhone  = (seller.phone ?? "").trim();
  const sEmail  = (seller.email ?? "").trim();
  const hasGst  = gstin.length > 0;

  // ── HEADER ────────────────────────────────────────────────────────────────
  rect(page, L, y - 50, W, 50, C.green);
  txt(page, "Herbalife", L + 8, y - 18, bold, 20, C.white);
  txt(page, "NUTRITION", L + 8, y - 30, reg, 7, C.tgreen);
  const docTitle = hasGst ? "TAX INVOICE" : "BILL OF SUPPLY";
  txtRight(page, docTitle, L + W - 10, y - 20, bold, 13, C.white);
  txtRight(page, "Original for Recipient", L + W - 10, y - 32, reg, 6, C.tgreen);
  y -= 56;

  // ── SELLER BAR ─────────────────────────────────────────────────────────────
  // Left column = seller details; right column = invoice meta. They must not
  // overlap, so the left text is wrapped/clamped to its own width.
  const metaW   = 150;
  const leftW   = W - metaW;
  const leftInW = leftW - 12;
  const mX      = L + leftW + 6;

  const regLine = [
    hasGst ? `GSTIN: ${gstin}` : "GST: Not Registered (Bill of Supply)",
    fssai ? `FSSAI No: ${fssai}` : null,
    "Reverse Charge: No",
  ].filter(Boolean).join("  |  ");
  const contactLine = [sPhone ? `Ph: ${sPhone}` : null, sEmail || null].filter(Boolean).join("  |  ");
  const addrLines = wrapText(reg, addr, 6.5, leftInW).slice(0, 2);

  // Bar height = whichever column is taller.
  const leftCount = 1 + (legal ? 1 : 0) + addrLines.length + 1 + (contactLine ? 1 : 0);
  const leftH  = 11 + (leftCount - 1) * 9 + 6;
  const metaH  = 11 + 3 * 11 + 6;
  const barH   = Math.max(leftH, metaH, 54);
  rect(page, L, y - barH, W, barH, C.lgray, C.border);
  vline(page, mX - 8, y, y - barH, C.border);

  // Left column
  let ly = y - 11;
  txt(page, club.toUpperCase(), L + 6, ly, bold, 8, C.dark, leftInW); ly -= 10;
  if (legal) { txt(page, `Prop: ${legal}`, L + 6, ly, reg, 6.5, C.gray, leftInW); ly -= 9; }
  addrLines.forEach((line) => { txt(page, line, L + 6, ly, reg, 6.5, C.gray); ly -= 9; });
  txt(page, regLine, L + 6, ly, reg, 6, C.gray, leftInW); ly -= 9;
  if (contactLine) txt(page, contactLine, L + 6, ly, reg, 6, C.gray, leftInW);

  // Right column (invoice meta) — labels left, values right-aligned to the edge
  ([
    ["Invoice No:",   data.invoiceNo],
    ["Invoice Date:", data.orderDate],
    ["Order No:",     data.orderNo],
    ["Channel:",      "Online"],
  ] as [string, string][]).forEach(([k, v], i) => {
    txt(page, k, mX, y - 11 - i * 11, reg, 7, C.gray);
    txtRight(page, v, L + W - 6, y - 11 - i * 11, bold, 7, C.dark);
  });
  y -= barH + 6;

  // ── PURCHASED BY / SHIP TO ─────────────────────────────────────────────────
  const half = (W - 4) / 2;
  const rX   = L + half + 4;

  // Purchased By
  rect(page, L, y - 68, half, 68, C.white, C.border);
  txt(page, "Purchased By", L + 5, y - 10, bold, 7, C.dark);
  hline(page, L, y - 14, half);
  [
    ["ID:",   data.member.id.slice(-10).toUpperCase()],
    ["Name:", data.member.name],
    ["Ph:",   data.member.phone],
    ...(data.member.email ? [["Email:", data.member.email]] : []),
  ].forEach(([k, v], i) => {
    txt(page, k, L + 5,  y - 23 - i * 11, reg, 7, C.gray);
    txt(page, v, L + 36, y - 23 - i * 11, reg, 7, C.dark, half - 42);
  });

  // Ship To
  rect(page, rX, y - 68, half, 68, C.white, C.border);
  txt(page, "Ship To", rX + 5, y - 10, bold, 7, C.dark);
  hline(page, rX, y - 14, half);
  txt(page, "Name:",    rX + 5,  y - 23, reg, 7, C.gray);
  txt(page, data.shipTo.name, rX + 36, y - 23, reg, 7, C.dark, half - 42);
  txt(page, "Address:", rX + 5,  y - 34, reg, 7, C.gray);
  txt(page, data.shipTo.address, rX + 36, y - 34, reg, 7, C.dark, half - 42);
  txt(page, "State: TAMIL NADU  |  Code: 33", rX + 5, y - 56, reg, 6.5, C.gray);
  y -= 74;

  // ── PLACE OF SUPPLY ────────────────────────────────────────────────────────
  rect(page, L, y - 14, W, 14, C.lgray, C.border);
  txt(page, "Place of Supply: Tamil Nadu  |  State Code: 33", L + 6, y - 9.5, reg, 7, C.dark);
  y -= 20;

  // ── TABLE ──────────────────────────────────────────────────────────────────
  // Column widths — MUST sum to W (523) so the grid fills the full table width.
  const CW = { sl: 20, sku: 38, desc: 120, mrp: 47, qty: 22, retail: 49, total: 50, disc: 44, tax: 50, sgst: 41, cgst: 42 };
  const CWArr = Object.values(CW);
  const colStarts: number[] = [L];
  for (let i = 1; i < CWArr.length; i++) colStarts[i] = colStarts[i - 1] + CWArr[i - 1];

  // Per-column horizontal alignment.
  const ALIGN: ("left" | "center" | "right")[] =
    ["center", "left", "left", "right", "center", "right", "right", "right", "right", "right", "right"];
  const PAD = 3;

  // Draw a value into column `i` honouring its alignment.
  const drawCell = (s: string, i: number, yy: number, font: PDFFont, size: number, color = C.dark) => {
    const x0 = colStarts[i];
    const cw = CWArr[i];
    if (ALIGN[i] === "right") txtRight(page, s, x0 + cw - PAD, yy, font, size, color);
    else if (ALIGN[i] === "center") txtCenter(page, s, x0 + cw / 2, yy, font, size, color);
    else txt(page, s, x0 + PAD, yy, font, size, color, cw - PAD * 2);
  };

  const HEADS = ["SL", "SKU", "Description", "MRP/Unit", "Qty", "Retail/Unit", "Total", "Discount", "Taxable", hasGst ? "SGST\n2.5%" : "SGST", hasGst ? "CGST\n2.5%" : "CGST"];
  const TH = 22;
  rect(page, L, y - TH, W, TH, C.green);
  HEADS.forEach((h, i) => {
    const lines = h.split("\n");
    const ys = lines.length > 1 ? [y - 8.5, y - 16] : [y - 13.5];
    lines.forEach((line, li) => drawCell(line, i, ys[li], bold, 5.8, C.white));
  });
  // header vlines
  for (let i = 1; i < HEADS.length; i++) vline(page, colStarts[i], y, y - TH, C.white);
  hline(page, L, y - TH, W, C.border);
  y -= TH + 1;

  // Rows
  let totMrp = 0, totRetail = 0, totDisc = 0, totTax = 0, totSgst = 0, totCgst = 0;

  data.items.forEach((item, idx) => {
    const RH = 18;
    const rowBg = idx % 2 === 0 ? C.white : rgb(0.97, 1, 0.97);
    rect(page, L, y - RH, W, RH, rowBg);

    const mrpTotal   = item.mrpPerUnit * item.qty;
    const retail     = item.retailPricePerUnit * item.qty;
    const disc       = mrpTotal - retail;
    // GST-registered sellers: price is inclusive of 5% GST (2.5% SGST + 2.5% CGST).
    // Unregistered retailers (Bill of Supply): no tax is extracted.
    const taxable    = hasGst ? retail / 1.05 : retail;
    const sgst       = hasGst ? taxable * 0.025 : 0;
    const cgst       = hasGst ? taxable * 0.025 : 0;

    totMrp    += mrpTotal;
    totRetail += retail;
    totDisc   += disc;
    totTax    += taxable;
    totSgst   += sgst;
    totCgst   += cgst;

    const cells = [
      String(idx + 1), item.sku, item.description,
      mrpTotal.toFixed(2), String(item.qty), item.retailPricePerUnit.toFixed(2),
      retail.toFixed(2), disc.toFixed(2), taxable.toFixed(2),
      sgst.toFixed(2), cgst.toFixed(2),
    ];
    cells.forEach((v, i) => drawCell(v, i, y - 12, reg, 6.5, C.dark));
    for (let i = 1; i < HEADS.length; i++) vline(page, colStarts[i], y, y - RH, C.border);
    hline(page, L, y - RH, W, C.border);
    y -= RH + 1;
  });

  // Totals row
  const TR = 18;
  rect(page, L, y - TR, W, TR, C.lgray);
  txt(page, "Total", colStarts[1] + PAD, y - 12, bold, 7, C.dark);
  ([
    [3, totMrp], [6, totRetail], [7, totDisc], [8, totTax], [9, totSgst], [10, totCgst],
  ] as [number, number][]).forEach(([ci, val]) => {
    drawCell(val.toFixed(2), ci, y - 12, bold, 7, C.dark);
  });
  for (let i = 1; i < HEADS.length; i++) vline(page, colStarts[i], y, y - TR, C.border);
  hline(page, L, y - TR, W, C.border);
  y -= TR + 6;

  // ── INVOICE SUMMARY ────────────────────────────────────────────────────────
  const invoiceTotal = totTax + totSgst + totCgst;
  const netSavings   = totMrp - invoiceTotal;

  const SH = 50;
  rect(page, L, y - SH, W, SH, C.white, C.border);

  // Left: amount in words
  txt(page, "Invoice Value (in words):", L + 6, y - 11, bold, 7, C.dark);
  const words = numWords(invoiceTotal);
  const wLines = words.match(/.{1,46}/g) ?? [words];
  wLines.slice(0, 2).forEach((line, i) => txt(page, line, L + 6, y - 22 - i * 10, reg, 7, C.dark));

  // Right: totals block (labels left, amounts right-aligned to a shared edge)
  const sLabelX = L + W - 170;
  const sValR   = L + W - 8;
  vline(page, sLabelX - 12, y, y - SH, C.border);
  txt(page,      "MRP Total:",     sLabelX, y - 12, reg,  7.5, C.dark);
  txtRight(page, `Rs. ${totMrp.toFixed(2)}`,        sValR, y - 12, reg,  7.5, C.dark);
  txt(page,      "Invoice Total:", sLabelX, y - 26, bold, 8.5, C.green);
  txtRight(page, `Rs. ${invoiceTotal.toFixed(2)}`,  sValR, y - 26, bold, 8.5, C.green);
  txt(page,      "Net Savings:",   sLabelX, y - 40, reg,  7.5, C.dark);
  txtRight(page, `Rs. ${netSavings.toFixed(2)}`,    sValR, y - 40, reg,  7.5, C.dark);
  y -= SH + 6;

  // ── VOLUME POINTS ──────────────────────────────────────────────────────────
  if (data.volumePoints !== undefined) {
    rect(page, L, y - 16, W, 16, rgb(0.93, 1, 0.94), C.border);
    txt(page, `Volume Points: ${data.volumePoints.toFixed(2)}`, L + 6, y - 10, bold, 7.5, C.green);
    y -= 22;
  }

  // ── NOTES ──────────────────────────────────────────────────────────────────
  y -= 6;
  if (!hasGst) {
    txt(page, "Bill of Supply: Seller is not registered under GST (turnover within exemption limit). No tax is charged on this bill.", L, y, reg, 6.5, C.gray, W);
    y -= 11;
  }
  txt(page, "Thank you for your order. Products are prepared fresh at the nutrition club. Contact us for any queries.", L, y, reg, 6.5, C.gray, W);
  y -= 12;
  const footContact = [
    sPhone ? `Ph: ${sPhone}` : null,
    sEmail ? `Email: ${sEmail}` : "Email: preferredcustomer@herbalife.com",
    "Web: www.myherbalife.com/en-in/",
  ].filter(Boolean).join("  |  ");
  txt(page, footContact, L, y, reg, 6.5, C.gray, W);
  y -= 20;

  // ── SIGNATURE ──────────────────────────────────────────────────────────────
  const sigX = L + W - 148;
  rect(page, sigX, y - 46, 148, 46, C.white, C.border);
  txt(page, "Authorised Signatory",     sigX + 6, y - 12, reg,  6.5, C.gray);
  txt(page, "Digitally Generated",      sigX + 6, y - 22, reg,  6.5, C.gray);
  txt(page, club,                       sigX + 6, y - 33, bold, 6.5, C.dark, 136);
  txt(page, `Date: ${data.orderDate}`,  sigX + 6, y - 43, reg,  6,   C.gray);

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const fy = L + 2;
  hline(page, L, fy + 12, W, C.green);
  txt(page, "This is a computer-generated invoice and does not require a physical signature.", L, fy + 4, reg, 6, C.gray);

  return doc.save();
}
