"""
Generate TrustNest HBL PDF brochure for download inside the app.
Output: public/TrustNest_HBL_Brochure.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "TrustNest_HBL_Brochure.pdf")

GREEN  = colors.HexColor("#16a34a")
DGREEN = colors.HexColor("#14532d")
LGREY  = colors.HexColor("#f1f5f9")
GREY   = colors.HexColor("#64748b")
AMBER  = colors.HexColor("#d97706")
WHITE  = colors.white

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

styles = getSampleStyleSheet()

def S(name, base="Normal", **kw):
    return ParagraphStyle(name, parent=styles[base], **kw)

H1 = S("H1", fontSize=28, textColor=WHITE,    alignment=TA_CENTER, spaceAfter=4,  leading=34)
H2 = S("H2", fontSize=18, textColor=DGREEN,   alignment=TA_CENTER, spaceAfter=6,  leading=24)
H3 = S("H3", fontSize=13, textColor=DGREEN,   spaceAfter=4,  leading=18, fontName="Helvetica-Bold")
Body = S("Body", fontSize=10, textColor=GREY, spaceAfter=4, leading=15)
Bullet = S("Bullet", fontSize=10, textColor=GREY, leftIndent=14, spaceAfter=3, leading=14)
Caption = S("Cap", fontSize=8, textColor=GREY, alignment=TA_CENTER)
TagLine = S("TL", fontSize=12, textColor=WHITE, alignment=TA_CENTER, leading=18)
CentBody = S("CB", fontSize=10, textColor=GREY, alignment=TA_CENTER, spaceAfter=4, leading=15)

story = []

# ── HERO BANNER ─────────────────────────────────────────────────────────────
banner = Table([[
    Paragraph("TrustNest HBL", H1),
]], colWidths=[17*cm])
banner.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), GREEN),
    ("ROUNDEDCORNERS", [10]),
    ("TOPPADDING",   (0,0), (-1,-1), 18),
    ("BOTTOMPADDING",(0,0), (-1,-1), 6),
    ("LEFTPADDING",  (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
]))
story.append(banner)
story.append(Spacer(1, 0.3*cm))

tagline_tbl = Table([[
    Paragraph("Smart Club Management for Herbalife Nutrition Clubs", TagLine),
]], colWidths=[17*cm])
tagline_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), DGREEN),
    ("TOPPADDING",   (0,0), (-1,-1), 10),
    ("BOTTOMPADDING",(0,0), (-1,-1), 10),
    ("LEFTPADDING",  (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
]))
story.append(tagline_tbl)
story.append(Spacer(1, 0.6*cm))

# ── WHAT IS TRUSTNEST HBL ───────────────────────────────────────────────────
story.append(Paragraph("What is TrustNest HBL?", H2))
story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=8))
story.append(Paragraph(
    "TrustNest HBL is a purpose-built digital platform that gives every Herbalife Nutrition Club "
    "a professional, paperless operations system — members, orders, inventory, attendance, and "
    "reporting — accessible from any smartphone, tablet, or computer.", Body))
story.append(Spacer(1, 0.4*cm))

# ── KEY FEATURES GRID ───────────────────────────────────────────────────────
story.append(Paragraph("Platform Features", H2))
story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=8))

features = [
    ("Member Management",    "Digital profiles, renewal tracking, membership cards with unique barcodes"),
    ("Barcode Check-In",     "Admin scans physical barcode on member card — instant attendance log"),
    ("Order & Billing",      "Product catalog, order management, PDF invoices with GST/FSSAI details"),
    ("Shake Tracker",        "Daily shake log per member, helping clubs track nutrition program adherence"),
    ("Follow-Up System",     "Automated renewal reminders, WhatsApp messaging with one click"),
    ("Inventory Control",    "Product stock tracking with low-stock alerts"),
    ("Reports & Analytics",  "Daily/weekly/monthly revenue, check-in trends, member growth"),
    ("Multi-Branch Ready",   "One deployment runs unlimited club branches, each fully isolated"),
    ("Member Self-Service",  "Members view their profile, order history, download invoices, QR card"),
    ("Mobile-First Design",  "Responsive UI works flawlessly on any smartphone browser"),
]

feat_data = []
for i in range(0, len(features), 2):
    row = []
    for j in [i, i+1]:
        if j < len(features):
            title, desc = features[j]
            cell = [Paragraph(f"<b>{title}</b>", S("FT", fontSize=10, textColor=DGREEN, leading=14)),
                    Paragraph(desc, S("FD", fontSize=9, textColor=GREY, leading=13))]
            row.append(cell)
        else:
            row.append("")
    feat_data.append(row)

feat_tbl = Table(feat_data, colWidths=[8.3*cm, 8.3*cm], rowHeights=None)
feat_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), LGREY),
    ("TOPPADDING",   (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("GRID",         (0,0), (-1,-1), 0.5, WHITE),
    ("VALIGN",       (0,0), (-1,-1), "TOP"),
]))
story.append(feat_tbl)
story.append(Spacer(1, 0.6*cm))

# ── MEMBER JOURNEY ──────────────────────────────────────────────────────────
story.append(Paragraph("Member Journey", H2))
story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=8))

steps = [
    ("1", "Admin creates member profile with name, phone, plan & expiry date"),
    ("2", "Member receives a unique barcode card (e.g. VPT-0001)"),
    ("3", "Member logs in via phone OTP on the member portal"),
    ("4", "Member views dashboard: profile, orders, history, QR/barcode"),
    ("5", "Admin scans barcode at club visit — check-in recorded instantly"),
    ("6", "Member places product orders; admin fulfills, invoice auto-generated"),
    ("7", "System alerts admin 7 days before membership expiry for renewal"),
]

step_data = [[Paragraph(f"<b>Step {s}</b>", S("SH", fontSize=10, textColor=WHITE, leading=13)), Paragraph(d, S("SD", fontSize=10, textColor=GREY, leading=14))] for s, d in steps]
step_tbl = Table(step_data, colWidths=[2.2*cm, 14.4*cm])
step_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (0,-1), GREEN),
    ("BACKGROUND",   (1,0), (1,-1), LGREY),
    ("TOPPADDING",   (0,0), (-1,-1), 7),
    ("BOTTOMPADDING",(0,0), (-1,-1), 7),
    ("LEFTPADDING",  (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("GRID",         (0,0), (-1,-1), 0.5, WHITE),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("ALIGN",        (0,0), (0,-1), "CENTER"),
]))
story.append(step_tbl)
story.append(Spacer(1, 0.6*cm))

# ── PRICING / ROI ───────────────────────────────────────────────────────────
story.append(Paragraph("Simple Pricing — Zero Surprises", H2))
story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=8))

pricing_data = [
    [Paragraph("<b>Plan</b>", S("PH", fontSize=11, textColor=WHITE)),
     Paragraph("<b>Price</b>", S("PH", fontSize=11, textColor=WHITE)),
     Paragraph("<b>Branches</b>", S("PH", fontSize=11, textColor=WHITE)),
     Paragraph("<b>Best For</b>", S("PH", fontSize=11, textColor=WHITE))],
    [Paragraph("Starter", S("PC", fontSize=10, textColor=DGREEN, fontName="Helvetica-Bold")),
     Paragraph("Free", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("1", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("New clubs getting started", S("PC2", fontSize=10, textColor=GREY))],
    [Paragraph("Club Pro", S("PC", fontSize=10, textColor=DGREEN, fontName="Helvetica-Bold")),
     Paragraph("Rs.999 / month", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("Up to 3", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("Growing clubs with multiple outlets", S("PC2", fontSize=10, textColor=GREY))],
    [Paragraph("Enterprise", S("PC", fontSize=10, textColor=DGREEN, fontName="Helvetica-Bold")),
     Paragraph("Custom", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("Unlimited", S("PC2", fontSize=10, textColor=GREY)),
     Paragraph("Distributors managing many clubs", S("PC2", fontSize=10, textColor=GREY))],
]
pricing_tbl = Table(pricing_data, colWidths=[3.5*cm, 4*cm, 3*cm, 6.1*cm])
pricing_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,0), GREEN),
    ("BACKGROUND",   (0,1), (-1,1), LGREY),
    ("BACKGROUND",   (0,2), (-1,2), WHITE),
    ("BACKGROUND",   (0,3), (-1,3), LGREY),
    ("TOPPADDING",   (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("GRID",         (0,0), (-1,-1), 0.5, WHITE),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
]))
story.append(pricing_tbl)
story.append(Spacer(1, 0.6*cm))

# ── WHY TRUSTNEST HBL ───────────────────────────────────────────────────────
story.append(Paragraph("Why Clubs Choose TrustNest HBL", H2))
story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=8))

reasons = [
    ("No Hardware Needed", "Works on any smartphone browser. No app install required."),
    ("GST & FSSAI Ready", "Invoices carry your GSTIN and FSSAI number automatically."),
    ("100% Data Privacy",  "Each club's data is fully isolated — no cross-tenant access."),
    ("Instant Setup",      "Create your branch and add members in under 10 minutes."),
    ("WhatsApp Native",    "Renewal reminders open WhatsApp with pre-filled message."),
    ("Always Up-to-Date",  "Cloud-hosted — updates deploy automatically, zero downtime."),
]

why_data = []
for i in range(0, len(reasons), 3):
    row = []
    for j in range(i, i+3):
        if j < len(reasons):
            title, desc = reasons[j]
            row.append([
                Paragraph(f"<b>{title}</b>", S("WT", fontSize=10, textColor=DGREEN, leading=14)),
                Paragraph(desc, S("WD", fontSize=9, textColor=GREY, leading=13))
            ])
        else:
            row.append("")
    why_data.append(row)

why_tbl = Table(why_data, colWidths=[5.5*cm, 5.5*cm, 5.6*cm])
why_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), LGREY),
    ("TOPPADDING",   (0,0), (-1,-1), 10),
    ("BOTTOMPADDING",(0,0), (-1,-1), 10),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("GRID",         (0,0), (-1,-1), 0.5, WHITE),
    ("VALIGN",       (0,0), (-1,-1), "TOP"),
]))
story.append(why_tbl)
story.append(Spacer(1, 0.6*cm))

# ── GET STARTED ─────────────────────────────────────────────────────────────
cta_tbl = Table([[
    Paragraph("Get Started Today", S("CTA", fontSize=16, textColor=WHITE, alignment=TA_CENTER, leading=22, fontName="Helvetica-Bold")),
]], colWidths=[17*cm])
cta_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), GREEN),
    ("TOPPADDING",   (0,0), (-1,-1), 14),
    ("BOTTOMPADDING",(0,0), (-1,-1), 6),
    ("LEFTPADDING",  (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
]))
story.append(cta_tbl)

cta_sub = Table([[
    Paragraph(
        "Visit trustnest-tsgz.vercel.app/hbl/admin  |  Create your branch in under 10 minutes",
        S("CTS", fontSize=10, textColor=WHITE, alignment=TA_CENTER, leading=16)),
]], colWidths=[17*cm])
cta_sub.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), DGREEN),
    ("TOPPADDING",   (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LEFTPADDING",  (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
]))
story.append(cta_sub)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph(
    "TrustNest HBL  ·  Powered by TrustNest Platform  ·  Built for Herbalife Nutrition Clubs in India",
    S("Footer", fontSize=8, textColor=GREY, alignment=TA_CENTER)))

doc.build(story)
print(f"PDF saved: {os.path.abspath(OUT)}")
