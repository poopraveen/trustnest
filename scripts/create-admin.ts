/**
 * Create or reset the platform admin (email/password login only).
 * Usage: npm run admin:create
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const emailArg = process.argv[2]?.trim();
const email =
  emailArg ||
  process.env.SEED_ADMIN_EMAIL?.trim() ||
  "admin@trustnest.in";
const password = process.env.SEED_ADMIN_PASSWORD?.trim() || "TrustNest@Admin1";

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      password: hash,
      name: "Platform Admin",
      emailVerified: new Date(),
      isVerified: true,
    },
    create: {
      email,
      name: "Platform Admin",
      password: hash,
      role: "ADMIN",
      emailVerified: new Date(),
      isVerified: true,
    },
  });

  console.log("\nAdmin account ready:");
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log("  Role:     ADMIN (can post marketplace products + /admin panel)");
  console.log("\nSign out and sign in again with email + password (not Google).");
  console.log("  Post product: /seller/products/new");
  console.log("  Admin panel:  /admin\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
