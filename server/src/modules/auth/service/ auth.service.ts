import bcrypt from "bcrypt";
import prisma from "../../../core/database/prisma";
import { Role } from "@prisma/client";
import { generateToken } from "../../../core/utils/jwt";

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.USER
    }
  });

  return user;
};


export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // 3. generate token
  const token = generateToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user
  };
};