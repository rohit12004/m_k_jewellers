// services/user.service.js
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";

// Create user (hash password before save)
export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
    },
  });
}

// Compare password (like userSchema.methods.comparePassword)
export async function comparePassword(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
}

// Find user by email (during registration)
export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email
    },
  });
}

// Find user by ID
export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

//update email verified status
export async function updateUserEmailVerifiedStatus(id) {
  await prisma.user.update({
    where: { id },
    data: { isEmailVerified: true },
  });
}

//login user
export async function loginUser(email) {
  const getUser = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      email: email,
    },
    select: {
      id: true,
      email: true,
      password: true,
      isEmailVerified: true,
      role: true,
    },
  });

  // Return null (not a NextResponse) so callers can do `if (!getUser)` safely
  return getUser || null;

}

export async function updateUserPassword(email, newPassword) {
  // 2️⃣ Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3️⃣ Update the password in database
  const updatedUser = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

// Update user profile
export async function updateUserProfile(userId, data) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      avatarUrl: true,
      panCard: true,
      createdAt: true
    }
  })

  return updatedUser
}

