"""
Generate the world-class TrustNest HBL brochure for the Veppampattu Herbalife
Nutrition Club branch. Output: public/TrustNest_HBL_Brochure.pdf

Branding + licence details are sourced from the branch FSSAI registration
(Reg. No. 22426478000608). The brochure features a designed page background,
a hero banner, feature grid, membership plans, and a sample Bill of Supply.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "TrustNest_HBL_Brochure.pdf")

# ── Palette ──────────────────────────────────────────────────────────────────
GREEN   = colors.HexColor("#16a34a")
DGREEN  = colors.HexColor("#14532d")
MGREEN  = colors.HexColor("#22c55e")
LGREEN  = colors.HexColor("#dcfce7")
BG      = colors.HexColor("#f6faf7")
LGREY   = colors.HexColor("#eef2f1")
GREY    = colors.HexColor("#5b6b66")
DARK    = colors.HexColor("#1f2937")
AMBER   = colors.HexColor("#d97706")
WHITE   = colors.white

# ── Branch details (from FSSAI licence) ──────────────────────────────────────
BRANCH       = "Veppampattu Herbalife Nutrition Club"
PROPRIETOR   = "S K C Yoganathan"
FSSAI        = "22426478000608"
ADDRESS      = ("No 7, Nehru Street, Near Mannoliamman Kovil, Veppampattu, "
                "PO: Veppambattu, Tiruvallur, Tamil Nadu - 602024")
PHONE        = "8056497843"
EMAIL        = "pooprav26@gmail.com"
PORTAL       = "trustnest-tsgz.vercel.app/hbl"

PAGE_W, PAGE_H = A4

# ── Background painter ────────────────────────────────────────────────────────
def paint_background(canvas, doc):
    canvas.saveState()

    # Soft page wash
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    # Decorative faint circles (top-right + bottom-left leaf motif)
    canvas.setFillColor(MGREEN)
    canvas.setFillAlpha(0.07)
    canvas.circle(PAGE_W - 1.0 * cm, PAGE_H - 1.5 * cm, 4.2 * cm, stroke=0, fill=1)
    canvas.circle(PAGE_W - 3.5 * cm, PAGE_H - 0.2 * cm, 2.4 * cm, stroke=0, fill=1)
    canvas.setFillColor(GREEN)
    canvas.setFillAlpha(0.06)
    canvas.circle(0.5 * cm, 3.5 * cm, 4.8 * cm, stroke=0, fill=1)
    canvas.circle(3.2 * cm, 1.0 * cm, 2.0 * cm, stroke=0, fill=1)
    canvas.setFillAlpha(1)

    # Left accent bar
    canvas.setFillColor(GREEN)
    canvas.rect(0, 0, 0.22 * cm, PAGE_H, stroke=0, fill=1)

    # Footer band
    canvas.setFillColor(DGREEN)
    canvas.rect(0, 0, PAGE_W, 1.0 * cm, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(2 * cm, 0.36 * cm,
                      f"{BRANCH}  ·  FSSAI {FSSAI}")
    canvas.drawRightString(PAGE_W - 2 * cm, 0.36 * cm,
                           f"Powered by TrustNest HBL  ·  Page {doc.page}")
    canvas.restoreState()


# ── Document ──────────────────────────────────────────────────────────────────
doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=1.6 * cm, bottomMargin=1.6 * cm,
    title="TrustNest HBL — Veppampattu Nutrition Club", author="TrustNest HBL",
)
frame = Frame(doc.leftMargin, doc.bottomMargin,
              doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="bg", frames=[frame], onPage=paint_background)])

styles = getSampleStyleSheet()

def S(name, base="Normal", **kw):
    return ParagraphStyle(name, parent=styles[base], **kw)

H1      = S("H1", fontSize=26, textColor=WHITE,  alignment=TA_CENTER, leading=30, fontName="Helvetica-Bold")
HSUB    = S("HSUB", fontSize=11, textColor=LGREEN, alignment=TA_CENTER, leading=15)
H2      = S("H2", fontSize=15, textColor=DGREEN, leading=20, fontName="Helvetica-Bold")
Body    = S("Body", fontSize=9.5, textColor=GREY, spaceAfter=4, leading=14)
CB      = S("CB", fontSize=9.5, textColor=GREY, alignment=TA_CENTER, leading=14)
Pill    = S("Pill", fontSize=8.5, textColor=WHITE, alignment=TA_CENTER, leading=11, fontName="Helvetica-Bold")

CONTENT_W = doc.width

story = []

# ── HERO ──────────────────────────────────────────────────────────────────────
hero = Table([
    [Paragraph("HERBALIFE NUTRITION CLUB", HSUB)],
    [Paragraph("Veppampattu", H1)],
    [Paragraph("Healthy Active Lifestyle · Members · Shakes · Smart Billing", HSUB)],
], colWidths=[CONTENT_W])
hero.setStyle(TableStyle([
    ("BACKGROUND",    (0, 0), (-1, -1), DGREEN),
    ("ROUNDEDCORNERS", [12]),
    ("TOPPADDING",    (0, 0), (-1, 0), 16),
    ("BOTTOMPADDING", (0, -1), (-1, -1), 16),
    ("TOPPADDING",    (0, 1), (-1, 1), 2),
    ("BOTTOMPADDING", (0, 1), (-1, 1), 2),
    ("LEFTPADDING",   (0, 0), (-1, -1), 10),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
]))
story.append(hero)
story.append(Spacer(1, 0.25 * cm))

# Licence strip
lic = Table([[
    Paragraph(f"<b>Proprietor:</b> {PROPRIETOR}", S("L", fontSize=8.5, textColor=DARK, leading=12)),
    Paragraph(f"<b>FSSAI:</b> {FSSAI}", S("L", fontSize=8.5, textColor=DARK, leading=12)),
    Paragraph("<b>Reg. under FSS Act, 2006</b>", S("L", fontSize=8.5, textColor=GREEN, leading=12)),
]], colWidths=[CONTENT_W * 0.42, CONTENT_W * 0.33, CONTENT_W * 0.25])
lic.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), LGREEN),
    ("ROUNDEDCORNERS", [8]),
    ("TOPPADDING",   (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 7),
    ("LEFTPADDING",  (0, 0), (-1, -1), 12),
    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
]))
story.append(lic)
story.append(Spacer(1, 0.5 * cm))

# ── ABOUT ───────────────────────────────────────────────────────────────────
story.append(Paragraph("Welcome to your neighbourhood nutrition club", H2))
story.append(HRFlowable(width="100%", thickness=1.2, color=GREEN, spaceAfter=8))
story.append(Paragraph(
    f"{BRANCH} is your trusted local destination for Herbalife nutrition shakes, "
    "wellness coaching, and a supportive Healthy Active Lifestyle community in Veppampattu, "
    "Tiruvallur. Every visit, membership, order, and shake is managed on the TrustNest HBL "
    "platform — so your records, invoices, and renewals are always accurate and paperless.", Body))
story.append(Spacer(1, 0.4 * cm))

# ── FEATURE GRID ──────────────────────────────────────────────────────────────
story.append(Paragraph("What members enjoy", H2))
story.append(HRFlowable(width="100%", thickness=1.2, color=GREEN, spaceAfter=8))

features = [
    ("Digital Membership Card", "Unique barcode card (e.g. VEP-0001) for instant club check-in."),
    ("Daily Shake Tracker",     "Log every shake; track your nutrition program day by day."),
    ("Easy Ordering",           "Browse the product menu and place orders from your phone."),
    ("Bill of Supply / Invoice","Every order produces a proper PDF bill with FSSAI details."),
    ("Renewal Reminders",       "WhatsApp nudges 7 days before your membership expires."),
    ("Member Portal",           "View profile, order history, QR card and download bills anytime."),
]
fcells = []
for i in range(0, len(features), 2):
    row = []
    for j in (i, i + 1):
        if j < len(features):
            t, d = features[j]
            row.append([
                Paragraph(f"<b>{t}</b>", S("FT", fontSize=9.5, textColor=DGREEN, leading=13)),
                Paragraph(d, S("FD", fontSize=8.5, textColor=GREY, leading=12)),
            ])
        else:
            row.append("")
    fcells.append(row)
ftbl = Table(fcells, colWidths=[CONTENT_W / 2, CONTENT_W / 2])
ftbl.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), WHITE),
    ("BOX",          (0, 0), (-1, -1), 0.5, LGREY),
    ("INNERGRID",    (0, 0), (-1, -1), 0.5, LGREY),
    ("TOPPADDING",   (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 9),
    ("LEFTPADDING",  (0, 0), (-1, -1), 11),
    ("RIGHTPADDING", (0, 0), (-1, -1), 11),
    ("VALIGN",       (0, 0), (-1, -1), "TOP"),
]))
story.append(ftbl)
story.append(Spacer(1, 0.5 * cm))

# ── MEMBERSHIP PLANS ──────────────────────────────────────────────────────────
story.append(Paragraph("Membership plans", H2))
story.append(HRFlowable(width="100%", thickness=1.2, color=GREEN, spaceAfter=8))

plans = [
    [Paragraph("<b>Plan</b>", Pill), Paragraph("<b>Duration</b>", Pill), Paragraph("<b>Ideal for</b>", Pill)],
    ["Basic",    "1 month",   "Trying the program"],
    ["Silver",   "3 months",  "Building the habit"],
    ["Gold",     "6 months",  "Committed members"],
    ["Platinum", "12 months", "Best value, full year"],
]
prows = [plans[0]]
for r in plans[1:]:
    prows.append([
        Paragraph(r[0], S("P0", fontSize=9.5, textColor=DGREEN, fontName="Helvetica-Bold")),
        Paragraph(r[1], S("P1", fontSize=9.5, textColor=GREY)),
        Paragraph(r[2], S("P2", fontSize=9.5, textColor=GREY)),
    ])
ptbl = Table(prows, colWidths=[CONTENT_W * 0.25, CONTENT_W * 0.25, CONTENT_W * 0.5])
ptbl.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, 0), GREEN),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LGREY]),
    ("BOX",          (0, 0), (-1, -1), 0.5, LGREY),
    ("INNERGRID",    (0, 0), (-1, -1), 0.5, WHITE),
    ("TOPPADDING",   (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 7),
    ("LEFTPADDING",  (0, 0), (-1, -1), 11),
    ("RIGHTPADDING", (0, 0), (-1, -1), 11),
    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
]))
story.append(ptbl)
story.append(Spacer(1, 0.5 * cm))

# ── SAMPLE BILL OF SUPPLY ─────────────────────────────────────────────────────
sample_block = []
sample_block.append(Paragraph("Sample bill — what you receive", H2))
sample_block.append(HRFlowable(width="100%", thickness=1.2, color=GREEN, spaceAfter=8))

# Mock bill header
bill_head = Table([[
    Paragraph("<b>Herbalife Nutrition Club</b>", S("BH", fontSize=10, textColor=WHITE, leading=13)),
    Paragraph("BILL OF SUPPLY", S("BH2", fontSize=11, textColor=WHITE, alignment=TA_LEFT, leading=13, fontName="Helvetica-Bold")),
]], colWidths=[CONTENT_W * 0.6, CONTENT_W * 0.4])
bill_head.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), GREEN),
    ("TOPPADDING",   (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
    ("LEFTPADDING",  (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("ALIGN",        (1, 0), (1, 0), "RIGHT"),
    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
]))
sample_block.append(bill_head)

# Seller line
seller = Table([[Paragraph(
    f"<b>{PROPRIETOR}</b>  ·  {ADDRESS}<br/>FSSAI No: {FSSAI}  |  GST: Not Registered (Bill of Supply)  |  Ph: {PHONE}",
    S("SL", fontSize=7.5, textColor=GREY, leading=11))]], colWidths=[CONTENT_W])
seller.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), LGREY),
    ("TOPPADDING",   (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
    ("LEFTPADDING",  (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
]))
sample_block.append(seller)

# Mock line items
items = [
    ["SL", "Item", "Qty", "Rate", "Amount"],
    ["1", "Formula 1 Nutritional Shake Mix", "1", "2,375.00", "2,375.00"],
    ["2", "Afresh Energy Drink (Lemon)", "1", "1,015.00", "1,015.00"],
    ["3", "Personalized Protein Powder", "1", "1,720.00", "1,720.00"],
]
hdr = [Paragraph(f"<b>{c}</b>", S("IH", fontSize=8, textColor=WHITE, leading=11)) for c in items[0]]
irows = [hdr]
for r in items[1:]:
    irows.append([
        Paragraph(r[0], S("I0", fontSize=8, textColor=DARK)),
        Paragraph(r[1], S("I1", fontSize=8, textColor=DARK)),
        Paragraph(r[2], S("I2", fontSize=8, textColor=DARK, alignment=TA_CENTER)),
        Paragraph(r[3], S("I3", fontSize=8, textColor=DARK, alignment=TA_LEFT)),
        Paragraph(r[4], S("I4", fontSize=8, textColor=DARK, alignment=TA_LEFT)),
    ])
irows.append([
    "", "", "", Paragraph("<b>Total</b>", S("IT", fontSize=8.5, textColor=DGREEN)),
    Paragraph("<b>Rs. 5,110.00</b>", S("ITV", fontSize=8.5, textColor=DGREEN)),
])
itbl = Table(irows, colWidths=[CONTENT_W * 0.08, CONTENT_W * 0.52, CONTENT_W * 0.10, CONTENT_W * 0.15, CONTENT_W * 0.15])
itbl.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, 0), DGREEN),
    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, colors.HexColor("#f3faf5")]),
    ("BACKGROUND",   (0, -1), (-1, -1), LGREEN),
    ("BOX",          (0, 0), (-1, -1), 0.5, LGREY),
    ("INNERGRID",    (0, 0), (-1, -2), 0.4, LGREY),
    ("LINEABOVE",    (0, -1), (-1, -1), 0.6, GREEN),
    ("TOPPADDING",   (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ("LEFTPADDING",  (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
]))
sample_block.append(itbl)
sample_block.append(Spacer(1, 2))
sample_block.append(Paragraph(
    "Bill of Supply: Seller is not registered under GST (turnover within exemption limit). "
    "No tax is charged. This is a computer-generated bill.",
    S("BN", fontSize=7, textColor=GREY, leading=10)))
story.append(KeepTogether(sample_block))
story.append(Spacer(1, 0.5 * cm))

# ── VISIT US / CTA ────────────────────────────────────────────────────────────
visit = Table([
    [Paragraph("Visit us in Veppampattu", S("V1", fontSize=14, textColor=WHITE, alignment=TA_CENTER, leading=18, fontName="Helvetica-Bold"))],
    [Paragraph(ADDRESS, S("V2", fontSize=9, textColor=LGREEN, alignment=TA_CENTER, leading=13))],
    [Paragraph(f"Call / WhatsApp: {PHONE}  ·  {EMAIL}", S("V3", fontSize=9, textColor=WHITE, alignment=TA_CENTER, leading=13))],
    [Paragraph(f"Member portal: {PORTAL}", S("V4", fontSize=9, textColor=LGREEN, alignment=TA_CENTER, leading=13))],
], colWidths=[CONTENT_W])
visit.setStyle(TableStyle([
    ("BACKGROUND",   (0, 0), (-1, -1), GREEN),
    ("ROUNDEDCORNERS", [12]),
    ("TOPPADDING",   (0, 0), (-1, 0), 14),
    ("BOTTOMPADDING",(0, -1), (-1, -1), 14),
    ("TOPPADDING",   (0, 1), (-1, -1), 2),
    ("LEFTPADDING",  (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
]))
story.append(visit)

doc.build(story)
print(f"PDF saved: {os.path.abspath(OUT)}")
