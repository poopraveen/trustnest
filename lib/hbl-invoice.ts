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
  txt(page, docTitle, L + W - 92, y - 20, bold, 13, C.white);
  txt(page, "Original for Recipient", L + W - 92, y - 32, reg, 6, C.tgreen);
  y -= 56;

  // ── SELLER BAR ─────────────────────────────────────────────────────────────
  rect(page, L, y - 60, W, 60, C.lgray, C.border);
  txt(page, club.toUpperCase(), L + 6, y - 11, bold, 8, C.dark, W / 2 - 8);
  if (legal) txt(page, `Prop: ${legal}`, L + 6, y - 21, reg, 6.5, C.gray, W / 2 - 8);
  txt(page, addr, L + 6, y - (legal ? 31 : 22), reg, 6.5, C.gray, W - 12);
  const regLine = [
    hasGst ? `GSTIN: ${gstin}` : "GST: Not Registered (Bill of Supply)",
    fssai ? `FSSAI No: ${fssai}` : null,
    "Reverse Charge: No",
  ].filter(Boolean).join("  |  ");
  txt(page, regLine, L + 6, y - (legal ? 42 : 33), reg, 6, C.gray, W - 12);
  const contactLine = [sPhone ? `Ph: ${sPhone}` : null, sEmail ? sEmail : null].filter(Boolean).join("  |  ");
  if (contactLine) txt(page, contactLine, L + 6, y - (legal ? 52 : 44), reg, 6, C.gray, W - 12);

  const mX = L + W / 2 + 8;
  [
    ["Invoice No:",   data.invoiceNo],
    ["Invoice Date:", data.orderDate],
    ["Order No:",     data.orderNo],
    ["Channel:",      "Online"],
  ].forEach(([k, v], i) => {
    txt(page, k,  mX,      y - 11 - i * 11, reg,  7, C.gray);
    txt(page, v,  mX + 68, y - 11 - i * 11, bold, 7, C.dark);
  });
  y -= 66;

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
  // Column widths (must sum to W)
  const CW = { sl: 18, sku: 34, desc: 110, mrp: 46, qty: 20, retail: 48, total: 50, disc: 44, tax: 50, sgst: 38, cgst: 40 };
  const CWArr = Object.values(CW);
  const colStarts = CWArr.reduce<number[]>((acc, w, i) => [...acc, (acc[i - 1] ?? L) + (i === 0 ? 0 : CWArr[i - 1])], []);
  // colStarts[0] = L
  colStarts[0] = L;
  for (let i = 1; i < CWArr.length; i++) colStarts[i] = colStarts[i - 1] + CWArr[i - 1];

  const HEADS = ["SL", "SKU", "Description", "MRP/Unit", "Qty", "Retail/Unit", "Total", "Discount", "Taxable", hasGst ? "SGST\n2.5%" : "SGST", hasGst ? "CGST\n2.5%" : "CGST"];
  const TH = 20;
  rect(page, L, y - TH, W, TH, C.green);
  HEADS.forEach((h, i) => {
    const lines = h.split("\n");
    lines.forEach((line, li) => txt(page, line, colStarts[i] + 2, y - 8 - li * 8, bold, 5.8, C.white));
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
    cells.forEach((v, i) => {
      txt(page, v, colStarts[i] + 2, y - 12, reg, 6.5, C.dark, CWArr[i] - 4);
    });
    for (let i = 1; i < HEADS.length; i++) vline(page, colStarts[i], y, y - RH, C.border);
    hline(page, L, y - RH, W, C.border);
    y -= RH + 1;
  });

  // Totals row
  rect(page, L, y - 18, W, 18, C.lgray);
  txt(page, "Total", colStarts[2] + 2, y - 12, bold, 7, C.dark);
  [
    [3, totMrp], [6, totRetail], [7, totDisc], [8, totTax], [9, totSgst], [10, totCgst],
  ].forEach(([ci, val]) => {
    txt(page, (val as number).toFixed(2), colStarts[ci as number] + 2, y - 12, bold, 7, C.dark, CWArr[ci as number] - 4);
  });
  for (let i = 1; i < HEADS.length; i++) vline(page, colStarts[i], y, y - 18, C.border);
  hline(page, L, y - 18, W, C.border);
  y -= 24;

  // ── INVOICE SUMMARY ────────────────────────────────────────────────────────
  const invoiceTotal = totTax + totSgst + totCgst;
  const netSavings   = totMrp - invoiceTotal;

  rect(page, L, y - 48, W, 48, C.white, C.border);
  txt(page, "Invoice Value (in words):", L + 6, y - 10, bold, 7, C.dark);
  const words = numWords(invoiceTotal);
  const wLines = words.match(/.{1,52}/g) ?? [words];
  wLines.slice(0, 2).forEach((line, i) => txt(page, line, L + 6, y - 20 - i * 10, reg, 7, C.dark));

  const sX = L + W - 155;
  txt(page, "MRP Total:",     sX,      y - 10, reg,  7.5, C.dark);
  txt(page, `Rs. ${totMrp.toFixed(2)}`,  sX + 82, y - 10, reg,  7.5, C.dark);
  txt(page, "Invoice Total:", sX,      y - 23, bold, 8,   C.green);
  txt(page, `Rs. ${invoiceTotal.toFixed(2)}`, sX + 82, y - 23, bold, 8, C.green);
  txt(page, "Net Savings:",   sX,      y - 36, reg,  7.5, C.dark);
  txt(page, `Rs. ${netSavings.toFixed(2)}`, sX + 82, y - 36, reg, 7.5, C.dark);
  y -= 54;

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
