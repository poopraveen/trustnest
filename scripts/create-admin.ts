/**
 * Create or reset the platform admin (email/password login only).
 * Usage: npm run admin:create
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.SEED_ADMIN_EMAIL?.trim() || "admin@trustnest.local";
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
  console.log("\nSign in at http://localhost:3000/login (email + password, not Google).");
  console.log("Admin panel: http://localhost:3000/admin\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
