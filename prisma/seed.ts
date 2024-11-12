import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASS;

  if (!superAdminEmail || !superAdminPassword) {
    console.error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASS must be defined in .env"
    );
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: superAdminEmail,
    },
  });

  if (!existingAdmin) {
    console.log(`Creating superadmin with email: ${superAdminEmail}`);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: superAdminPassword,
        name: "Super Admin",
        role: "superadmin",
      },
    });
    console.log("Superadmin created successfully!");
  } else {
    console.log("Superadmin already exists!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
