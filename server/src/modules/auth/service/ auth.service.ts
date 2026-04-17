import bcrypt from "bcrypt";
import prisma from "../../../core/database/prisma";
import { Role } from "@prisma/client";
import { generateToken } from "../../../core/utils/jwt";
import { OAuth2Client } from "google-auth-library";

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

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("Please login using Google ");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user
  };
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginUser = async (token: string) => {
  if (!token) {
    throw new Error("Token is required");
  }

  // Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error("Invalid Google token");
  }

  const { email, name, picture, sub } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || "Google User",
        role: Role.USER,
        googleId: sub,
      },
    });
  }

  const jwtToken = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token: jwtToken,
    user,
  };
};