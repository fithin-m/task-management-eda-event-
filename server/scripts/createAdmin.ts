import prisma from "../src/core/database/prisma";
import bcrypt from "bcrypt";

async function createAdmin() {
  const email = "admin@gmail.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("⚠️ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created successfully");
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());