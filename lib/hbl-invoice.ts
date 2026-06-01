import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

export interface InvoiceItem {
  sku: string;
  description: string;
  mrpPerUnit: number;
  qty: number;
  retailPricePerUnit: number;
}

export interface InvoiceData {
  orderNo: string;
  invoiceNo: string;
  orderDate: string;
  member: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  shipTo: {
    name: string;
    address: string;
  };
  items: InvoiceItem[];
  volumePoints?: number;
  clubName?: string;
  clubAddress?: string;
}

const GREEN = rgb(0.118, 0.565, 0.255);
const BLACK = rgb(0, 0, 0);
const DARK  = rgb(0.15, 0.15, 0.15);
const GRAY  = rgb(0.5, 0.5, 0.5);
const LGRAY = rgb(0.93, 0.93, 0.93);
const WHITE = rgb(1, 1, 1);
const BORDER = rgb(0.75, 0.75, 0.75);

function numberToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  const toWords = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + toWords(num % 100) : "");
    if (num < 100000) return toWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + toWords(num % 1000) : "");
    if (num < 10000000) return toWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + toWords(num % 100000) : "");
    return toWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + toWords(num % 10000000) : "");
  };
  const rounded = Math.round(n);
  const paise = Math.round((n - rounded) * 100);
  return toWords(rounded) + " Rupees" + (paise > 0 ? " and " + toWords(paise) + " Paise" : "") + " Only";
}

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, fill: ReturnType<typeof rgb>, stroke?: ReturnType<typeof rgb>) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill, borderColor: stroke, borderWidth: stroke ? 0.5 : 0 });
}

function text(page: PDFPage, str: string, x: number, y: number, font: PDFFont, size: number, color = BLACK, maxWidth?: number) {
  let s = str ?? "";
  if (maxWidth && font.widthOfTextAtSize(s, size) > maxWidth) {
    while (s.length > 0 && font.widthOfTextAtSize(s + "…", size) > maxWidth) s = s.slice(0, -1);
    s += "…";
  }
  page.drawText(s, { x, y, size, font, color });
}

function hline(page: PDFPage, x: number, y: number, w: number, color = BORDER) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.5, color });
}

function vline(page: PDFPage, x: number, y: number, h: number, color = BORDER) {
  page.drawLine({ start: { x, y }, end: { x, y: y - h }, thickness: 0.5, color });
}

export async function generateHblInvoice(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  const M = 36; // margin
  const W = 595 - M * 2; // content width

  let y = height - M;

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  drawRect(page, M, y - 52, W, 52, GREEN);
  // Herbalife leaf icon (simple circle + leaf shape as substitute)
  page.drawCircle({ x: M + 22, y: y - 20, size: 10, color: WHITE });
  page.drawCircle({ x: M + 22, y: y - 20, size: 6, color: GREEN });
  text(page, "Herbalife", M + 36, y - 16, bold, 18, WHITE);
  text(page, "NUTRITION", M + 36, y - 29, reg, 7.5, rgb(0.8, 1, 0.8));
  text(page, "TAX INVOICE", M + W - 90, y - 22, bold, 13, WHITE);
  text(page, "Original for Recipient", M + W - 90, y - 35, reg, 6.5, rgb(0.85, 1, 0.85));
  y -= 60;

  // ── SELLER INFO ─────────────────────────────────────────────────────────────
  const clubName = data.clubName ?? "Herbalife Nutrition Club";
  const clubAddr = data.clubAddress ?? "Veppampattu, Tiruvallur, Tamil Nadu 602024";
  drawRect(page, M, y - 60, W, 60, LGRAY, BORDER);
  text(page, clubName.toUpperCase(), M + 6, y - 12, bold, 8, DARK);
  text(page, clubAddr, M + 6, y - 22, reg, 7, GRAY);
  text(page, "GSTIN: 33AAACH8025R1ZA  |  FSSAI: 10013043000639", M + 6, y - 33, reg, 6.5, GRAY);
  text(page, "Reverse Charge: No", M + 6, y - 43, reg, 6.5, GRAY);
  // Right side — order meta
  const meta = [
    ["Invoice No:", data.invoiceNo],
    ["Invoice Date:", data.orderDate],
    ["Order No:", data.orderNo],
    ["Order Channel:", "Online"],
  ];
  const colX = M + W / 2 + 10;
  meta.forEach(([k, v], i) => {
    text(page, k, colX, y - 12 - i * 11, reg, 7, GRAY);
    text(page, v, colX + 75, y - 12 - i * 11, bold, 7, DARK);
  });
  y -= 68;

  // ── PURCHASED BY / SHIP TO ──────────────────────────────────────────────────
  const half = W / 2 - 3;
  // Purchased by box
  drawRect(page, M, y - 72, half, 72, WHITE, BORDER);
  text(page, "Purchased By:", M + 5, y - 10, bold, 7.5, DARK);
  hline(page, M, y - 14, half);
  const pb = [
    ["ID #:", data.member.id.slice(0, 12).toUpperCase()],
    ["Name:", data.member.name],
    ["Phone:", data.member.phone],
    ...(data.member.email ? [["Email:", data.member.email]] : []),
    ...(data.member.address ? [["Address:", data.member.address]] : []),
  ];
  pb.forEach(([k, v], i) => {
    text(page, k, M + 5, y - 24 - i * 11, reg, 7, GRAY);
    text(page, v, M + 42, y - 24 - i * 11, reg, 7, DARK, half - 48);
  });
  // Ship to box
  const sx = M + half + 6;
  drawRect(page, sx, y - 72, half, 72, WHITE, BORDER);
  text(page, "Ship To:", sx + 5, y - 10, bold, 7.5, DARK);
  hline(page, sx, y - 14, half);
  text(page, "Name:", sx + 5, y - 24, reg, 7, GRAY);
  text(page, data.shipTo.name, sx + 42, y - 24, reg, 7, DARK, half - 48);
  text(page, "Address:", sx + 5, y - 35, reg, 7, GRAY);
  const addrLines = data.shipTo.address.match(/.{1,35}/g) ?? [data.shipTo.address];
  addrLines.slice(0, 3).forEach((line, i) => text(page, line, sx + 42, y - 35 - i * 10, reg, 7, DARK));
  text(page, "State: TAMIL NADU  |  State Code: 33", sx + 5, y - 62, reg, 6.5, GRAY);
  y -= 80;

  // ── PLACE OF SUPPLY ─────────────────────────────────────────────────────────
  drawRect(page, M, y - 16, W, 16, LGRAY, BORDER);
  text(page, "Place of Supply:  Tamil Nadu  |  State Code: 33", M + 6, y - 10, reg, 7, DARK);
  y -= 22;

  // ── TABLE HEADER ────────────────────────────────────────────────────────────
  const cols = { sl: 20, sku: 36, desc: 110, mrp: 48, qty: 24, retail: 50, total: 50, disc: 44, taxable: 50, sgst: 38, cgst: 38 };
  const colX2 = (idx: number) => M + Object.values(cols).slice(0, idx).reduce((a, b) => a + b, 0);
  drawRect(page, M, y - 22, W, 22, GREEN);
  const headers = ["SL", "SKU", "Description", "MRP/Unit", "Qty", "Retail/Unit", "Total", "Discount", "Taxable", "SGST\n2.5%", "CGST\n2.5%"];
  headers.forEach((h, i) => {
    const cx = colX2(i);
    const cw = Object.values(cols)[i];
    const lines = h.split("\n");
    lines.forEach((line, li) => text(page, line, cx + 2, y - 9 - li * 8, bold, 6, WHITE, cw - 4));
  });
  // vertical dividers in header
  for (let i = 1; i < headers.length; i++) vline(page, colX2(i), y, 22, rgb(1, 1, 1));
  hline(page, M, y - 22, W, BORDER);
  y -= 24;

  // ── TABLE ROWS ──────────────────────────────────────────────────────────────
  let grandMrp = 0, grandTotal = 0, grandDiscount = 0, grandTaxable = 0, grandSgst = 0, grandCgst = 0;

  data.items.forEach((item, idx) => {
    const rowH = 20;
    const bg = idx % 2 === 0 ? WHITE : rgb(0.97, 0.99, 0.97);
    drawRect(page, M, y - rowH, W, rowH, bg);

    const mrpTotal = item.mrpPerUnit * item.qty;
    const retailTotal = item.retailPricePerUnit * item.qty;
    const discount = mrpTotal - retailTotal;
    const taxableVal = retailTotal / 1.05; // back-calculate pre-tax
    const sgst = taxableVal * 0.025;
    const cgst = taxableVal * 0.025;

    grandMrp += mrpTotal;
    grandTotal += retailTotal;
    grandDiscount += discount;
    grandTaxable += taxableVal;
    grandSgst += sgst;
    grandCgst += cgst;

    const row = [
      String(idx + 1),
      item.sku,
      item.description,
      `${item.mrpPerUnit.toFixed(2)}`,
      String(item.qty),
      `${item.retailPricePerUnit.toFixed(2)}`,
      `${retailTotal.toFixed(2)}`,
      `${discount.toFixed(2)}`,
      `${taxableVal.toFixed(2)}`,
      `${sgst.toFixed(2)}`,
      `${cgst.toFixed(2)}`,
    ];
    row.forEach((val, i) => {
      const cx = colX2(i);
      const cw = Object.values(cols)[i];
      text(page, val, cx + 2, y - 13, reg, 7, DARK, cw - 4);
    });
    for (let i = 1; i < headers.length; i++) vline(page, colX2(i), y, rowH, BORDER);
    hline(page, M, y - rowH, W, BORDER);
    y -= rowH + 2;
  });

  // ── TOTALS ROW ──────────────────────────────────────────────────────────────
  drawRect(page, M, y - 20, W, 20, LGRAY);
  text(page, "Total", colX2(2) + 2, y - 13, bold, 7.5, DARK);
  [
    [5, grandMrp], [6, grandTotal], [7, grandDiscount],
    [8, grandTaxable], [9, grandSgst], [10, grandCgst],
  ].forEach(([colIdx, val]) => {
    const cx = colX2(colIdx as number);
    const cw = Object.values(cols)[colIdx as number];
    text(page, (val as number).toFixed(2), cx + 2, y - 13, bold, 7.5, DARK, cw - 4);
  });
  for (let i = 1; i < headers.length; i++) vline(page, colX2(i), y, 20, BORDER);
  hline(page, M, y - 20, W, BORDER);
  y -= 28;

  // ── INVOICE SUMMARY ─────────────────────────────────────────────────────────
  const invoiceTotal = grandTaxable + grandSgst + grandCgst;
  const netSavings = grandMrp - invoiceTotal;

  drawRect(page, M, y - 50, W, 50, WHITE, BORDER);
  // Left: value in words
  text(page, "Invoice Value (in words):", M + 6, y - 10, bold, 7, DARK);
  const words = numberToWords(invoiceTotal);
  // wrap words
  const wordLines = words.match(/.{1,55}/g) ?? [words];
  wordLines.slice(0, 2).forEach((line, i) => text(page, line, M + 6, y - 21 - i * 11, reg, 7, DARK));

  // Right: totals
  const sumX = M + W - 160;
  [
    ["MRP Total:", `₹ ${grandMrp.toFixed(2)}`],
    ["Invoice Total:", `₹ ${invoiceTotal.toFixed(2)}`],
    ["Net Savings:", `₹ ${netSavings.toFixed(2)}`],
  ].forEach(([k, v], i) => {
    text(page, k, sumX, y - 10 - i * 13, i === 1 ? bold : reg, 7.5, i === 1 ? GREEN : DARK);
    text(page, v, sumX + 80, y - 10 - i * 13, i === 1 ? bold : reg, 7.5, i === 1 ? GREEN : DARK);
  });
  y -= 58;

  // ── VOLUME POINTS ───────────────────────────────────────────────────────────
  if (data.volumePoints !== undefined) {
    drawRect(page, M, y - 18, W, 18, rgb(0.94, 1, 0.95), BORDER);
    text(page, `Volume Points: ${data.volumePoints.toFixed(2)}`, M + 6, y - 11, bold, 7.5, GREEN);
    y -= 24;
  }

  // ── NOTES ───────────────────────────────────────────────────────────────────
  y -= 6;
  const note = "Thank you for your order. Products are prepared fresh at the nutrition club. Contact your distributor for any queries.";
  text(page, note, M, y, reg, 6.5, GRAY, W);
  y -= 14;
  text(page, "Toll Free: 1800-102-2444  |  Email: preferredcustomer@herbalife.com", M, y, reg, 6.5, GRAY);
  y -= 20;

  // ── SIGNATURE ───────────────────────────────────────────────────────────────
  drawRect(page, M + W - 150, y - 50, 150, 50, WHITE, BORDER);
  text(page, "Authorised Signatory", M + W - 144, y - 12, reg, 6.5, GRAY);
  text(page, "Digitally Generated", M + W - 144, y - 24, reg, 6.5, GRAY);
  text(page, clubName, M + W - 144, y - 36, bold, 6.5, DARK, 138);
  text(page, `Date: ${data.orderDate}`, M + W - 144, y - 46, reg, 6, GRAY);

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const fy = M - 4;
  hline(page, M, fy + 14, W, GREEN);
  text(page, "This is a computer-generated invoice and does not require a physical signature.", M, fy + 6, reg, 6, GRAY);
  text(page, `Invoice generated by TrustNest HBL Portal  |  ${data.orderDate}`, M + W - 200, fy + 6, reg, 6, GRAY);

  const pdfBytes = await doc.save();
  return pdfBytes;
}
