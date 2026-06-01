/**
 * Seed / update the Veppampattu HBL branch (tenant) with its real licence details.
 *
 * Source: FSSAI Registration Certificate (Reg. No. 22426478000608, issued 20-05-2026).
 * The seller is a retailer with turnover within the GST exemption limit, so it has
 * no GSTIN — invoices for this branch are rendered as a "Bill of Supply".
 *
 * Usage: npm run hbl:seed-veppampattu
 * Idempotent: safe to run repeatedly (upsert by slug).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "veppampattu";

const DETAILS = {
  name: "Veppampattu Herbalife Nutrition Club",
  legalName: "S K C Yoganathan",
  address:
    "C/O Chinnaiah K, No 7, Nehru Street, Near Mannoliamman Kovil, Veppampattu, PO: Veppambattu, Tiruvallur, Tamil Nadu - 602024",
  email: "pooprav26@gmail.com",
  phone: "8056497843",
  gstin: "", // retailer, not registered under GST -> Bill of Supply
  fssai: "22426478000608",
};

async function main() {
  const existing = await prisma.hblTenant.findUnique({ where: { slug: SLUG } });

  const tenant = await prisma.hblTenant.upsert({
    where: { slug: SLUG },
    update: DETAILS,
    create: {
      slug: SLUG,
      adminPin: existing?.adminPin ?? process.env.HBL_VEPPAMPATTU_PIN ?? "1947",
      ...DETAILS,
    },
  });

  console.log("\nVeppampattu HBL branch is ready:");
  console.log(`  Branch:     ${tenant.name}`);
  console.log(`  Proprietor: ${tenant.legalName}`);
  console.log(`  FSSAI:      ${tenant.fssai}`);
  console.log(`  GSTIN:      ${tenant.gstin || "(none — Bill of Supply)"}`);
  console.log(`  Address:    ${tenant.address}`);
  console.log(`  Slug:       ${tenant.slug}`);
  console.log(`  Admin PIN:  ${tenant.adminPin}`);
  console.log("\nInvoices for this branch now carry these details automatically.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
