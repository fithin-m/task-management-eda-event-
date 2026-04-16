import bcrypt from "bcrypt";
import prisma from "../../../core/database/prisma";
import { Role } from "@prisma/client";

export const createManagerService = async (data: any) => {
  const { name, email, password } = data;

  // check existing
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const manager = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.MANAGER, 
    }
  });

  return manager;
};

export const listManagersService = async () => {
  const managers = await prisma.user.findMany({
    where: { role: Role.MANAGER },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return managers;
};

export const listUsersService = async () => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users;
};